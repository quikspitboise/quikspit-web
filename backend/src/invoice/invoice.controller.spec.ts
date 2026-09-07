import { Test } from '@nestjs/testing';
import { InvoiceController } from './invoice.controller';
import { InvoiceService } from './invoice.service';
import { LoggerService } from '../common/logger.service';
import { ClerkAuthGuard } from '../auth/clerk-auth.guard';
import { AdminAllowlistGuard } from '../auth/admin-allowlist.guard';
import { AuthModule } from '../auth/auth.module';

describe('InvoiceController', () => {
  const invoiceServiceMock = {
    isAvailable: jest.fn().mockReturnValue(true),
    getConfig: jest.fn().mockReturnValue({}),
    getInvoice: jest.fn(),
    sendInvoice: jest.fn(),
    createInvoice: jest.fn(),
  };

  const loggerMock = {
    log: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    await Test.createTestingModule({
      imports: [AuthModule],
      controllers: [InvoiceController],
      providers: [
        { provide: InvoiceService, useValue: invoiceServiceMock },
        { provide: LoggerService, useValue: loggerMock },
      ],
    }).compile();
  });

  it('requires both Clerk authentication and the admin allowlist', () => {
    const guards = Reflect.getMetadata('__guards__', InvoiceController);

    expect(guards).toEqual(
      expect.arrayContaining([ClerkAuthGuard, AdminAllowlistGuard]),
    );
  });

  it('keeps the static config route ahead of the invoice ID route', () => {
    expect(
      Reflect.getMetadata('path', InvoiceController.prototype.getConfig),
    ).toBe('config');
    expect(
      Reflect.getMetadata('path', InvoiceController.prototype.getInvoice),
    ).toBe(':id');
  });
});
