'use client'

import { useBookingCopy } from './booking-copy'

import type { BookingSelection } from './booking-data'
import { formatCents, formatDuration } from '@/lib/content/catalog'
import { hasBookingDeposit } from '@/lib/booking-settings'
import { useSiteContent } from '@/components/content/site-content-context'

interface ConfirmationStepProps {
  selection: BookingSelection
  depositAmount: number
}

export function ConfirmationStep({ selection, depositAmount }: ConfirmationStepProps) {
  const text = useBookingCopy()
  const { business } = useSiteContent()
  const showDeposit = hasBookingDeposit(depositAmount)
  const depositCents = Math.round(depositAmount * 100)
  const balance = Math.max(selection.totalCents - depositCents, 0)
  const addonList = selection.addonNames
  const duration = formatDuration(selection.duration)

  return (
    <div className="text-center animate-step-in" role="status">
      <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-6">
        <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <h3 className="font-display text-4xl text-white uppercase mb-3">{text('confirmationHeading')}</h3>
      <p className="text-neutral-400 max-w-md mx-auto mb-8 text-pretty">
        {text('confirmationDescription')}
      </p>

      {/* Summary card */}
      <div className="panel p-6 text-left max-w-md mx-auto mb-8">
        <h4 className="text-white font-semibold mb-4">{text('summaryHeading')}</h4>
        <div className="space-y-2 text-sm">
          {selection.packageName && (
            <div className="flex justify-between">
              <span className="text-neutral-400">{text('packageLabel')}</span>
              <span className="text-white">{selection.packageName}</span>
            </div>
          )}
          {selection.sizeLabel && (
            <div className="flex justify-between">
              <span className="text-neutral-400">{text('vehicleLabel')}</span>
              <span className="text-white">{selection.sizeLabel}</span>
            </div>
          )}
          {addonList.length > 0 && (
            <div className="flex justify-between">
              <span className="text-neutral-400">{text('addonsLabel')}</span>
              <span className="text-white text-right max-w-[60%]">{addonList.join(', ')}</span>
            </div>
          )}
          {selection.coatingName && (
            <div className="flex justify-between gap-4">
              <span className="text-neutral-400">{text('coatingLabel')}</span>
              <span className="text-white text-right">{selection.coatingName}</span>
            </div>
          )}
          {selection.correctionName && (
            <div className="flex justify-between gap-4">
              <span className="text-neutral-400">{text('correctionLabel')}</span>
              <span className="text-white text-right">{selection.correctionName}</span>
            </div>
          )}
          {duration && (
            <div className="flex justify-between">
              <span className="text-neutral-400">{text('durationLabel')}</span>
              <span className="text-white">{duration}</span>
            </div>
          )}

          <div className="border-t border-white/10 pt-3 mt-3">
            <div className="flex justify-between">
              <span className="text-neutral-300">{text('totalLabel')}</span>
              <span className="text-white font-display text-2xl tabular">{formatCents(selection.totalCents)}</span>
            </div>
            {showDeposit && (
              <>
                <div className="flex justify-between text-xs mt-1">
                  <span className="text-neutral-500">{text('bookingDepositLabel')}</span>
                  <span className="text-emerald-400 tabular">{text('paidAmountLabel', { amount: formatCents(depositCents) })}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-neutral-500">{text('balanceLabel')}</span>
                  <span className="text-neutral-400">{formatCents(balance)}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Prep instructions */}
      <div className="text-left max-w-md mx-auto">
        <h4 className="text-white font-semibold mb-3">{text('prepHeading')}</h4>
        <ul className="space-y-2 text-sm text-neutral-400">
          <li className="flex gap-2">
            <span className="text-red-500 shrink-0" aria-hidden="true">•</span>
            <span>{text('prepAddress')}</span>
          </li>
          <li className="flex gap-2">
            <span className="text-red-500 shrink-0" aria-hidden="true">•</span>
            <span>{text('prepValuables')}</span>
          </li>
          <li className="flex gap-2">
            <span className="text-red-500 shrink-0" aria-hidden="true">•</span>
            <span>{text('prepArrival')}</span>
          </li>
          <li className="flex gap-2">
            <span className="text-red-500 shrink-0" aria-hidden="true">•</span>
            <span>{text('prepReschedule')}</span>
          </li>
        </ul>
      </div>

      {/* Contact */}
      <p className="text-neutral-500 text-sm mt-8">
        {text('questionsLabel')}{' '}
        <a href={`tel:${business.phone}`} className="text-red-400 hover:text-red-300 underline underline-offset-4">
          {business.phoneDisplay}
        </a>
      </p>
    </div>
  )
}
