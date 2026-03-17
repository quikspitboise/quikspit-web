import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { ContactService } from './contact.service';
import { LoggerService } from '../common/logger.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { EmailService } from './email.service';

describe('ContactService', () => {
  let service: ContactService;

  const emailServiceMock = {
    sendContactNotification: jest.fn(),
  };

  const configServiceMock = {
    get: jest.fn(),
  };

  const loggerMock = {
    log: jest.fn(),
    warn: jest.fn(),
  };

  const cloudinaryServiceMock = {
    uploadBuffer: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContactService,
        { provide: EmailService, useValue: emailServiceMock },
        { provide: ConfigService, useValue: configServiceMock },
        { provide: LoggerService, useValue: loggerMock },
        { provide: CloudinaryService, useValue: cloudinaryServiceMock },
      ],
    }).compile();

    service = module.get<ContactService>(ContactService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
