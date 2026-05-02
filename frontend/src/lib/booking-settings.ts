export type BookingSettings = {
  depositAmount: number;
};

export const DEFAULT_BOOKING_SETTINGS: BookingSettings = {
  depositAmount: 0,
};

export function normalizeBookingSettings(value: unknown): BookingSettings {
  if (!value || typeof value !== 'object') {
    return DEFAULT_BOOKING_SETTINGS;
  }

  const depositAmount = Number(
    (value as Partial<BookingSettings>).depositAmount,
  );

  return {
    depositAmount:
      Number.isFinite(depositAmount) && depositAmount >= 0
        ? Math.round(depositAmount * 100) / 100
        : DEFAULT_BOOKING_SETTINGS.depositAmount,
  };
}

export function hasBookingDeposit(depositAmount: number): boolean {
  return depositAmount >= 1;
}
