'use client'

import { useState } from 'react'
import type { BookingSelection } from './booking-data'
import { getDurationEstimate } from './booking-data'
import { DEPOSIT_AMOUNT } from '@/components/cal-embed'

interface BookingSummaryProps {
  selection: BookingSelection | null
  /** Called when user taps an edit link — jumps to that step */
  onEditStep?: (stepIndex: number) => void
}

export function BookingSummary({ selection, onEditStep }: BookingSummaryProps) {
  const [mobileExpanded, setMobileExpanded] = useState(false)

  if (!selection) return null

  const deposit = DEPOSIT_AMOUNT
  const balance = selection.total - deposit
  const addonList = selection.addons?.split(',').map((a) => a.trim()).filter(Boolean) || []
  const duration = getDurationEstimate(
    selection.category,
    selection.tier,
    Boolean(selection.ceramic),
    Boolean(selection.paintCorrection)
  )

  const summaryContent = (
    <div className="space-y-3 text-sm">
      {/* Package */}
      {selection.packageName && (
        <div className="flex justify-between items-start">
          <span className="text-neutral-400">Package</span>
          <div className="text-right flex items-center gap-2">
            <span className="text-white font-medium">{selection.packageName}</span>
            {onEditStep && (
              <button
                type="button"
                onClick={() => onEditStep(1)}
                className="text-red-500 text-xs hover:text-red-400 underline underline-offset-2"
              >
                Edit
              </button>
            )}
          </div>
        </div>
      )}

      {/* Vehicle */}
      {selection.sizeLabel && (
        <div className="flex justify-between items-start">
          <span className="text-neutral-400">Vehicle</span>
          <div className="text-right flex items-center gap-2">
            <span className="text-white">{selection.sizeLabel}</span>
            {onEditStep && (
              <button
                type="button"
                onClick={() => onEditStep(0)}
                className="text-red-500 text-xs hover:text-red-400 underline underline-offset-2"
              >
                Edit
              </button>
            )}
          </div>
        </div>
      )}

      {/* Add-ons */}
      {addonList.length > 0 && (
        <div className="flex justify-between items-start">
          <span className="text-neutral-400">Add-ons</span>
          <span className="text-white text-right max-w-[60%]">{addonList.join(', ')}</span>
        </div>
      )}

      {/* Ceramic */}
      {selection.ceramic && (
        <div className="flex justify-between items-start">
          <span className="text-neutral-400">Ceramic</span>
          <span className="text-white">Yes</span>
        </div>
      )}

      {/* Paint Correction */}
      {selection.paintCorrection && (
        <div className="flex justify-between items-start">
          <span className="text-neutral-400">Paint Correction</span>
          <span className="text-white">{selection.paintCorrection}</span>
        </div>
      )}

      {/* Duration */}
      {duration && (
        <div className="flex justify-between items-start">
          <span className="text-neutral-400">Est. Duration</span>
          <span className="text-white">{duration}</span>
        </div>
      )}

      {/* Pricing breakdown */}
      <div className="border-t border-neutral-700 pt-3 mt-3 space-y-2">
        <div className="flex justify-between">
          <span className="text-neutral-300 font-medium">Estimated Total</span>
          <span className="text-white font-display text-xl">${selection.total}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-neutral-500">Deposit (due today)</span>
          <span className="text-red-500 font-semibold">${deposit}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-neutral-500">Balance (at service)</span>
          <span className="text-neutral-400">${balance}</span>
        </div>
      </div>

      <p className="text-neutral-600 text-xs">
        * Final price may vary based on vehicle condition.
      </p>
    </div>
  )

  return (
    <>
      {/* Desktop: sidebar */}
      <aside className="hidden lg:block" aria-label="Booking summary">
        <div className="sticky top-24 bg-neutral-800/60 backdrop-blur-sm rounded-2xl border border-neutral-700 p-5">
          <h3 className="font-display text-lg text-white tracking-wide mb-4">YOUR DETAIL</h3>
          {summaryContent}
        </div>
      </aside>

      {/* Mobile: bottom bar */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40" aria-label="Booking summary">
        <div className="bg-neutral-900/95 backdrop-blur-md border-t border-neutral-700">
          {/* Collapsed bar */}
          <button
            type="button"
            onClick={() => setMobileExpanded((prev) => !prev)}
            className="w-full flex items-center justify-between px-4 py-3"
          >
            <div className="flex items-center gap-3">
              <span className="text-white font-display text-lg">${selection.total}</span>
              {selection.packageName && (
                <span className="text-neutral-400 text-sm truncate max-w-[180px]">
                  · {selection.packageName}
                </span>
              )}
            </div>
            <svg
              className={`w-5 h-5 text-neutral-400 transition-transform duration-200 ${
                mobileExpanded ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </button>

          {/* Expanded panel */}
          {mobileExpanded && (
            <div className="px-4 pb-4 border-t border-neutral-800 pt-3 max-h-[60vh] overflow-y-auto">
              {summaryContent}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
