import { Controller, Get, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { BookingService, Booking } from './booking.service';

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

    // Create the booking record
    const booking = await this.bookingService.createBooking(bookingData);
    
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
  }
}
