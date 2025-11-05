import { Controller, Get, Post, Body, HttpCode, HttpStatus, BadRequestException } from '@nestjs/common';
import { BookingService, Booking } from './booking.service';
import { parsePhoneNumber, isValidPhoneNumber } from 'libphonenumber-js';

interface CreateBookingDto {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  serviceType: string;
  preferredDate: string;
  preferredTime: string;
  vehicleInfo: {
    make: string;
    model: string;
    year: number;
    color: string;
  };
  specialRequests?: string;
}

// Route becomes /api/bookings due to global prefix configured in main.ts
@Controller('bookings')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Get()
  async getBookings(): Promise<{ success: boolean; message: string; data: Booking[] }> {
    console.log('Getting all bookings...');
    const bookings = await this.bookingService.getAllBookings();
    
    return {
      success: true,
      message: 'Bookings retrieved successfully',
      data: bookings,
    };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createBooking(@Body() bookingData: CreateBookingDto): Promise<{ success: boolean; message: string; data: { booking: Booking; payment: any } }> {
    console.log('=== New Booking Request ===');
    console.log('Booking Data:', bookingData);

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

      console.log('Validated phone number:', formattedPhone);

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
      console.error('Phone validation error:', error);
      throw new BadRequestException(
        'Failed to validate phone number. Please check the format and try again.'
      );
    }
  }
}
