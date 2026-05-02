'use client'

import type { BookingSelection } from './booking-data'
import { getDurationEstimate } from './booking-data'
import { hasBookingDeposit } from '@/lib/booking-settings'

interface ConfirmationStepProps {
  selection: BookingSelection
  depositAmount: number
}

export function ConfirmationStep({ selection, depositAmount }: ConfirmationStepProps) {
  const showDeposit = hasBookingDeposit(depositAmount)
  const balance = Math.max(selection.total - depositAmount, 0)
  const addonList = selection.addons?.split(',').map((a) => a.trim()).filter(Boolean) || []
  const duration = getDurationEstimate(
    selection.category,
    selection.tier,
    Boolean(selection.ceramic),
    Boolean(selection.paintCorrection)
  )

  return (
    <div className="text-center">
      {/* Success icon */}
      <div className="w-20 h-20 mx-auto rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center mb-6">
        <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <h3 className="font-display text-3xl text-white tracking-wide mb-2">YOU&apos;RE BOOKED!</h3>
      <p className="text-neutral-400 max-w-md mx-auto mb-8">
        Your appointment is confirmed. We&apos;ll send a confirmation email with all the details shortly.
      </p>

      {/* Summary card */}
      <div className="bg-neutral-800/50 rounded-xl border border-neutral-700 p-6 text-left max-w-md mx-auto mb-8">
        <h4 className="text-white font-semibold text-sm uppercase tracking-wide mb-4">Booking Summary</h4>
        <div className="space-y-2 text-sm">
          {selection.packageName && (
            <div className="flex justify-between">
              <span className="text-neutral-400">Package</span>
              <span className="text-white">{selection.packageName}</span>
            </div>
          )}
          {selection.sizeLabel && (
            <div className="flex justify-between">
              <span className="text-neutral-400">Vehicle</span>
              <span className="text-white">{selection.sizeLabel}</span>
            </div>
          )}
          {addonList.length > 0 && (
            <div className="flex justify-between">
              <span className="text-neutral-400">Add-ons</span>
              <span className="text-white text-right max-w-[60%]">{addonList.join(', ')}</span>
            </div>
          )}
          {selection.ceramic && (
            <div className="flex justify-between">
              <span className="text-neutral-400">Ceramic Coating</span>
              <span className="text-white">Yes</span>
            </div>
          )}
          {selection.paintCorrection && (
            <div className="flex justify-between">
              <span className="text-neutral-400">Paint Correction</span>
              <span className="text-white">{selection.paintCorrection}</span>
            </div>
          )}
          {duration && (
            <div className="flex justify-between">
              <span className="text-neutral-400">Est. Duration</span>
              <span className="text-white">{duration}</span>
            </div>
          )}

          <div className="border-t border-neutral-700 pt-2 mt-2">
            <div className="flex justify-between">
              <span className="text-neutral-300">Total</span>
              <span className="text-white font-display text-lg">${selection.total}</span>
            </div>
            {showDeposit && (
              <>
                <div className="flex justify-between text-xs mt-1">
                  <span className="text-neutral-500">Deposit paid</span>
                  <span className="text-green-400">${depositAmount}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-neutral-500">Balance at service</span>
                  <span className="text-neutral-400">${balance}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Prep instructions */}
      <div className="bg-neutral-800/30 rounded-xl border border-neutral-700 p-6 text-left max-w-md mx-auto">
        <h4 className="text-white font-semibold text-sm uppercase tracking-wide mb-3">
          📋 Before Your Appointment
        </h4>
        <ul className="space-y-2 text-sm text-neutral-400">
          <li className="flex gap-2">
            <span className="text-red-500 shrink-0">•</span>
            <span>Please ensure your vehicle is accessible at the scheduled time</span>
          </li>
          <li className="flex gap-2">
            <span className="text-red-500 shrink-0">•</span>
            <span>Remove any valuables from your vehicle before the service</span>
          </li>
          <li className="flex gap-2">
            <span className="text-red-500 shrink-0">•</span>
            <span>Have a water source and power outlet available if possible</span>
          </li>
          <li className="flex gap-2">
            <span className="text-red-500 shrink-0">•</span>
            <span>You can reschedule for free up to 24 hours before your appointment</span>
          </li>
        </ul>
      </div>

      {/* Contact */}
      <p className="text-neutral-500 text-sm mt-8">
        Questions? Call us at{' '}
        <a href="tel:+12089604970" className="text-red-500 hover:text-red-400">
          (208) 960-4970
        </a>
      </p>
    </div>
  )
}
