import { Injectable } from '@nestjs/common';
import { EmailService } from './email.service';
import { ConfigService } from '@nestjs/config';

interface ContactFormDto {
  name: string;
  email: string;
  message: string;
}

@Injectable()
export class ContactService {
  constructor(
    private readonly emailService: EmailService, 
    private readonly configService: ConfigService
  ) {}

  async saveContactForm(
    contactData: ContactFormDto,
    file?: Express.Multer.File,
  ): Promise<any> {
    // TODO: Implement database saving logic
    // This is a placeholder implementation
    console.log('Saving contact form to database...');
    
    const formRecord = {
      id: Date.now().toString(),
      name: contactData.name,
      email: contactData.email,
      message: contactData.message,
      imagePath: file ? file.path : null,
      createdAt: new Date().toISOString(),
    };

    console.log('Form record created:', formRecord);
    
    // In a real implementation, you would save this to your database
    // using TypeORM or another ORM
    
    return formRecord;
  }

  async sendContactEmail(
    contactData: ContactFormDto,
    file?: Express.Multer.File,
  ): Promise<void> {
    await this.emailService.sendContactNotification(contactData, file);
  }
}
