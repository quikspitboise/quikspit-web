import * as nodemailer from 'nodemailer';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileValidationService } from '../common/file-validation.service';

interface ContactFormDto {
  name: string;
  email: string;
  message: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;
  private adminEmails: string[];

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST'),
      port: Number(this.configService.get<string>('SMTP_PORT')) || 587,
      secure: false,
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASS'),
      },
    });
    this.adminEmails = (this.configService.get<string>('ADMIN_EMAILS') || '')
      .split(',')
      .map((e) => e.trim())
      .filter(Boolean);
  }

  async sendContactNotification(
    contactData: ContactFormDto,
    file?: Express.Multer.File,
  ) {
    const safeName = contactData.name.replace(/[\r\n]+/g, ' ').trim();
    const safeFilename =
      FileValidationService.sanitizeFilename(file?.originalname || '') ||
      'contact-upload';
    const mailOptions: nodemailer.SendMailOptions = {
      from:
        this.configService.get<string>('SMTP_FROM') ||
        this.configService.get<string>('SMTP_USER'),
      to: this.adminEmails.length
        ? this.adminEmails
        : this.configService.get<string>('SMTP_USER'),
      subject: `New Contact Form Submission from ${safeName}`,
      text: `Name: ${contactData.name}\nEmail: ${contactData.email}\nMessage: ${contactData.message}\n${file ? `Image attached: ${file.originalname}` : 'No image attached'}`,
      attachments: file
        ? [
            {
              filename: safeFilename,
              content: file.buffer,
              contentType: file.mimetype,
            },
          ]
        : [],
    };
    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.log('Contact notification email sent');
    } catch (err) {
      this.logger.error('Failed to send contact notification email', err);
      throw err;
    }
  }
}
