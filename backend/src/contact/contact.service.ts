import { Injectable } from '@nestjs/common';
import { EmailService } from './email.service';
import { ConfigService } from '@nestjs/config';
import { CreateContactDto } from './dto/create-contact.dto';
import { LoggerService } from '../common/logger.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class ContactService {
  constructor(
    private readonly emailService: EmailService, 
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async saveContactForm(
    contactData: CreateContactDto,
    file?: Express.Multer.File,
  ): Promise<any> {
    // TODO: Implement database saving logic
    // This is a placeholder implementation
    this.logger.log('Saving contact form to database');
    
    let imageUrl: string | null = null;
    
    // Upload image to Cloudinary if provided
    if (file) {
      try {
        const uploadResult = await this.cloudinaryService.uploadBuffer(file.buffer, {
          folder: 'quickspit/uploads',
          publicId: `contact-${Date.now()}`,
          resourceType: 'image',
        });
        imageUrl = uploadResult.secureUrl;
        this.logger.log('Image uploaded to Cloudinary', { publicId: uploadResult.publicId });
      } catch (error) {
        this.logger.warn('Failed to upload image to Cloudinary', { error });
        // Continue without image - don't fail the whole request
      }
    }
    
    const formRecord = {
      id: Date.now().toString(),
      name: contactData.name,
      email: contactData.email,
      message: contactData.message,
      imageUrl, // Now stores Cloudinary URL instead of local path
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
