import { Injectable } from '@nestjs/common';
import { EmailService } from './email.service';
import { ConfigService } from '@nestjs/config';
import { CreateContactDto } from './dto/create-contact.dto';
import { LoggerService } from '../common/logger.service';

@Injectable()
export class ContactService {
  constructor(
    private readonly emailService: EmailService, 
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
  ) {}

  async saveContactForm(
    contactData: CreateContactDto,
    file?: Express.Multer.File,
  ): Promise<any> {
    // TODO: Implement database saving logic
    // This is a placeholder implementation
    this.logger.log('Saving contact form to database');
    
    const formRecord = {
      id: Date.now().toString(),
      name: contactData.name,
      email: contactData.email,
      message: contactData.message,
      imagePath: file ? file.path : null,
      createdAt: new Date().toISOString(),
    };

    this.logger.log('Form record created', { formId: formRecord.id });
    
    // In a real implementation, you would save this to your database
    // using TypeORM or another ORM
    
    return formRecord;
  }

  async sendContactEmail(
    contactData: CreateContactDto,
    file?: Express.Multer.File,
  ): Promise<void> {
    await this.emailService.sendContactNotification(contactData, file);
  }
}
