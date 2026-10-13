'use client';

import { useState, type FormEvent } from 'react';
import {
  hasBookingDeposit,
  type BookingSettings,
} from '@/lib/booking-settings';
import { describeApiError } from '@/lib/content/validation';
import { Button, Card, Field, Notice, Spinner, cx, inputClass, useToast } from './ui';

type BookingSettingsAdminProps = {
  initialSettings: BookingSettings;
};

export function BookingSettingsAdmin({
  initialSettings,
}: BookingSettingsAdminProps) {
  const notify = useToast();
  const [depositAmount, setDepositAmount] = useState(
    initialSettings.depositAmount.toString(),
  );
  const [savedSettings, setSavedSettings] = useState(initialSettings);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parsedDepositAmount = Number(depositAmount);
  const valid = depositAmount.trim() !== '' && Number.isFinite(parsedDepositAmount) && parsedDepositAmount >= 0;
  const depositEnabled = valid && hasBookingDeposit(parsedDepositAmount);
  const changed = valid && parsedDepositAmount !== savedSettings.depositAmount;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!valid) {
      setError('Deposit amount must be 0 or greater.');
      return;
    }

    setBusy(true);
    try {
      const response = await fetch('/api/admin/settings/booking', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          depositAmount: parsedDepositAmount,
        }),
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        setError(describeApiError(payload, 'Unable to save booking settings.'));
        return;
      }

      const settings = payload as BookingSettings;
      setSavedSettings(settings);
      setDepositAmount(settings.depositAmount.toString());
      notify({ tone: 'success', message: 'Deposit saved. The booking page shows it now.' });
    } catch {
      setError('Could not reach the server. Check your connection and try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card
      title="Booking deposit"
      description="Shown in the booking steps, the booking page’s deposit policy and questions, and the notes sent to Cal.com. Collecting the payment itself is set up in Cal.com."
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <Field
          label="Deposit amount"
          hint="Set below $1 to turn the deposit off. All deposit and balance text is then hidden."
          error={valid ? null : 'Enter an amount of $0 or more.'}
        >
          {({ id, describedBy, invalid }) => (
            <div className="relative max-w-xs">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">$</span>
              <input
                id={id}
                aria-describedby={describedBy}
                aria-invalid={invalid}
                inputMode="decimal"
                value={depositAmount}
                onChange={(event) => setDepositAmount(event.target.value.replace(/[^\d.]/g, ''))}
                className={cx(inputClass, 'pl-7 tabular')}
              />
            </div>
          )}
        </Field>

        <p className="text-sm text-neutral-400">
          Saved: ${savedSettings.depositAmount}.{' '}
          {depositEnabled ? 'Customers will see a deposit.' : 'No deposit will be shown.'}
        </p>

        {error && <Notice tone="danger">{error}</Notice>}

        <Button type="submit" variant="primary" disabled={busy || !changed}>
          {busy && <Spinner />}
          {busy ? 'Saving' : 'Save deposit'}
        </Button>
      </form>
    </Card>
  );
}
