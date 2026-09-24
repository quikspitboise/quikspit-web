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
    <div className="text-center animate-step-in" role="status">
      <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-6">
        <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <h3 className="font-display text-4xl text-white uppercase mb-3">You&apos;re booked</h3>
      <p className="text-neutral-400 max-w-md mx-auto mb-8 text-pretty">
        A confirmation email with the time and the garage address is on its way.
      </p>

      {/* Summary card */}
      <div className="panel p-6 text-left max-w-md mx-auto mb-8">
        <h4 className="text-white font-semibold mb-4">Your detail</h4>
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
              <span className="text-neutral-400">Takes about</span>
              <span className="text-white">{duration}</span>
            </div>
          )}

          <div className="border-t border-white/10 pt-3 mt-3">
            <div className="flex justify-between">
              <span className="text-neutral-300">Total</span>
              <span className="text-white font-display text-2xl tabular">${selection.total}</span>
            </div>
            {showDeposit && (
              <>
                <div className="flex justify-between text-xs mt-1">
                  <span className="text-neutral-500">Booking deposit</span>
                  <span className="text-emerald-400 tabular">${depositAmount} paid</span>
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
      <div className="text-left max-w-md mx-auto">
        <h4 className="text-white font-semibold mb-3">Before your appointment</h4>
        <ul className="space-y-2 text-sm text-neutral-400">
          <li className="flex gap-2">
            <span className="text-red-500 shrink-0" aria-hidden="true">•</span>
            <span>Check your email for the garage address. We don&apos;t publish it anywhere else.</span>
          </li>
          <li className="flex gap-2">
            <span className="text-red-500 shrink-0" aria-hidden="true">•</span>
            <span>Take any valuables out of the car.</span>
          </li>
          <li className="flex gap-2">
            <span className="text-red-500 shrink-0" aria-hidden="true">•</span>
            <span>Arrive on time so the detail can start on schedule.</span>
          </li>
          <li className="flex gap-2">
            <span className="text-red-500 shrink-0" aria-hidden="true">•</span>
            <span>Need to move it? Reschedule for free up to 24 hours ahead.</span>
          </li>
        </ul>
      </div>

      {/* Contact */}
      <p className="text-neutral-500 text-sm mt-8">
        Questions? Call or text{' '}
        <a href="tel:+12089604970" className="text-red-400 hover:text-red-300 underline underline-offset-4">
          (208) 960-4970
        </a>
      </p>
    </div>
  )
}
