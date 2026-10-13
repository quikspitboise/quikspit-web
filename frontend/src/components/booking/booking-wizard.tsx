'use client'

import { useEffect, useState, useMemo, useCallback, useRef } from 'react'
import dynamic from 'next/dynamic'
import { toBookingSelection, type BookingSelection } from './booking-data'
import {
  calculateQuote,
  correctionOptions,
  defaultVehicleSize,
  normalizeSelection,
  publicAddons,
  publicCategories,
  publicCeramicServices,
  publicVehicleSizes,
  type CatalogSelection,
} from '@/lib/content/catalog'
import { requestQuote, type QuoteResult } from '@/lib/content/quote-client'
import type { InitialBookingSelection } from '@/lib/booking-params'
import type { CatalogContent } from '@/lib/content/types'
import { hasBookingDeposit } from '@/lib/booking-settings'
import { StepIndicator } from './step-indicator'
import { BookingSummary } from './booking-summary'
import { VehicleStep } from './vehicle-step'
import { PackageStep } from './package-step'
import { AddonsStep } from './addons-step'
import { CeramicStep } from './ceramic-step'
import { ConfirmationStep } from './confirmation-step'
import { useBookingCopy } from './booking-copy'

function CalendarLoading() {
  const text = useBookingCopy()
  return (
    <div className="flex min-h-[600px] items-center justify-center rounded-lg text-neutral-400" role="status">
      {text('calendarLoading')}
    </div>
  )
}

const CalEmbed = dynamic(
  () => import('@/components/cal-embed').then((module) => module.CalEmbed),
  {
    ssr: false,
    loading: CalendarLoading,
  },
)

// ============================================================================
// TYPES
// ============================================================================

interface BookingWizardProps {
  catalog: CatalogContent
  /** Published catalog revision; quotes against an older one are rejected. */
  catalogRevisionId: string | null
  /** Pre-populate from URL params (deep-link from pricing page) */
  initialSelection?: InitialBookingSelection | null
  depositAmount: number
  /** Deposit sentence with the amount already filled in. */
  depositPolicy: string
  /** Admin draft preview: prices are unpublished, so skip the live quote. */
  preview?: boolean
}

type StepId = 'vehicle' | 'package' | 'addons' | 'ceramic' | 'schedule'

interface StepDef {
  id: StepId
  label: string
  shortLabel: string
}

type PackageRef = { categoryId: string; packageId: string }

// ============================================================================
// COMPONENT
// ============================================================================

