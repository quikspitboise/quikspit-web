import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LoggerService } from '../common/logger.service';
import { AppSettingEntity } from './entities/app-setting.entity';

const BOOKING_SETTINGS_KEY = 'booking';
const DEFAULT_BOOKING_SETTINGS: BookingSettingsDto = {
  depositAmount: 0,
};

export type BookingSettingsDto = {
  depositAmount: number;
};

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(AppSettingEntity)
    private readonly settingsRepository: Repository<AppSettingEntity>,
    private readonly logger: LoggerService,
  ) {}

  async getBookingSettings(): Promise<BookingSettingsDto> {
    const setting = await this.settingsRepository.findOne({
      where: { key: BOOKING_SETTINGS_KEY },
    });

    return this.normalizeBookingSettings(setting?.value);
  }

  async updateBookingSettings(
    settings: BookingSettingsDto,
    adminUserId: string,
  ): Promise<BookingSettingsDto> {
    const normalizedSettings = this.normalizeBookingSettings(settings);

    await this.settingsRepository.save(
      this.settingsRepository.create({
        key: BOOKING_SETTINGS_KEY,
        value: normalizedSettings,
        updatedByUserId: adminUserId,
      }),
    );

    this.logger.log('Updated booking settings', {
      adminUserId,
      depositAmount: normalizedSettings.depositAmount,
    });

    return normalizedSettings;
  }

  private normalizeBookingSettings(value: unknown): BookingSettingsDto {
    if (!value || typeof value !== 'object') {
      return { ...DEFAULT_BOOKING_SETTINGS };
    }

    const depositAmount = Number(
      (value as Partial<BookingSettingsDto>).depositAmount,
    );

    return {
      depositAmount:
        Number.isFinite(depositAmount) && depositAmount >= 0
          ? Math.round(depositAmount * 100) / 100
          : DEFAULT_BOOKING_SETTINGS.depositAmount,
    };
  }
}
