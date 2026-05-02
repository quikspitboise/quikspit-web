import { NextResponse } from 'next/server';
import { fetchPublicBookingSettings } from '@/lib/server/booking-settings-api';

export const dynamic = 'force-dynamic';

export async function GET() {
  const settings = await fetchPublicBookingSettings();
  return NextResponse.json(settings);
}
