import { Test, TestingModule } from '@nestjs/testing';
import { BookingService } from './booking.service';
import { LoggerService } from '../common/logger.service';

describe('BookingService', () => {
  let service: BookingService;

  const loggerMock = {
    log: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingService,
        { provide: LoggerService, useValue: loggerMock },
      ],
    }).compile();

    service = module.get<BookingService>(BookingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('returns a pending payment result until a real Stripe flow exists', async () => {
    const booking = await service.createBooking({
      customerName: 'Customer',
      customerEmail: 'customer@example.com',
      customerPhone: '+12089604970',
      serviceType: 'Basic Wash Package',
      preferredDate: '2026-09-06',
      preferredTime: '10:00',
      vehicleInfo: {
        make: 'Toyota',
        model: 'Camry',
        year: 2020,
        color: 'Silver',
      },
    });

    await expect(service.processStripePayment(booking)).resolves.toMatchObject({
      paymentId: null,
      status: 'pending',
      bookingId: booking.id,
    });
  });

  it('generates distinct booking IDs for bookings created in the same millisecond', async () => {
    const bookingData = {
      customerName: 'Customer',
      customerEmail: 'customer@example.com',
      customerPhone: '+12089604970',
      serviceType: 'Basic Wash Package',
      preferredDate: '2026-09-06',
      preferredTime: '10:00',
      vehicleInfo: {
        make: 'Toyota',
        model: 'Camry',
        year: 2020,
        color: 'Silver',
      },
    };

    const first = await service.createBooking(bookingData);
    const second = await service.createBooking(bookingData);

    expect(first.id).not.toBe(second.id);
  });
});
