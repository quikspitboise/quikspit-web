'use client'

import { useEffect, useState, type RefObject } from 'react'
import type { BookingSelection } from './booking-data'
import { getDurationEstimate } from './booking-data'
import { hasBookingDeposit } from '@/lib/booking-settings'

interface BookingSummaryProps {
  selection: BookingSelection | null
  /** Shown before a package is picked, so the summary is never empty. */
  vehicleLabel?: string
  depositAmount: number
  /** Called when user taps an edit link — jumps to that step */
  onEditStep?: (stepIndex: number) => void
  /** The wizard; the mobile bar only shows while it is on screen. */
  containerRef?: RefObject<HTMLElement | null>
}

function Row({ label, children, onEdit }: { label: string; children: React.ReactNode; onEdit?: () => void }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-neutral-500">{label}</dt>
      <dd className="flex items-start gap-2 text-right text-white">
        <span>{children}</span>
        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="text-red-400 hover:text-red-300 underline underline-offset-2"
          >
            Edit<span className="sr-only"> {label.toLowerCase()}</span>
          </button>
        )}
      </dd>
    </div>
  )
}

export function BookingSummary({ selection, vehicleLabel, depositAmount, onEditStep, containerRef }: BookingSummaryProps) {
  const [mobileExpanded, setMobileExpanded] = useState(false)
  const [wizardInView, setWizardInView] = useState(true)

  useEffect(() => {
    const el = containerRef?.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(([entry]) => setWizardInView(entry.isIntersecting))
    observer.observe(el)
    return () => observer.disconnect()
  }, [containerRef])

  const showDeposit = hasBookingDeposit(depositAmount)
  const addonList = selection?.addons?.split(',').map((a) => a.trim()).filter(Boolean) ?? []
  const duration = selection
    ? getDurationEstimate(selection.category, selection.tier, Boolean(selection.ceramic), Boolean(selection.paintCorrection))
    : null

  const summaryContent = (
    <div className="text-sm">
      <dl className="space-y-3">
        <Row label="Vehicle" onEdit={onEditStep && (() => onEditStep(0))}>
          {selection?.sizeLabel ?? vehicleLabel}
        </Row>
        {selection?.packageName && (
          <Row label="Package" onEdit={onEditStep && (() => onEditStep(1))}>
            {selection.packageName}
          </Row>
        )}
        {addonList.length > 0 && <Row label="Add-ons">{addonList.join(', ')}</Row>}
        {selection?.ceramic && <Row label="Ceramic coating">Yes</Row>}
        {selection?.paintCorrection && <Row label="Paint correction">{selection.paintCorrection}</Row>}
        {duration && <Row label="Takes about">{duration}</Row>}
      </dl>

      {selection ? (
        <div className="mt-5 border-t border-white/10 pt-4 space-y-2">
          <div className="flex items-baseline justify-between">
            <span className="text-neutral-300">Estimated total</span>
            <span className="font-display text-3xl text-white tabular">${selection.total}</span>
          </div>
          {showDeposit && (
            <>
              <div className="flex justify-between text-neutral-500">
                <span>Deposit today</span>
                <span className="tabular text-white">${depositAmount}</span>
              </div>
              <div className="flex justify-between text-neutral-500">
                <span>Due at the appointment</span>
                <span className="tabular">${Math.max(selection.total - depositAmount, 0)}</span>
              </div>
            </>
          )}
          <p className="pt-2 text-xs text-neutral-500">
            The final price can change if the car needs more work than expected.
          </p>
        </div>
      ) : (
        <p className="mt-5 border-t border-white/10 pt-4 text-neutral-500">
          Choose a package to see the total.
        </p>
      )}
    </div>
  )

  return (
    <>
      <aside className="hidden lg:block lg:sticky lg:top-[calc(var(--nav-total-height)+1.5rem)]" aria-label="Booking summary">
        <div className="panel p-5">
          <h3 className="font-semibold text-white mb-4">Your detail</h3>
          {summaryContent}
        </div>
      </aside>

      {selection && (
        <div
          className={`lg:hidden fixed bottom-0 inset-x-0 z-40 pb-[env(safe-area-inset-bottom)] bg-neutral-950 border-t border-white/10 transition-transform duration-300 ease-out-expo ${
            wizardInView ? 'translate-y-0' : 'translate-y-full'
          }`}
          aria-label="Booking summary"
          role="region"
          inert={!wizardInView}
        >
          <button
            type="button"
            onClick={() => setMobileExpanded((prev) => !prev)}
            aria-expanded={mobileExpanded}
            aria-controls="booking-summary-panel"
            className="w-full flex items-center justify-between gap-3 px-5 py-3 min-h-14"
          >
            <span className="flex min-w-0 items-baseline gap-3">
              <span className="font-display text-2xl text-white tabular">${selection.total}</span>
              <span className="truncate text-sm text-neutral-400">{selection.packageName}</span>
            </span>
            <span className="flex shrink-0 items-center gap-1 text-sm text-neutral-300">
              {mobileExpanded ? 'Hide' : 'Details'}
              <svg
                className={`h-4 w-4 transition-transform duration-300 ease-out-expo ${mobileExpanded ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </span>
          </button>

          <div
            id="booking-summary-panel"
            className="grid transition-[grid-template-rows] duration-300 ease-out-expo"
            style={{ gridTemplateRows: mobileExpanded ? '1fr' : '0fr' }}
          >
            <div className="overflow-hidden" inert={!mobileExpanded}>
              <div className="max-h-[60vh] overflow-y-auto border-t border-white/10 px-5 pb-5 pt-4">
                {summaryContent}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
