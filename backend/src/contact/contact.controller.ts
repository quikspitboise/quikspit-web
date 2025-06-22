import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { ContactService } from './contact.service';

interface ContactFormDto {
  name: string;
  email: string;
  message: string;
}

@Controller('api/contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          const filename = `${file.fieldname}-${uniqueSuffix}${ext}`;
          callback(null, filename);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
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
    @Body() contactData: ContactFormDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    console.log('=== Contact Form Submission ===');
    console.log('Form Data:', contactData);
    
    if (file) {
      console.log('Image File Details:', {
        originalName: file.originalname,
        filename: file.filename,
        mimetype: file.mimetype,
        size: file.size,
        path: file.path,
      });
    } else {
      console.log('No image file uploaded');
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
