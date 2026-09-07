import {
  Controller,
  Get,
  INestApplication,
  Post,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import type { Request } from 'express';
import Stripe from 'stripe';
import request from 'supertest';
import { AuthService } from '../auth/auth.service';
import { BookingController } from '../booking/booking.controller';
import { BookingService } from '../booking/booking.service';
import { StripeWebhookController } from '../booking/stripe-webhook.controller';
import { ContactController } from '../contact/contact.controller';
import { ContactService } from '../contact/contact.service';
import { GalleryController } from '../gallery/gallery.controller';
import { GalleryService } from '../gallery/gallery.service';
import { InvoiceController } from '../invoice/invoice.controller';
import { InvoiceService } from '../invoice/invoice.service';
import { SettingsController } from '../settings/settings.controller';
import { SettingsService } from '../settings/settings.service';
import { configureCsrfProtection } from './csrf-protection';
import { LoggerService } from './logger.service';

@Controller()
class TokenProtectedController {
  @Get('csrf-token')
  token(@Req() req: Request) {
    return { token: req.app.locals.generateCsrfToken(req, req.res) };
  }

  @Post('token-protected')
  mutate() {
    return { success: true };
  }
}

describe('CSRF policy over HTTP', () => {
  let app: INestApplication;
  const origin = 'https://quikspit.example';
  const webhookSecret = 'whsec_local_regression';
  const envNames = [
    'ENABLE_CSRF',
    'CSRF_SECRET',
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'CLERK_ADMIN_USER_IDS',
  ];
  const previousEnv = new Map(
    envNames.map((name) => [name, process.env[name]]),
  );
  const contact = {
    saveContactForm: jest.fn().mockResolvedValue({ id: 'contact-local' }),
    sendContactEmail: jest.fn().mockResolvedValue(undefined),
  };
  const booking = {
    createBooking: jest
      .fn()
      .mockResolvedValue({ id: 'booking-local', totalAmount: 50 }),
    processStripePayment: jest
      .fn()
      .mockResolvedValue({ status: 'pending', paymentId: null }),
  };

  beforeAll(async () => {
    process.env.ENABLE_CSRF = 'true';
    process.env.CSRF_SECRET = 'local-csrf-secret-for-http-tests';
    process.env.STRIPE_SECRET_KEY = 'sk_test_local';
    process.env.STRIPE_WEBHOOK_SECRET = webhookSecret;
    process.env.CLERK_ADMIN_USER_IDS = 'admin-local';

    const logger = {
      log: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
    };
    const module = await Test.createTestingModule({
      controllers: [
        StripeWebhookController,
        BookingController,
        ContactController,
        GalleryController,
        InvoiceController,
        SettingsController,
        TokenProtectedController,
      ],
      providers: [
        AuthService,
        { provide: LoggerService, useValue: logger },
        { provide: ContactService, useValue: contact },
        { provide: BookingService, useValue: booking },
        {
          provide: GalleryService,
          useValue: {
            create: jest.fn().mockResolvedValue({ id: 'gallery-local' }),
            update: jest.fn().mockResolvedValue({ id: 'gallery-local' }),
            replaceAssets: jest.fn().mockResolvedValue({ id: 'gallery-local' }),
            reorder: jest.fn().mockResolvedValue([]),
            remove: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: InvoiceService,
          useValue: {
            isAvailable: () => true,
            createInvoice: jest.fn().mockResolvedValue({ id: 'in_local' }),
            sendInvoice: jest.fn().mockResolvedValue({ id: 'in_local' }),
          },
        },
        {
          provide: SettingsService,
          useValue: {
            updateBookingSettings: jest
              .fn()
              .mockResolvedValue({ depositAmount: 50 }),
          },
        },
      ],
    }).compile();

    // Mock remote Clerk verification only. Both real route guards still run,
    // including the real administrator allowlist check.
    jest
      .spyOn(module.get(AuthService), 'authenticateClerkRequest')
      .mockImplementation(async (req) => {
        const token = module.get(AuthService).getBearerToken(req);
        if (token !== 'admin-token' && token !== 'member-token') {
          throw new UnauthorizedException();
        }
        return {
          userId: token === 'admin-token' ? 'admin-local' : 'member-local',
          sessionId: 'session-local',
        };
      });

    app = module.createNestApplication({ rawBody: true, logger: false });
    app.setGlobalPrefix('api');
    app.use(cookieParser());
    configureCsrfProtection(app, logger as unknown as LoggerService, [origin]);
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
    jest.restoreAllMocks();
    for (const [name, value] of previousEnv) {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
  });

  it('verifies a signed Stripe payload through the raw-body HTTP stack', async () => {
    const payload = JSON.stringify({
      id: 'evt_local',
      type: 'payment_intent.succeeded',
      data: { object: { id: 'pi_local', metadata: {} } },
    });
    const stripe = new Stripe('sk_test_local');
    const signature = stripe.webhooks.generateTestHeaderString({
      payload,
      secret: webhookSecret,
    });

    await request(app.getHttpServer())
      .post('/api/webhooks/stripe')
      .set('Content-Type', 'application/json')
      .set('stripe-signature', signature)
      .send(payload)
      .expect(200);

    await request(app.getHttpServer())
      .post('/api/webhooks/stripe')
      .set('Content-Type', 'application/json')
      .set('stripe-signature', signature)
      .send(payload.replace('pi_local', 'pi_altered'))
      .expect(400);

    await request(app.getHttpServer())
      .post('/api/webhooks/stripe')
      .send({})
      .expect(400);

    await request(app.getHttpServer())
      .post('/api/webhooks/stripe/another-route')
      .send({})
      .expect(403);
  });

  it('accepts public multipart contact only from an explicitly allowed browser origin', async () => {
    await request(app.getHttpServer())
      .post('/api/contact')
      .set('Origin', origin)
      .field('name', 'Local Customer')
      .field('email', 'customer@example.com')
      .field('message', 'Local integration test')
      .expect(200);
    expect(contact.saveContactForm).toHaveBeenCalledTimes(1);

    for (const untrustedOrigin of [
      undefined,
      'null',
      `${origin}.untrusted.example`,
    ]) {
      const submission = request(app.getHttpServer()).post('/api/contact');
      if (untrustedOrigin) submission.set('Origin', untrustedOrigin);
      await submission.field('name', 'Blocked').expect(403);
    }
    expect(contact.saveContactForm).toHaveBeenCalledTimes(1);
  });

  it('applies the public-origin policy through the real booking controller', async () => {
    const payload = {
      customerName: 'Local Customer',
      customerEmail: 'customer@example.com',
      customerPhone: '+12025550123',
      serviceType: 'Basic Wash Package',
      preferredDate: '2026-10-01',
      preferredTime: '10:00',
      vehicleInfo: { make: 'Test', model: 'Test', year: 2025, color: 'Black' },
    };
    await request(app.getHttpServer())
      .post('/api/bookings')
      .set('Origin', origin)
      .send(payload)
      .expect(201);

    for (const untrustedOrigin of [
      undefined,
      'null',
      `${origin}.untrusted.example`,
    ]) {
      const submission = request(app.getHttpServer()).post('/api/bookings');
      if (untrustedOrigin) submission.set('Origin', untrustedOrigin);
      await submission.send(payload).expect(403);
    }
    expect(booking.createBooking).toHaveBeenCalledTimes(1);
    expect(booking.processStripePayment).toHaveBeenCalledTimes(1);
  });

  const mutations = [
    ['post', '/api/gallery/admin/items', {}],
    ['patch', '/api/gallery/admin/items/gallery-local', {}],
    ['post', '/api/gallery/admin/items/gallery-local/assets', {}],
    ['post', '/api/gallery/admin/reorder', { ids: [] }],
    ['delete', '/api/gallery/admin/items/gallery-local', {}],
    ['patch', '/api/settings/admin/booking', { depositAmount: 50 }],
    ['post', '/api/invoices', { customerName: 'Local', lineItems: [] }],
    ['post', '/api/invoices/in_local/send', {}],
  ] as const;

  it.each(mutations)(
    'supports authenticated %s %s without CSRF cookies',
    async (method, path, body) => {
      const response = await request(app.getHttpServer())
        [method](path)
        .set('Authorization', 'Bearer admin-token')
        .send(body);
      expect(response.status).toBeGreaterThanOrEqual(200);
      expect(response.status).toBeLessThan(300);

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
    },
  );

  it('keeps other mutations token-protected, even with a bearer header or trusted origin', async () => {
    await request(app.getHttpServer())
      .post('/api/token-protected')
      .set('Authorization', 'Bearer admin-token')
      .set('Origin', origin)
      .expect(403);

    const client = request.agent(app.getHttpServer());
    const tokenResponse = await client.get('/api/csrf-token').expect(200);
    await client
      .post('/api/token-protected')
      .set('x-csrf-token', tokenResponse.body.token)
      .expect(201);
  });
});
