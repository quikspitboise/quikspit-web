'use client';

import { useState, type FormEvent } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import {
  hasBookingDeposit,
  type BookingSettings,
} from '@/lib/booking-settings';

type BookingSettingsAdminProps = {
  initialSettings: BookingSettings;
};

type FeedbackState = {
  tone: 'success' | 'error';
  message: string;
} | null;

export function BookingSettingsAdmin({
  initialSettings,
}: BookingSettingsAdminProps) {
  const [depositAmount, setDepositAmount] = useState(
    initialSettings.depositAmount.toString(),
  );
  const [savedSettings, setSavedSettings] = useState(initialSettings);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState>(null);

  const parsedDepositAmount = Number(depositAmount);
  const depositEnabled =
    Number.isFinite(parsedDepositAmount) && hasBookingDeposit(parsedDepositAmount);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);

    if (!Number.isFinite(parsedDepositAmount) || parsedDepositAmount < 0) {
      setFeedback({
        tone: 'error',
        message: 'Deposit amount must be 0 or greater.',
      });
      return;
    }

    setBusy(true);
    const response = await fetch('/api/admin/settings/booking', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        depositAmount: parsedDepositAmount,
      }),
    });
    setBusy(false);

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as
        | { message?: string; error?: string }
        | null;
      setFeedback({
        tone: 'error',
        message:
          payload?.message || payload?.error || 'Unable to save booking settings.',
      });
      return;
    }

    const settings = (await response.json()) as BookingSettings;
    setSavedSettings(settings);
    setDepositAmount(settings.depositAmount.toString());
    setFeedback({
      tone: 'success',
      message: 'Booking settings saved.',
    });
  }

  return (
    <GlassCard className="p-6 lg:p-8" gradient="subtle">
      <div className="mb-6">
        <h2 className="font-display text-2xl text-white tracking-wide">
          Booking settings
        </h2>
        <p className="mt-2 text-sm text-neutral-400">
          Set the booking deposit shown in the scheduler and Cal.com notes.
          Amounts below $1 hide all deposit and balance text.
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="space-y-2 text-sm text-neutral-200">
          <span>Deposit amount</span>
          <div className="relative max-w-xs">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500">
              $
            </span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={depositAmount}
              onChange={(event) => setDepositAmount(event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-neutral-950/80 px-8 py-3 text-white outline-none transition focus:border-red-500"
            />
          </div>
        </label>

        <p className="text-xs text-neutral-500">
          Current saved deposit: ${savedSettings.depositAmount}. Deposit text is{' '}
          {depositEnabled ? 'visible' : 'hidden'} for this draft.
        </p>

        <button
          type="submit"
          disabled={busy}
          className="inline-flex items-center rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy ? 'Saving...' : 'Save booking settings'}
        </button>
      </form>

      {feedback && (
        <div
          className={`mt-5 rounded-2xl border px-4 py-3 text-sm ${
            feedback.tone === 'success'
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
              : 'border-red-500/30 bg-red-500/10 text-red-200'
          }`}
        >
          {feedback.message}
        </div>
      )}
    </GlassCard>
  );
}
