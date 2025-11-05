import { Controller, Get, Post, Body, HttpCode, HttpStatus, BadRequestException } from '@nestjs/common';
import { BookingService, Booking } from './booking.service';
import { parsePhoneNumber, isValidPhoneNumber } from 'libphonenumber-js';
import { Throttle } from '@nestjs/throttler';
import { CreateBookingDto } from './dto/create-booking.dto';
import { LoggerService } from '../common/logger.service';

// Route becomes /api/bookings due to global prefix configured in main.ts
@Controller('bookings')
export class BookingController {
  constructor(
    private readonly bookingService: BookingService,
    private readonly logger: LoggerService,
  ) {}

  @Get()
  async getBookings(): Promise<{ success: boolean; message: string; data: Booking[] }> {
    this.logger.log('Fetching all bookings');
    const bookings = await this.bookingService.getAllBookings();
    
    return {
      success: true,
      message: 'Bookings retrieved successfully',
      data: bookings,
    };
  }

  // Stricter rate limit: 5 bookings per 10 minutes per IP
  @Throttle({ default: { limit: 5, ttl: 600000 } })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createBooking(@Body() bookingData: CreateBookingDto): Promise<{ success: boolean; message: string; data: { booking: Booking; payment: any } }> {
    this.logger.log('New booking request received');
    this.logger.debug('Booking data (sanitized)', { serviceType: bookingData.serviceType, preferredDate: bookingData.preferredDate });

    // Validate phone number
    if (!bookingData.customerPhone || bookingData.customerPhone.trim() === '') {
      throw new BadRequestException('Phone number is required');
    }

    // Check if phone number is valid (defaulting to US for now)
    const isValid = isValidPhoneNumber(bookingData.customerPhone, 'US');
    if (!isValid) {
      throw new BadRequestException(
        'Invalid phone number format. Please provide a valid US phone number (e.g., (208) 960-4970 or +1-208-960-4970)'
      );
    }

    // Parse and format the phone number to E.164 format
    try {
      const phoneNumber = parsePhoneNumber(bookingData.customerPhone, 'US');
      const formattedPhone = phoneNumber.formatInternational(); // or .format('E.164') for +12089604970
      
      // Update booking data with formatted phone
      const validatedBookingData = {
        ...bookingData,
        customerPhone: formattedPhone,
      };

      this.logger.log('Phone number validated successfully');

      // Create the booking record
      const booking = await this.bookingService.createBooking(validatedBookingData);
      
      // Process payment (placeholder)
      const paymentResult = await this.bookingService.processStripePayment(booking);
      
      return {
        success: true,
        message: 'Booking created successfully',
        data: {
          booking,
          payment: paymentResult,
        },
      };
    } catch (error) {
      this.logger.error('Phone validation error', error instanceof Error ? error.stack : '');
      throw new BadRequestException(
        'Failed to validate phone number. Please check the format and try again.'
      );
    }
  }
}
