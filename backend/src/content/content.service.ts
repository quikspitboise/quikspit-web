import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { DataSource, EntityManager, IsNull, Not } from 'typeorm';
import {
  CatalogContentDto,
  CreatePageDto,
  PageContentDto,
  QuoteDto,
  ReorderSectionsDto,
  RevisionQueryDto,
  SaveContentDraftDto,
} from './dto/content.dto';
import { ContentDocumentEntity } from './entities/content-document.entity';
import { ContentRevisionEntity } from './entities/content-revision.entity';
import { pageKey, validateContent } from './content.validation';

@Injectable()
export class ContentService {
  constructor(private readonly dataSource: DataSource) {}

  private documents(manager = this.dataSource.manager) {
    return manager.getRepository(ContentDocumentEntity);
  }

  async listAdmin() {
    const documents = await this.documents().find({ order: { key: 'ASC' } });
    return {
      documents: documents.map(({ draft, published, ...summary }) => ({
        ...summary,
        title: 'title' in draft ? draft.title : summary.key,
        hasUnpublishedChanges:
          JSON.stringify(draft) !== JSON.stringify(published),
      })),
    };
  }

  async getAdmin(key: string) {
    const document = await this.documents().findOneBy({ key });
    if (!document) throw new NotFoundException('Content document not found');
    return document;
  }

  private publicDocument(document: ContentDocumentEntity) {
    return {
      key: document.key,
      kind: document.kind,
      revisionId: document.publishedRevisionId,
      publishedAt: document.publishedAt,
      value: document.published!,
    };
  }

  async getPublic(key: string) {
    const document = await this.documents().findOne({
      where: { key, published: Not(IsNull()) },
    });
    if (!document) throw new NotFoundException('Published content not found');
    return this.publicDocument(document);
  }

  async listPublicPages() {
    const documents = await this.documents().find({
      where: { kind: 'page', published: Not(IsNull()) },
      order: { key: 'ASC' },
    });
    return {
      pages: documents.map((document) => this.publicDocument(document)),
    };
  }

  async getPublicBundle() {
    // One SQL statement gives readers a consistent snapshot of published content.
    const documents = await this.documents().find({
      where: { published: Not(IsNull()) },
      order: { key: 'ASC' },
    });
    return {
      documents: documents.map((document) => this.publicDocument(document)),
    };
  }

  async createPage(dto: CreatePageDto, userId: string) {
    const key = pageKey(dto.slug);
    const value = validateContent('page', dto.value);
    const result = await this.documents()
      .createQueryBuilder()
      .insert()
      .values({
        key,
        kind: 'page',
        draft: value,
        version: 1,
        updatedByUserId: userId,
      })
      .orIgnore()
      .returning('key')
      .execute();
    if (!result.raw.length) throw new ConflictException('Page already exists');
    return this.getAdmin(key);
  }

  private async mutate(
    key: string,
    expectedVersion: number,
    userId: string,
    change: (
      document: ContentDocumentEntity,
      manager: EntityManager,
    ) => Promise<void> | void,
  ) {
    return this.dataSource.transaction(async (manager) => {
      const repository = this.documents(manager);
      const document = await repository.findOne({
        where: { key },
        lock: { mode: 'pessimistic_write' },
      });
      if (!document) throw new NotFoundException('Content document not found');
      if (document.version !== expectedVersion) {
        throw new ConflictException({
          message: 'Content changed. Reload before saving.',
          currentVersion: document.version,
        });
      }
      await change(document, manager);
      document.version += 1;
      document.updatedByUserId = userId;
      return repository.save(document);
    });
  }

  saveDraft(key: string, dto: SaveContentDraftDto, userId: string) {
    return this.mutate(key, dto.expectedVersion, userId, (document) => {
      document.draft = validateContent(document.kind, dto.value);
    });
  }

  reorderSections(key: string, dto: ReorderSectionsDto, userId: string) {
    return this.mutate(key, dto.expectedVersion, userId, (document) => {
      if (document.kind !== 'page')
        throw new BadRequestException('Only pages have sections');
      const draft = document.draft as PageContentDto;
      const sections = new Map(
        draft.sections.map((section) => [section.id, section]),
      );
      if (
        dto.ids.length !== sections.size ||
        new Set(dto.ids).size !== sections.size ||
        dto.ids.some((id) => !sections.has(id))
      ) {
        throw new BadRequestException('Include every section ID exactly once');
      }
      document.draft = {
        ...draft,
        sections: dto.ids.map((id) => sections.get(id)!),
      };
    });
  }

  private async affectedPaths(key: string) {
    if (key.startsWith('page:'))
      return [key === 'page:home' ? '/' : `/${key.slice(5)}`];
    // Site facts and prices may appear on any page, including metadata and footer.
    const { pages } = await this.listPublicPages();
    return pages.map((page) =>
      page.key === 'page:home' ? '/' : `/${page.key.slice(5)}`,
    );
  }

  async publish(key: string, expectedVersion: number, userId: string) {
    const document = await this.mutate(
      key,
      expectedVersion,
      userId,
      async (document, manager) => {
        const value = validateContent(document.kind, document.draft);
        const id = randomUUID();
        const now = new Date();
        await manager.getRepository(ContentRevisionEntity).insert({
          id,
          documentKey: key,
          value,
          version: document.version + 1,
          action: 'publish',
          createdByUserId: userId,
          createdAt: now,
        });
        document.published = value;
        document.publishedRevisionId = id;
        document.publishedAt = now;
      },
    );
    return { document, affectedPaths: await this.affectedPaths(key) };
  }

