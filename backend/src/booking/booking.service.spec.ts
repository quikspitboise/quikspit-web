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
});
