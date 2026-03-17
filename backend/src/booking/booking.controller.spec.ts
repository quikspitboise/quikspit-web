import { Test, TestingModule } from '@nestjs/testing';
import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';
import { LoggerService } from '../common/logger.service';

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
    const module: TestingModule = await Test.createTestingModule({
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
});
