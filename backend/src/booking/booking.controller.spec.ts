import { Test, TestingModule } from '@nestjs/testing';
import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';
import { LoggerService } from '../common/logger.service';
import { AuthModule } from '../auth/auth.module';

describe('BookingController', () => {
  let controller: BookingController;

  const bookingServiceMock = {
    getAllBookings: jest.fn(),
    createBooking: jest.fn(),
    processStripePayment: jest.fn(),
  };

  const loggerMock = {
    log: jest.fn(),
    debug: jest.fn(),
    error: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      imports: [AuthModule],
      controllers: [BookingController],
      providers: [
        { provide: BookingService, useValue: bookingServiceMock },
        { provide: LoggerService, useValue: loggerMock },
      ],
    }).compile();

    controller = module.get<BookingController>(BookingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('normalizes a valid phone number before creating a booking', async () => {
    const booking = { id: 'booking-1' } as any;
    bookingServiceMock.createBooking.mockResolvedValue(booking);
    bookingServiceMock.processStripePayment.mockResolvedValue({
      status: 'pending',
    });

    await controller.createBooking({
      customerName: 'Customer',
      customerEmail: 'customer@example.com',
      customerPhone: '(208) 960-4970',
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

    expect(bookingServiceMock.createBooking).toHaveBeenCalledWith(
      expect.objectContaining({ customerPhone: '+12089604970' }),
    );
  });

  it('does not misreport booking service failures as phone validation errors', async () => {
    bookingServiceMock.createBooking.mockRejectedValue(
      new Error('booking store unavailable'),
    );

    await expect(
      controller.createBooking({
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
      }),
    ).rejects.toThrow('booking store unavailable');

    expect(loggerMock.error).not.toHaveBeenCalled();
  });
});
