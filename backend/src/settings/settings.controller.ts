import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AdminAllowlistGuard } from '../auth/admin-allowlist.guard';
import { ClerkAuthGuard } from '../auth/clerk-auth.guard';
import type { AuthenticatedRequest } from '../auth/auth.types';
import { UpdateBookingSettingsDto } from './dto/update-booking-settings.dto';
import { SettingsService, type BookingSettingsDto } from './settings.service';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('booking')
  async getBookingSettings(): Promise<BookingSettingsDto> {
    return this.settingsService.getBookingSettings();
  }

  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @UseGuards(ClerkAuthGuard, AdminAllowlistGuard)
  @Get('admin/booking')
  async getAdminBookingSettings(): Promise<BookingSettingsDto> {
    return this.settingsService.getBookingSettings();
  }

  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @UseGuards(ClerkAuthGuard, AdminAllowlistGuard)
  @Patch('admin/booking')
  async updateBookingSettings(
    @Req() request: AuthenticatedRequest,
    @Body() dto: UpdateBookingSettingsDto,
  ): Promise<BookingSettingsDto> {
    return this.settingsService.updateBookingSettings(
      {
        depositAmount: dto.depositAmount,
      },
      request.clerkAuth!.userId,
    );
  }
}