  async unpublish(key: string, expectedVersion: number, userId: string) {
    const document = await this.mutate(
      key,
      expectedVersion,
      userId,
      async (document, manager) => {
        if (document.kind !== 'page')
          throw new BadRequestException(
            'Site and catalog cannot be unpublished',
          );
        if (!document.published)
          throw new BadRequestException('Page is not published');
        await manager.getRepository(ContentRevisionEntity).insert({
          id: randomUUID(),
          documentKey: key,
          value: document.published,
          version: document.version + 1,
          action: 'unpublish',
          createdByUserId: userId,
        });
        document.published = null;
        document.publishedRevisionId = null;
        document.publishedAt = null;
      },
    );
    return { document, affectedPaths: await this.affectedPaths(key) };
  }

  async listRevisions(key: string, query: RevisionQueryDto) {
    await this.getAdmin(key);
    const [revisions, total] = await this.dataSource
      .getRepository(ContentRevisionEntity)
      .findAndCount({
        where: { documentKey: key },
        select: {
          id: true,
          documentKey: true,
          version: true,
          action: true,
          createdByUserId: true,
          createdAt: true,
        },
        order: { version: 'DESC' },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      });
    return { revisions, total, page: query.page, limit: query.limit };
  }

  async getRevision(
    key: string,
    revisionId: string,
    manager = this.dataSource.manager,
  ) {
    const revision = await manager
      .getRepository(ContentRevisionEntity)
      .findOneBy({ id: revisionId, documentKey: key });
    if (!revision) throw new NotFoundException('Content revision not found');
    return revision;
  }

  restore(
    key: string,
    expectedVersion: number,
    revisionId: string,
    userId: string,
  ) {
    return this.mutate(
      key,
      expectedVersion,
      userId,
      async (document, manager) => {
        const revision = await this.getRevision(key, revisionId, manager);
        document.draft = validateContent(document.kind, revision.value);
      },
    );
  }

  async quote(dto: QuoteDto) {
    const document = await this.getPublic('catalog');
    if (
      dto.catalogRevisionId &&
      dto.catalogRevisionId !== document.revisionId
    ) {
      throw new ConflictException({
        message: 'Prices changed. Refresh the catalog.',
        catalogRevisionId: document.revisionId,
      });
    }
    const catalog = document.value as CatalogContentDto;
    const category = catalog.categories.find(
      (item) => item.id === dto.categoryId && item.enabled,
    );
    const pkg = category?.packages.find(
      (item) => item.id === dto.packageId && item.enabled,
    );
    const size = catalog.vehicleSizes.find(
      (item) => item.id === dto.vehicleSizeId && item.enabled,
    );
    if (!category || !pkg || !size)
      throw new BadRequestException(
        'Unknown or disabled package or vehicle size',
      );
    const lines = [
      {
        id: `${category.id}/${pkg.id}`,
        description: `${pkg.name} (${category.label})`,
        amountCents: pkg.basePriceCents,
      },
      {
        id: size.id,
        description: size.label,
        amountCents: size.surchargeCents,
      },
    ];
    for (const id of dto.addonIds) {
      const addon = catalog.addons.find(
        (item) => item.id === id && item.enabled,
      );
      if (!addon) throw new BadRequestException('Unknown or disabled add-on');
      lines.push({
        id: addon.id,
        description: addon.name,
        amountCents: addon.priceCents,
      });
    }
    const findService = (id: string, kind: 'coating' | 'correction') => {
      const service = catalog.ceramicServices.find(
        (item) => item.id === id && item.kind === kind && item.enabled,
      );
      if (!service || !pkg.ceramicEligible)
        throw new BadRequestException(
          'Service is unavailable for this package',
        );
      return service;
    };
    const coating = dto.coatingId
      ? findService(dto.coatingId, 'coating')
      : undefined;
    const correction = dto.correctionId
      ? findService(dto.correctionId, 'correction')
      : undefined;
    let minMinutes = pkg.duration.minMinutes;
    let maxMinutes = pkg.duration.maxMinutes;
    if (coating) {
      lines.push({
        id: coating.id,
        description: coating.name,
        amountCents: coating.priceCents,
      });
      minMinutes += coating.duration.minMinutes;
      maxMinutes += coating.duration.maxMinutes;
    }
    if (correction) {
      const included = coating?.includedCorrectionId
        ? catalog.ceramicServices.find(
            (item) => item.id === coating.includedCorrectionId,
          )
        : undefined;
      if (included && correction.priceCents < included.priceCents)
        throw new BadRequestException(
          'Correction upgrade price is below included correction',
        );
      lines.push({
        id: correction.id,
        description: correction.name,
        amountCents: correction.priceCents - (included?.priceCents ?? 0),
      });
      // A coating covers its included correction. A different correction is
      // additional work, even when only the price difference is charged.
      if (correction.id !== included?.id) {
        minMinutes += correction.duration.minMinutes;
        maxMinutes += correction.duration.maxMinutes;
      }
    }
    return {
      currency: catalog.currency,
      catalogRevisionId: document.revisionId,
      selection: dto,
      lineItems: lines,
      totalCents: lines.reduce((total, line) => total + line.amountCents, 0),
      duration: { minMinutes, maxMinutes },
      calLink: `${catalog.calUsername}/${category.calEventSlug}`,
    };
  }
}
