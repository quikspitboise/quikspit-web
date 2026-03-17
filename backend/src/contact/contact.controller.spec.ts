import { Test, TestingModule } from '@nestjs/testing';
import { ContactController } from './contact.controller';
import { ContactService } from './contact.service';
import { LoggerService } from '../common/logger.service';

describe('ContactController', () => {
  let controller: ContactController;

  const contactServiceMock = {
    saveContactForm: jest.fn(),
    sendContactEmail: jest.fn(),
  };

  const loggerMock = {
    log: jest.fn(),
    error: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContactController],
      providers: [
        { provide: ContactService, useValue: contactServiceMock },
        { provide: LoggerService, useValue: loggerMock },
      ],
    }).compile();

    controller = module.get<ContactController>(ContactController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
