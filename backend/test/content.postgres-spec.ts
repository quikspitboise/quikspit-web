import { INestApplication, UnauthorizedException } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { AuthService } from '../src/auth/auth.service';
import { configureMiddleware } from '../src/bootstrap';
import { LoggerService } from '../src/common/logger.service';
import {
  ContentAdminController,
  ContentController,
} from '../src/content/content.controller';
import { ContentService } from '../src/content/content.service';
import {
  CatalogContentDto,
  PageContentDto,
} from '../src/content/dto/content.dto';
import { ContentDocumentEntity } from '../src/content/entities/content-document.entity';
import { PostgresThrottlerStorage } from '../src/runtime/postgres-throttler.storage';
import { createPostgresTestContext } from './postgres-helper';

describe('content administration over HTTP and PostgreSQL', () => {
  let context: Awaited<ReturnType<typeof createPostgresTestContext>>;
  let app: INestApplication;
  let content: ContentService;
  const previousEnv = new Map(
    ['ENABLE_CSRF', 'CSRF_SECRET', 'CLERK_ADMIN_USER_IDS'].map((name) => [
      name,
      process.env[name],
    ]),
  );
  const logger = {
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  };
  const documentUrl = (key: string) => `/api/content/admin/documents/${key}`;
  const adminGet = (path: string) =>
    request(app.getHttpServer())
      .get(path)
      .set('Authorization', 'Bearer admin-token');
  const adminPost = (path: string, body: object) =>
    request(app.getHttpServer())
      .post(path)
      .set('Authorization', 'Bearer admin-token')
      .send(body);
  const save = (key: string, expectedVersion: number, value: unknown) =>
    request(app.getHttpServer())
      .put(`${documentUrl(key)}/draft`)
      .set('Authorization', 'Bearer admin-token')
      .send({ expectedVersion, value });

  beforeAll(async () => {
    context = await createPostgresTestContext();
    process.env.ENABLE_CSRF = 'true';
    process.env.CSRF_SECRET = 'content-integration-test-csrf-secret';
    process.env.CLERK_ADMIN_USER_IDS = 'content-admin';
    const module = await Test.createTestingModule({
      imports: [
        ThrottlerModule.forRoot({
          throttlers: [{ ttl: 60000, limit: 60 }],
          storage: new PostgresThrottlerStorage(context.dataSource),
        }),
      ],
      controllers: [ContentController, ContentAdminController],
      providers: [
        ContentService,
        AuthService,
        { provide: DataSource, useValue: context.dataSource },
        { provide: LoggerService, useValue: logger },
        { provide: APP_GUARD, useClass: ThrottlerGuard },
      ],
    }).compile();
    // Stub the Clerk authentication method and logging. Real admin guards,
    // middleware, validation, SQL transactions, migrations and production
    // PostgreSQL throttler storage run with the app's 60/minute default.
    jest
      .spyOn(module.get(AuthService), 'authenticateClerkRequest')
      .mockImplementation(async (req) => {
        const token = module.get(AuthService).getBearerToken(req);
        if (!['admin-token', 'member-token'].includes(token!))
          throw new UnauthorizedException();
        return {
          userId: token === 'admin-token' ? 'content-admin' : 'content-member',
          sessionId: 'session-content',
        };
      });
    content = module.get(ContentService);
    app = module.createNestApplication({ logger: false });
    configureMiddleware(app, logger as unknown as LoggerService, [
      'http://localhost:3000',
    ]);
    await app.init();
  });

  beforeEach(async () => {
    // This suite owns a random database schema. Each test gets fresh buckets,
    // without deleting another suite's counters or using trusted proxy headers.
    await context.dataSource.query('DELETE FROM request_limits');
  });

  afterAll(async () => {
    await app?.close();
    await context?.close();
    jest.restoreAllMocks();
    for (const [name, value] of previousEnv) {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
  });

  it('seeds published pages, business settings, and the current service catalog without exposing drafts or audit identity', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/content')
      .expect(200);
    expect(response.headers['cache-control']).toBe('no-store');
    expect(response.body.documents).toHaveLength(8);
    for (const document of response.body.documents) {
      expect(Object.keys(document).sort()).toEqual([
        'key',
        'kind',
        'publishedAt',
        'revisionId',
        'value',
      ]);
    }
    const pages = await request(app.getHttpServer())
      .get('/api/content/pages')
      .expect(200);
    expect(pages.body.pages).toHaveLength(6);
    await request(app.getHttpServer()).get('/api/content/site').expect(200);
    const catalog = await request(app.getHttpServer())
      .get('/api/content/catalog')
      .expect(200);
    expect(catalog.body.value.categories[0].packages[0].basePriceCents).toBe(
      20000,
    );
  });

  it('requires verified admin identity for all admin reads and mutations, with CSRF enabled', async () => {
    const reads = [
      '/api/content/admin/documents',
      documentUrl('page:home'),
      `${documentUrl('page:home')}/revisions`,
    ];
    for (const path of reads) {
      await request(app.getHttpServer()).get(path).expect(401);
      await request(app.getHttpServer())
        .get(path)
        .set('Authorization', 'Bearer member-token')
        .expect(404);
      await adminGet(path).expect(200);
    }
    const mutations: ['put' | 'post', string, object][] = [
      ['put', `${documentUrl('page:home')}/draft`, {}],
      ['post', `${documentUrl('page:home')}/publish`, {}],
      ['post', `${documentUrl('page:home')}/unpublish`, {}],
      ['post', `${documentUrl('page:home')}/reorder`, {}],
      ['post', `${documentUrl('page:home')}/restore`, {}],
      ['post', '/api/content/admin/pages', {}],
    ];
    for (const [method, path, body] of mutations) {
      await request(app.getHttpServer())
        [method](path)
        .set('Authorization', 'Bearer invalid-token')
        .send(body)
        .expect(401);
      await request(app.getHttpServer())
        [method](path)
        .set('Authorization', 'Bearer member-token')
        .send(body)
        .expect(404);
      await request(app.getHttpServer())
        [method](path)
        .set('Cookie', '__session=admin-token')
        .send(body)
        .expect(403);
      // Authorized requests reach validation, proving scoped bearer CSRF exemption.
      await request(app.getHttpServer())
        [method](path)
        .set('Authorization', 'Bearer admin-token')
        .send(body)
        .expect(400);
    }
    await request(app.getHttpServer())
      .post('/api/content/admin/arbitrary')
      .set('Authorization', 'Bearer admin-token')
      .send({})
      .expect(403);
  });

  it.each([
    'Foo.Bar',
    'admin',
    'api',
    'sign-in',
    'sign-up',
    'resources',
    'missing-page',
  ])(
    'returns 404 for unavailable public page %s while admin creation rejects invalid slugs',
    async (slug) => {
      await request(app.getHttpServer())
        .get(`/api/content/pages/${slug}`)
        .expect(404);
      if (slug !== 'missing-page') {
        const value = (await content.getAdmin('page:contact')).draft;
        await adminPost('/api/content/admin/pages', { slug, value }).expect(
          400,
        );
      }
    },
  );

  it('keeps drafts private, publishes atomically, and restores history to a draft without changing the live page', async () => {
    const initial = (await adminGet(documentUrl('page:about')).expect(200))
      .body;
    const summary = async () => {
      const response = await adminGet('/api/content/admin/documents').expect(
        200,
      );
      return response.body.documents.find(
        (document: { key: string }) => document.key === initial.key,
      );
    };
    expect(await summary()).toMatchObject({ hasUnpublishedChanges: false });
    const value = { ...initial.draft, title: 'Updated about title' };
    const draft = (await save(initial.key, initial.version, value).expect(200))
      .body;
    expect(draft.version).toBe(2);
    expect(draft.updatedByUserId).toBe('content-admin');
    expect(await summary()).toMatchObject({ hasUnpublishedChanges: true });
    expect(
      (await request(app.getHttpServer()).get('/api/content/pages/about')).body
        .value.title,
    ).toBe(initial.draft.title);
    const conflict = await save(initial.key, initial.version, value).expect(
      409,
    );
    expect(conflict.body).toMatchObject({ currentVersion: draft.version });
    expect((await content.getAdmin(initial.key)).draft).toEqual(value);
    const published = (
      await adminPost(`${documentUrl(initial.key)}/publish`, {
        expectedVersion: draft.version,
      }).expect(200)
    ).body;
    expect(published.document.version).toBe(3);
    expect(published.affectedPaths).toEqual(['/about']);
    expect(await summary()).toMatchObject({ hasUnpublishedChanges: false });
    expect(
      (await request(app.getHttpServer()).get('/api/content/pages/about')).body
        .value.title,
    ).toBe(value.title);
    const revisions = (
      await adminGet(
        `${documentUrl(initial.key)}/revisions?page=1&limit=1`,
      ).expect(200)
    ).body;
    expect(revisions).toMatchObject({ total: 2, page: 1, limit: 1 });
    expect(revisions.revisions[0]).not.toHaveProperty('value');
    const snapshot = (
      await adminGet(
        `${documentUrl(initial.key)}/revisions/${initial.publishedRevisionId}`,
      ).expect(200)
    ).body;
    expect(snapshot.value.title).toBe(initial.draft.title);
    const restored = (
      await adminPost(`${documentUrl(initial.key)}/restore`, {
        expectedVersion: 3,
        revisionId: initial.publishedRevisionId,
      }).expect(200)
    ).body;
    expect(restored.draft.title).toBe(initial.draft.title);
    expect(restored.published.title).toBe(value.title);
    expect(await summary()).toMatchObject({ hasUnpublishedChanges: true });
    await adminPost(`${documentUrl(initial.key)}/publish`, {
      expectedVersion: restored.version,
    }).expect(200);
    expect((await content.getPublic(initial.key)).value).toEqual(
      initial.published,
    );
    expect(await summary()).toMatchObject({ hasUnpublishedChanges: false });
    await adminGet(`${documentUrl(initial.key)}/revisions?limit=0`).expect(400);
    await adminGet(`${documentUrl(initial.key)}/revisions/not-a-uuid`).expect(
      400,
    );
  });

  it('reorders every section exactly once and applies ordering and visibility only on publication', async () => {
    const initial = await content.getAdmin('page:home');
    const ids = (initial.draft as PageContentDto).sections
      .map((section) => section.id)
      .reverse();
    await adminPost(`${documentUrl(initial.key)}/reorder`, {
      expectedVersion: initial.version,
      ids: ids.slice(1),
    }).expect(400);
    await adminPost(`${documentUrl(initial.key)}/reorder`, {
      expectedVersion: initial.version,
      ids: [ids[0], ...ids.slice(0, -1)],
    }).expect(400);
    const reordered = (
      await adminPost(`${documentUrl(initial.key)}/reorder`, {
        expectedVersion: initial.version,
        ids,
      }).expect(200)
    ).body;
    expect(
      reordered.draft.sections.map((section: { id: string }) => section.id),
    ).toEqual(ids);
    expect((await content.getPublic(initial.key)).value).toEqual(
      initial.published,
    );
    reordered.draft.sections[0].enabled = false;
    const hidden = (
      await save(initial.key, reordered.version, reordered.draft).expect(200)
    ).body;
    await adminPost(`${documentUrl(initial.key)}/publish`, {
      expectedVersion: hidden.version,
    }).expect(200);
    const live = (await content.getPublic(initial.key)).value as PageContentDto;
    expect(live.sections[0]).toMatchObject({ id: ids[0], enabled: false });
  });

  it('supports future page creation, private preview, publication, unpublication and scoped restores', async () => {
    const template = (await content.getAdmin('page:contact')).draft;
    await adminPost('/api/content/admin/pages', {
      slug: 'admin',
      value: template,
    }).expect(400);
    const created = (
      await adminPost('/api/content/admin/pages', {
        slug: 'fleet-detailing',
        value: template,
      }).expect(201)
    ).body;
    const summary = async () => {
      const response = await adminGet('/api/content/admin/documents').expect(
        200,
      );
      return response.body.documents.find(
        (document: { key: string }) => document.key === created.key,
      );
    };
    expect(await summary()).toMatchObject({ hasUnpublishedChanges: true });
    await request(app.getHttpServer())
      .get('/api/content/pages/fleet-detailing')
      .expect(404);
    await adminPost('/api/content/admin/pages', {
      slug: 'fleet-detailing',
      value: template,
    }).expect(409);
    const published = (
      await adminPost(`${documentUrl(created.key)}/publish`, {
        expectedVersion: 1,
      }).expect(200)
    ).body;
    expect(await summary()).toMatchObject({ hasUnpublishedChanges: false });
    await request(app.getHttpServer())
      .get('/api/content/pages/fleet-detailing')
      .expect(200);
    await adminPost(`${documentUrl('page:contact')}/restore`, {
      expectedVersion: 1,
      revisionId: published.document.publishedRevisionId,
    }).expect(404);
    await adminPost(`${documentUrl(created.key)}/unpublish`, {
      expectedVersion: 2,
    }).expect(200);
    await request(app.getHttpServer())
      .get('/api/content/pages/fleet-detailing')
      .expect(404);
    expect(await summary()).toMatchObject({ hasUnpublishedChanges: true });
    expect(
      (await content.listPublicPages()).pages.some(
        (page) => page.key === created.key,
      ),
    ).toBe(false);
    expect(
      (
        await content.listRevisions(created.key, { page: 1, limit: 20 })
      ).revisions.map((revision) => revision.action),
    ).toEqual(['unpublish', 'publish']);
    await adminPost(`${documentUrl('site')}/unpublish`, {
      expectedVersion: 1,
    }).expect(400);
  });

  it('rejects invalid content atomically and limits history reads', async () => {
    const initial = await content.getAdmin('page:pricing');
    const invalid = structuredClone(initial.draft) as PageContentDto;
    invalid.sections[0].fields.link = { href: 'javascript:alert(1)' };
    await save(initial.key, initial.version, invalid).expect(400);
    await save(initial.key, initial.version, {
      ...initial.draft,
      unknown: true,
    }).expect(400);
    expect((await content.getAdmin(initial.key)).version).toBe(initial.version);
    await adminGet(`${documentUrl(initial.key)}/revisions?limit=101`).expect(
      400,
    );
    await save('missing', 1, initial.draft).expect(404);
  });

  it('serializes conflicting writes across independent database connections', async () => {
    const initial = await content.getAdmin('page:contact');
    const other = new ContentService(await context.connect());
    const results = await Promise.allSettled([
      content.saveDraft(
        initial.key,
        {
          expectedVersion: initial.version,
          value: { ...initial.draft, title: 'First editor' },
        },
        'editor-one',
      ),
      other.saveDraft(
        initial.key,
        {
          expectedVersion: initial.version,
          value: { ...initial.draft, title: 'Second editor' },
        },
        'editor-two',
      ),
    ]);
    expect(
      results.filter((result) => result.status === 'fulfilled'),
    ).toHaveLength(1);
    const rejected = results.find(
      (result) => result.status === 'rejected',
    ) as PromiseRejectedResult;
    expect(rejected.reason.getStatus()).toBe(409);
    expect(rejected.reason.getResponse()).toMatchObject({
      currentVersion: initial.version + 1,
    });
    expect((await other.getAdmin(initial.key)).version).toBe(
      initial.version + 1,
    );
    // New service instances read persisted state, rather than process memory.
    expect((await other.getAdmin(initial.key)).draft).toEqual(
      (await content.getAdmin(initial.key)).draft,
    );
  });

  it('calculates quotes using published cents, eligibility, correction upgrades and stable add-on IDs', async () => {
    const quote = {
      categoryId: 'combo',
      packageId: 'platinum',
      vehicleSizeId: 'large-suv',
      addonIds: ['pet-hair-removal'],
    };
    const base = await request(app.getHttpServer())
      .post('/api/content/quote')
      .send(quote)
      .expect(200);
    expect(base.body).toMatchObject({
      totalCents: 37500,
      currency: 'USD',
      calLink: 'quikspitboise/full-detail',
      duration: { minMinutes: 180, maxMinutes: 240 },
    });
    const coating = await request(app.getHttpServer())
      .post('/api/content/quote')
      .send({
        ...quote,
        coatingId: 'graphene-coating',
        correctionId: 'paint-correction-2',
      })
      .expect(200);
    expect(coating.body).toMatchObject({
      totalCents: 142500,
      duration: { minMinutes: 480, maxMinutes: 780 },
    });
    expect(coating.body.lineItems.at(-1).amountCents).toBe(20000);
    const included = await request(app.getHttpServer())
      .post('/api/content/quote')
      .send({
        ...quote,
        coatingId: 'graphene-coating',
        correctionId: 'paint-correction-1',
      })
      .expect(200);
    expect(included.body).toMatchObject({
      totalCents: 122500,
      duration: { minMinutes: 360, maxMinutes: 540 },
    });
    expect(included.body.lineItems.at(-1).amountCents).toBe(0);
    const correction = await request(app.getHttpServer())
      .post('/api/content/quote')
      .send({ ...quote, correctionId: 'paint-correction-2' })
      .expect(200);
    expect(correction.body.totalCents).toBe(102500);
    for (const selection of [
      { ...quote, packageId: 'silver', coatingId: 'graphene-coating' },
      { ...quote, addonIds: ['missing'] },
      { ...quote, addonIds: ['pet-hair-removal', 'pet-hair-removal'] },
      { ...quote, vehicleSizeId: 'missing' },
      { ...quote, totalCents: 1 },
    ])
      await request(app.getHttpServer())
        .post('/api/content/quote')
        .send(selection)
        .expect(400);
  });

  it('adds the full selected correction price and duration when the coating includes none', async () => {
    const initial = await content.getAdmin('catalog');
    const value = structuredClone(initial.draft) as CatalogContentDto;
    const coating = value.ceramicServices.find(
      (service) => service.id === 'graphene-coating',
    )!;
    delete coating.includedCorrectionId;
    const draft = await content.saveDraft(
      initial.key,
      {
        expectedVersion: initial.version,
        value: value as unknown as Record<string, unknown>,
      },
      'content-admin',
    );
    const published = await content.publish(
      initial.key,
      draft.version,
      'content-admin',
    );
    try {
      const response = await request(app.getHttpServer())
        .post('/api/content/quote')
        .send({
          categoryId: 'combo',
          packageId: 'platinum',
          vehicleSizeId: 'large-suv',
          addonIds: ['pet-hair-removal'],
          coatingId: 'graphene-coating',
          correctionId: 'paint-correction-2',
        })
        .expect(200);
      expect(response.body).toMatchObject({
        totalCents: 187500,
        duration: { minMinutes: 480, maxMinutes: 780 },
      });
      expect(response.body.lineItems.at(-1).amountCents).toBe(65000);
    } finally {
      const restored = await content.restore(
        initial.key,
        published.document.version,
        initial.publishedRevisionId!,
        'content-admin',
      );
      await content.publish(initial.key, restored.version, 'content-admin');
    }
  });

  it('publishes catalog edits once for all consumers and detects stale quote revisions', async () => {
    const initial = await content.getAdmin('catalog');
    const value = structuredClone(initial.draft) as CatalogContentDto;
    value.categories[0].packages[0].basePriceCents = 22001;
    value.addons[0].name = 'Renamed headlight service';
    value.addons[1].enabled = false;
    const draft = await content.saveDraft(
      initial.key,
      {
        expectedVersion: initial.version,
        value: value as unknown as Record<string, unknown>,
      },
      'content-admin',
    );
    const quote = {
      categoryId: 'combo',
      packageId: 'silver',
      vehicleSizeId: 'car',
      addonIds: [],
    };
    expect((await content.quote(quote)).totalCents).toBe(20000);
    const published = await content.publish(
      initial.key,
      draft.version,
      'content-admin',
    );
    expect(published.affectedPaths).toEqual(
      expect.arrayContaining(['/', '/pricing', '/booking', '/contact']),
    );
    expect((await content.quote(quote)).totalCents).toBe(22001);
    await request(app.getHttpServer())
      .post('/api/content/quote')
      .send({ ...quote, catalogRevisionId: initial.publishedRevisionId })
      .expect(409);
    const renamed = await content.quote({
      ...quote,
      addonIds: ['headlight-restoration'],
    });
    expect(renamed.lineItems.at(-1)).toMatchObject({
      description: 'Renamed headlight service',
      amountCents: 6500,
    });
    await request(app.getHttpServer())
      .post('/api/content/quote')
      .send({ ...quote, addonIds: ['bio-clean'] })
      .expect(400);
    const oldRevision = await content.getRevision(
      'catalog',
      initial.publishedRevisionId!,
    );
    expect(
      (oldRevision.value as CatalogContentDto).categories[0].packages[0]
        .basePriceCents,
    ).toBe(20000);
    // Earlier quote snapshots and immutable revision payloads retain agreed amounts.
    expect((await content.getPublic('catalog')).revisionId).toBe(
      renamed.catalogRevisionId,
    );
  });

  it('enforces quote rate limits even though quotes are public and do not mutate state', async () => {
    const quote = {
      categoryId: 'combo',
      packageId: 'silver',
      vehicleSizeId: 'car',
      addonIds: [],
    };
    const documents = await context.dataSource
      .getRepository(ContentDocumentEntity)
      .find({ order: { key: 'ASC' } });
    for (let index = 0; index < 30; index += 1)
      await request(app.getHttpServer())
        .post('/api/content/quote')
        .send(quote)
        .expect(200);
    const blocked = await request(app.getHttpServer())
      .post('/api/content/quote')
      .send(quote)
      .expect(429);
    expect(Number(blocked.headers['retry-after'])).toBeGreaterThan(0);
    expect(
      await context.dataSource.query('SELECT hits FROM request_limits'),
    ).toEqual([{ hits: 31 }]);
    // A route has its own bucket; exhausting quotes does not block public reads.
    await request(app.getHttpServer()).get('/api/content/catalog').expect(200);
    expect(
      await context.dataSource
        .getRepository(ContentDocumentEntity)
        .find({ order: { key: 'ASC' } }),
    ).toEqual(documents);
  });

  it('allows the global 60 admin requests per route and rejects the 61st', async () => {
    for (let index = 0; index < 60; index += 1)
      await adminGet('/api/content/admin/documents').expect(200);
    const blocked = await adminGet('/api/content/admin/documents').expect(429);
    expect(Number(blocked.headers['retry-after'])).toBeGreaterThan(0);
    expect(
      await context.dataSource.query('SELECT hits FROM request_limits'),
    ).toEqual([{ hits: 61 }]);
    // Another admin route has an independent default bucket.
    await adminGet(documentUrl('site')).expect(200);
  });
});
