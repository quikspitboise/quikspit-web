import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ContactService } from './contact.service';
import { Throttle } from '@nestjs/throttler';
import { FileValidationService } from '../common/file-validation.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { LoggerService } from '../common/logger.service';

// Route becomes /api/contact due to global prefix configured in main.ts
@Controller('contact')
export class ContactController {
  constructor(
    private readonly contactService: ContactService,
    private readonly logger: LoggerService,
  ) {}

  // Stricter rate limit: 3 submissions per 5 minutes per IP
  @Throttle({ default: { limit: 3, ttl: 300000 } })
  @Post()
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(
    FileInterceptor('image', {
      storage: memoryStorage(), // Use memory storage to access buffer for validation
      fileFilter: (req, file, callback) => {
        // Basic extension check (magic byte check happens after upload)
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
          return callback(new Error('Only image files are allowed!'), false);
        }
        callback(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
      },
    }),
  )
  async submitContactForm(
    @Body() contactData: CreateContactDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    this.logger.log('Contact form submission received');

    if (file) {
      try {
        // Validate file with magic byte checking
        await FileValidationService.validateImageFile(file);

        this.logger.log('Image file validated', {
          filename: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
        });
      } catch (error) {
        this.logger.error(
          'File validation error',
          error instanceof Error ? error.stack : '',
        );
        throw new BadRequestException(
          error instanceof Error ? error.message : 'File validation failed',
        );
      }
    } else {
      this.logger.log('No image file uploaded');
    }

    // Process the contact form
    const result = await this.contactService.saveContactForm(contactData, file);

    // Send email notification
    await this.contactService.sendContactEmail(contactData, file);

    return {
      success: true,
      message: 'Contact form submitted successfully',
      data: result,
    };
  }
}
