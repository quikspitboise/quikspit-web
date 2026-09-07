import { ServiceUnavailableException } from '@nestjs/common';
import { StripeWebhookController } from './stripe-webhook.controller';

describe('StripeWebhookController', () => {
  const loggerMock = {
    error: jest.fn(),
    log: jest.fn(),
    warn: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.STRIPE_SECRET_KEY = 'sk_test_local';
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_local';
  });

  afterEach(() => {
    delete process.env.STRIPE_SECRET_KEY;
    delete process.env.STRIPE_WEBHOOK_SECRET;
  });

  it('returns a retryable failure when event processing fails', async () => {
    const controller = new StripeWebhookController(loggerMock as any);
    (controller as any).stripe = {
      webhooks: {
        constructEvent: jest.fn().mockReturnValue({
          type: 'payment_intent.succeeded',
          data: { object: { id: 'pi_local', metadata: {} } },
        }),
      },
    };
    jest
      .spyOn(controller as any, 'handlePaymentIntentSucceeded')
      .mockRejectedValue(new Error('local handler failure'));

    await expect(
      controller.handleWebhook(
        { rawBody: Buffer.from('{}') } as any,
        'signature',
      ),
    ).rejects.toThrow(ServiceUnavailableException);
  });
});
