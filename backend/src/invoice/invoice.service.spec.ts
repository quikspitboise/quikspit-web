import { InvoiceService } from './invoice.service';

describe('InvoiceService', () => {
  const loggerMock = {
    error: jest.fn(),
    log: jest.fn(),
    warn: jest.fn(),
  };
  const smsServiceMock = {
    sendInvoiceLink: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.STRIPE_SECRET_KEY = 'sk_test_local';
  });

  afterEach(() => {
    delete process.env.STRIPE_SECRET_KEY;
  });

  it('surfaces finalization failures instead of reporting a successful send', async () => {
    const service = new InvoiceService(
      loggerMock as any,
      smsServiceMock as any,
    );
    const finalizeInvoiceMock = jest
      .fn()
      .mockRejectedValue(new Error('Stripe finalization failed'));
    const sendInvoiceMock = jest.fn();

    (service as any).stripe = {
      invoices: {
        retrieve: jest.fn().mockResolvedValue({
          id: 'in_local',
          customer: 'cus_local',
        }),
        finalizeInvoice: finalizeInvoiceMock,
        sendInvoice: sendInvoiceMock,
      },
    };

    await expect(
      service.sendInvoice({ invoiceId: 'in_local' }),
    ).rejects.toThrow('Stripe finalization failed');
    expect(finalizeInvoiceMock).toHaveBeenCalledWith('in_local');
    expect(sendInvoiceMock).not.toHaveBeenCalled();
  });
});
