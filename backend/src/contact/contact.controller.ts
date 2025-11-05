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
import { extname } from 'path';
import { ContactService } from './contact.service';
import { Throttle } from '@nestjs/throttler';
import { FileValidationService } from '../common/file-validation.service';
import { promises as fs } from 'fs';
import { join } from 'path';

interface ContactFormDto {
  name: string;
  email: string;
  message: string;
}

// Route becomes /api/contact due to global prefix configured in main.ts
@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

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
    @Body() contactData: ContactFormDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    console.log('=== Contact Form Submission ===');
    console.log('Form Data:', contactData);
    
    let savedFile: Express.Multer.File | undefined;
    
    if (file) {
      try {
        // Validate file with magic byte checking
        await FileValidationService.validateImageFile(file);
        
        // Save file to disk after validation
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = extname(file.originalname);
        const sanitizedOriginalName = FileValidationService.sanitizeFilename(
          file.originalname.replace(ext, ''),
        );
        const filename = `${sanitizedOriginalName}-${uniqueSuffix}${ext}`;
        const uploadDir = './uploads';
        const filePath = join(uploadDir, filename);
        
        // Ensure upload directory exists
        await fs.mkdir(uploadDir, { recursive: true });
        
        // Write file to disk
        await fs.writeFile(filePath, file.buffer);
        
        // Update file object with saved path
        savedFile = {
          ...file,
          filename,
          path: filePath,
        };
        
        console.log('✓ Image File Validated and Saved:', {
          originalName: file.originalname,
          filename,
          mimetype: file.mimetype,
          size: file.size,
          path: filePath,
        });
      } catch (error) {
        console.error('File validation error:', error);
        throw new BadRequestException(
          error instanceof Error ? error.message : 'File validation failed',
        );
      }
    } else {
      console.log('No image file uploaded');
    }

    // Process the contact form
    const result = await this.contactService.saveContactForm(contactData, savedFile);
    
    // Send email notification
    await this.contactService.sendContactEmail(contactData, savedFile);

    return {
      success: true,
      message: 'Contact form submitted successfully',
      data: result,
    };
  }
}