export function BookingWizard({
  catalog,
  catalogRevisionId,
  initialSelection,
  depositAmount,
  depositPolicy,
  preview = false,
}: BookingWizardProps) {
  const text = useBookingCopy()
  const categories = useMemo(() => publicCategories(catalog), [catalog])
  const sizes = useMemo(() => publicVehicleSizes(catalog), [catalog])
  const addons = useMemo(() => publicAddons(catalog), [catalog])
  const hasCeramicServices = publicCeramicServices(catalog).length > 0

  // ---- State (seeded once from the deep link, then normalized) ----
  const [selection, setSelection] = useState<CatalogSelection>(() => {
    const vehicleSizeId = sizes.some((size) => size.id === initialSelection?.vehicleSizeId)
      ? initialSelection!.vehicleSizeId!
      : (defaultVehicleSize(catalog)?.id ?? '')
    return normalizeSelection(catalog, {
      categoryId: initialSelection?.categoryId ?? '',
      packageId: initialSelection?.packageId ?? '',
      vehicleSizeId,
      addonIds: initialSelection?.addonIds ?? [],
      coatingId: initialSelection?.coatingId,
      correctionId: initialSelection?.correctionId,
    })
  })
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [bookingConfirmed, setBookingConfirmed] = useState(false)
  const wizardRef = useRef<HTMLDivElement>(null)

  // ---- Derived ----
  const selectedPackage = categories
    .find((category) => category.id === selection.categoryId)
    ?.packages.find((pkg) => pkg.id === selection.packageId)
  const packageRef: PackageRef | null = selectedPackage
    ? { categoryId: selection.categoryId, packageId: selection.packageId }
    : null
  const ceramicEnabled = Boolean(selectedPackage?.ceramicEligible) && hasCeramicServices

  const steps = useMemo<StepDef[]>(() => {
    const base: StepDef[] = [
      { id: 'vehicle', label: text('vehicleLabel'), shortLabel: text('vehicleLabel') },
      { id: 'package', label: text('packageLabel'), shortLabel: text('packageLabel') },
    ]
    if (addons.length > 0) base.push({ id: 'addons', label: text('addonsLabel'), shortLabel: text('extrasShortLabel') })
    if (ceramicEnabled) base.push({ id: 'ceramic', label: text('ceramicLabel'), shortLabel: text('paintShortLabel') })
    base.push({ id: 'schedule', label: text('scheduleLabel'), shortLabel: text('timeShortLabel') })
    return base
  }, [addons.length, ceramicEnabled, text])

  // If the ceramic step disappears and we were on it (or past it), clamp.
  useEffect(() => {
    if (currentStepIndex >= steps.length) {
      setCurrentStepIndex(steps.length - 1)
    }
  }, [steps.length, currentStepIndex])

  const currentStep = steps[currentStepIndex]
  const quote = useMemo(() => calculateQuote(catalog, selection), [catalog, selection])
  const currentSelection = useMemo<BookingSelection | null>(() => (quote ? toBookingSelection(quote) : null), [quote])
  const vehicleLabel = sizes.find((size) => size.id === selection.vehicleSizeId)?.label

  // ---- Confirm the price with the backend before scheduling ----
  const quoteKey = JSON.stringify(selection)
  const [serverQuote, setServerQuote] = useState<{ key: string; result: QuoteResult } | null>(null)
  const onScheduleStep = currentStep?.id === 'schedule'

  useEffect(() => {
    if (!onScheduleStep || !quote || preview) return
    let cancelled = false
    requestQuote(quote.selection, catalogRevisionId).then((result) => {
      if (!cancelled) setServerQuote({ key: quoteKey, result })
    })
    return () => {
      cancelled = true
    }
  }, [onScheduleStep, quote, quoteKey, catalogRevisionId, preview])

  const quoteResult = preview ? null : serverQuote?.key === quoteKey ? serverQuote.result : undefined
  // The backend total wins; the local one only stands in when it is unreachable.
  const scheduledSelection =
    currentSelection && quoteResult?.status === 'ok'
      ? { ...currentSelection, totalCents: quoteResult.quote.totalCents, calLink: quoteResult.quote.calLink }
      : currentSelection

  // ---- Navigation ----
  // Bring the top of the wizard into view below the fixed nav, but only when
  // it has scrolled out of view; otherwise stay put so the page doesn't jump.
  const scrollToTop = useCallback(() => {
    const el = wizardRef.current
    if (!el) return
    const navHeight = document.querySelector('nav[aria-label="Primary"]')?.getBoundingClientRect().bottom ?? 72
    const top = el.getBoundingClientRect().top
    if (top >= navHeight && top < window.innerHeight * 0.5) return
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({ top: top + window.scrollY - navHeight - 16, behavior: reduceMotion ? 'auto' : 'smooth' })
  }, [])

  const goToStep = useCallback(
    (index: number) => {
      if (index >= 0 && index < steps.length) {
        setCurrentStepIndex(index)
        scrollToTop()
      }
    },
    [steps.length, scrollToTop]
  )

  const goNext = useCallback(() => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex((i) => i + 1)
      scrollToTop()
    }
  }, [currentStepIndex, steps.length, scrollToTop])

  const goBack = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((i) => i - 1)
      scrollToTop()
    }
  }, [currentStepIndex, scrollToTop])

  const canAdvance = currentStep?.id === 'vehicle'
    ? Boolean(selection.vehicleSizeId)
    : currentStep?.id === 'package'
      ? Boolean(selectedPackage)
      : currentStep?.id === 'addons' || currentStep?.id === 'ceramic'

  const update = useCallback(
    (changes: Partial<CatalogSelection>) => setSelection((prev) => normalizeSelection(catalog, { ...prev, ...changes })),
    [catalog]
  )

  const toggleAddon = useCallback((id: string) => {
    setSelection((prev) => ({
      ...prev,
      addonIds: prev.addonIds.includes(id) ? prev.addonIds.filter((addonId) => addonId !== id) : [...prev.addonIds, id],
    }))
  }, [])

  const handleBookingSuccess = useCallback(() => {
    setBookingConfirmed(true)
    scrollToTop()
  }, [scrollToTop])

  // ---- Render ----
  if (bookingConfirmed && scheduledSelection) {
    return (
      <div ref={wizardRef}>
        <div className="max-w-2xl mx-auto">
          <ConfirmationStep selection={scheduledSelection} depositAmount={depositAmount} />
        </div>
      </div>
    )
  }

  const sizeAddCents = sizes.find((size) => size.id === selection.vehicleSizeId)?.surchargeCents ?? 0
  const showDeposit = hasBookingDeposit(depositAmount)
  const nextStep = steps[currentStepIndex + 1]
  const coating = publicCeramicServices(catalog, 'coating').find((service) => service.id === selection.coatingId)

  return (
    <div ref={wizardRef}>
      <StepIndicator
        steps={steps}
        currentStep={currentStepIndex}
        onStepClick={goToStep}
      />

      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-8 lg:items-start">
        <div className="panel p-5 sm:p-7">
          <div key={currentStep?.id} className="animate-step-in">
            {currentStep?.id === 'vehicle' && (
              <VehicleStep
                sizes={sizes}
                vehicleSizeId={selection.vehicleSizeId}
                onSelect={(vehicleSizeId) => update({ vehicleSizeId })}
              />
            )}

            {currentStep?.id === 'package' && (
              <PackageStep
                categories={categories}
                selected={packageRef}
                sizeAddCents={sizeAddCents}
                onSelect={(ref) => update(ref)}
              />
            )}

            {currentStep?.id === 'addons' && (
              <AddonsStep
                addons={addons}
                selectedAddonIds={selection.addonIds}
                onToggle={toggleAddon}
              />
            )}

            {currentStep?.id === 'ceramic' && (
              <CeramicStep
                coatings={publicCeramicServices(catalog, 'coating')}
                corrections={correctionOptions(catalog, coating)}
                includedCorrection={coating?.includedCorrectionId
                  ? catalog.ceramicServices.find((service) => service.id === coating.includedCorrectionId)
                  : undefined}
                coatingId={selection.coatingId}
                correctionId={selection.correctionId}
                onSelectCoating={(coatingId) => update({ coatingId })}
                onSelectCorrection={(correctionId) => update({ correctionId })}
              />
            )}

            {currentStep?.id === 'schedule' && (
              <div>
                <h3 className="text-white font-semibold text-xl mb-1">{text('scheduleHeading')}</h3>
                <p className="text-neutral-400 mb-6">
                  {showDeposit && depositPolicy
                    ? depositPolicy
                    : text('scheduleDescription')}
                </p>
                <div className="-mx-2 sm:mx-0">
                  {preview ? (
                    <div className="flex min-h-[600px] items-center justify-center rounded-lg border border-dashed border-white/15 p-6 text-center text-neutral-400">
                      {text('calendarPreview')}
                    </div>
                  ) : quoteResult === undefined ? (
                    <div className="flex min-h-[600px] items-center justify-center rounded-lg text-neutral-400" role="status">
                      {text('checkingPrice')}
                    </div>
                  ) : quoteResult?.status === 'stale' || quoteResult?.status === 'rejected' ? (
                    <div className="flex min-h-[300px] flex-col items-center justify-center gap-4 rounded-lg border border-amber-500/30 bg-amber-500/5 p-6 text-center" role="alert">
                      <p className="max-w-md text-amber-100">
                        {quoteResult.status === 'stale'
                          ? text('stalePriceMessage')
                          : text('rejectedSelectionMessage')}
                      </p>
                      <button type="button" onClick={() => window.location.reload()} className="btn-primary inline-flex min-h-11 items-center px-5 text-sm">
                        {text('reloadPricesLabel')}
                      </button>
                    </div>
                  ) : (
                    <CalEmbed
                      selection={scheduledSelection ?? undefined}
                      depositAmount={depositAmount}
                      onBookingSuccessful={handleBookingSuccess}
                    />
                  )}
                </div>
                <button
                  type="button"
                  onClick={goBack}
                  className="mt-6 min-h-11 rounded-lg px-3 -ml-3 text-sm font-medium text-neutral-300 hover:text-white transition-colors"
                >
                  {text('backToLabel', { step: steps[currentStepIndex - 1]?.label.toLowerCase() ?? '' })}
                </button>
              </div>
            )}
          </div>

          {currentStep?.id !== 'schedule' && (
            <div className="flex items-center justify-between gap-4 mt-8 pt-6 border-t border-white/10">
              {currentStepIndex > 0 ? (
                <button
                  type="button"
                  onClick={goBack}
                  className="min-h-11 rounded-lg px-3 -ml-3 text-sm font-medium text-neutral-300 hover:text-white transition-colors"
                >
                  {text('backLabel')}
                </button>
              ) : (
                <span />
              )}

              <div className="flex items-center gap-4">
                {!canAdvance && currentStep?.id === 'package' && (
                  <span className="hidden sm:inline text-sm text-neutral-500">{text('choosePackageHint')}</span>
                )}
                <button
                  type="button"
                  onClick={goNext}
                  disabled={!canAdvance}
                  className="btn-primary inline-flex min-h-11 items-center px-5 text-sm disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-neutral-500"
                >
                  {nextStep ? text('continueToLabel', { step: nextStep.label.toLowerCase() }) : text('continueLabel')}
                </button>
              </div>
            </div>
          )}
        </div>

        <BookingSummary
          selection={scheduledSelection}
          vehicleLabel={vehicleLabel}
          depositAmount={depositAmount}
          onEditStep={goToStep}
          containerRef={wizardRef}
        />
      </div>

      {/* Room for the fixed summary bar on mobile */}
      <div className="lg:hidden h-20" />
    </div>
  )
}
