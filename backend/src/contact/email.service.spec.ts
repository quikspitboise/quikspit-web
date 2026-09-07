import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import { EmailService } from './email.service';

jest.mock('nodemailer', () => ({
  createTransport: jest.fn(),
}));

describe('EmailService', () => {
  const createTransportMock = nodemailer.createTransport as jest.MockedFunction<
    typeof nodemailer.createTransport
  >;
  const sendMailMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    createTransportMock.mockReturnValue({ sendMail: sendMailMock } as any);
    sendMailMock.mockResolvedValue({ messageId: 'message-1' });
  });

  it('attaches the validated in-memory buffer instead of a persistent local path', async () => {
    const configService = {
      get: jest.fn(
        (key: string) =>
          ({
            SMTP_HOST: 'smtp.example.com',
            SMTP_USER: 'mailer@example.com',
            SMTP_PASS: 'password',
            ADMIN_EMAILS: 'admin@example.com',
          })[key],
      ),
    } as unknown as ConfigService;
    const service = new EmailService(configService);
    const buffer = Buffer.from('image bytes');

    await service.sendContactNotification(
      {
        name: 'Customer\nInjected Header',
        email: 'customer@example.com',
        message: 'Please call me',
      },
      {
        originalname: '../vehicle\nphoto.jpg',
        buffer,
        mimetype: 'image/jpeg',
      } as Express.Multer.File,
    );

    expect(sendMailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        subject: 'New Contact Form Submission from Customer Injected Header',
        attachments: [
          expect.objectContaining({
            filename: 'vehicle_photo.jpg',
            content: buffer,
            contentType: 'image/jpeg',
          }),
        ],
      }),
    );
    expect(sendMailMock.mock.calls[0][0].attachments[0]).not.toHaveProperty(
      'path',
    );
  });
});
