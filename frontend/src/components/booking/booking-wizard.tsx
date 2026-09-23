'use client'

import { useEffect, useState, useMemo, useCallback, useRef } from 'react'
import dynamic from 'next/dynamic'
import {
  type Package,
  type BookingSelection,
  allPackagesFlat,
  sizeAdjustments,
  addons,
  ceramicServices,
  isCeramicEligible,
} from './booking-data'
import { calculatePricing, normalizePaintCorrection } from './pricing-utils'
import { hasBookingDeposit } from '@/lib/booking-settings'
import { StepIndicator } from './step-indicator'
import { BookingSummary } from './booking-summary'
import { VehicleStep } from './vehicle-step'
import { PackageStep } from './package-step'
import { AddonsStep } from './addons-step'
import { CeramicStep } from './ceramic-step'
import { ConfirmationStep } from './confirmation-step'

const CalEmbed = dynamic(
  () => import('@/components/cal-embed').then((module) => module.CalEmbed),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[600px] items-center justify-center rounded-lg text-neutral-400" role="status">
        Loading the calendar…
      </div>
    ),
  },
)

// ============================================================================
// TYPES
// ============================================================================

interface BookingWizardProps {
  /** Pre-populate from URL params (deep-link from pricing page) */
  initialSelection?: BookingSelection | null
  initialPackageSelection?: { categoryId: string; packageId: string } | null
  depositAmount: number
}

type StepId = 'vehicle' | 'package' | 'addons' | 'ceramic' | 'schedule' | 'confirmation'

interface StepDef {
  id: StepId
  label: string
  shortLabel: string
}

// ============================================================================
// COMPONENT
// ============================================================================

export function BookingWizard({
  initialSelection,
  initialPackageSelection,
  depositAmount,
}: BookingWizardProps) {
  // ---- State ----
  const [vehicleSize, setVehicleSize] = useState('car')
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null)
  const [selectedAddons, setSelectedAddons] = useState<Set<string>>(new Set())
  const [ceramicCoatingSelected, setCeramicCoatingSelected] = useState(false)
  const [selectedPaintCorrection, setSelectedPaintCorrection] = useState<string | null>(null)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [bookingConfirmed, setBookingConfirmed] = useState(false)
  const wizardRef = useRef<HTMLDivElement>(null)
  const initialValues = useRef({ initialSelection, initialPackageSelection })

  // ---- Derived ----
  const ceramicEnabled = isCeramicEligible(selectedPackage)

  // Clear ceramic when package changes to ineligible
  useEffect(() => {
    if (!ceramicEnabled) {
      setCeramicCoatingSelected(false)
      setSelectedPaintCorrection(null)
    }
  }, [ceramicEnabled])

  // Build dynamic step list
  const steps = useMemo<StepDef[]>(() => {
    const base: StepDef[] = [
      { id: 'vehicle', label: 'Vehicle', shortLabel: 'Vehicle' },
      { id: 'package', label: 'Package', shortLabel: 'Package' },
      { id: 'addons', label: 'Add-ons', shortLabel: 'Extras' },
    ]
    if (ceramicEnabled) {
      base.push({ id: 'ceramic', label: 'Paint protection', shortLabel: 'Paint' })
    }
    base.push({ id: 'schedule', label: 'Date and time', shortLabel: 'Time' })
    return base
  }, [ceramicEnabled])

  // If the ceramic step disappears and we were on it (or past it), clamp.
  useEffect(() => {
    if (currentStepIndex >= steps.length) {
      setCurrentStepIndex(steps.length - 1)
    }
  }, [steps.length, currentStepIndex])

  const currentStep = steps[currentStepIndex]

  // Pricing breakdown
  const pricing = useMemo(
    () =>
      calculatePricing({
        selectedPackage,
        vehicleSize,
        selectedAddons,
        ceramicCoatingSelected,
        selectedPaintCorrection,
      }),
    [selectedPackage, vehicleSize, selectedAddons, ceramicCoatingSelected, selectedPaintCorrection]
  )

  // Current selection for summary / cal embed
  const currentSelection = useMemo<BookingSelection | null>(() => {
    if (!selectedPackage) return null

    const ceramicName = ceramicCoatingSelected
      ? ceramicServices.find((s) => s.id === 'graphene-coating')?.name
      : undefined

    const paintCorrectionName = selectedPaintCorrection
      ? ceramicServices.find((s) => s.id === selectedPaintCorrection)?.name ??
        (selectedPaintCorrection === 'paint-correction-2-upgrade'
          ? ceramicServices.find((s) => s.id === 'paint-correction-2')?.name
          : undefined)
      : undefined

    const sizeLabel = sizeAdjustments.find((s) => s.id === vehicleSize)?.label

    return {
      category: selectedPackage.categoryId,
      tier: selectedPackage.id,
      size: vehicleSize,
      sizeLabel,
      addons: Array.from(selectedAddons).join(','),
      ceramic: ceramicName,
      paintCorrection: paintCorrectionName,
      total: pricing.grandTotal,
      packageName: `${selectedPackage.name} (${selectedPackage.categoryLabel})`,
    }
  }, [selectedPackage, vehicleSize, selectedAddons, ceramicCoatingSelected, selectedPaintCorrection, pricing.grandTotal])

  // ---- Initialize from URL params ----
  useEffect(() => {
    const { initialSelection, initialPackageSelection } = initialValues.current
    if (initialSelection) {
      setVehicleSize(sizeAdjustments.some((size) => size.id === initialSelection.size) ? initialSelection.size : 'car')

      const pkg = allPackagesFlat.find(
        (p) => p.categoryId === initialSelection.category && p.id === initialSelection.tier
      )
      if (pkg) setSelectedPackage(pkg)

      setSelectedAddons(
        new Set(
          initialSelection.addons
            .split(',')
            .map((a) => a.trim())
            .filter((name) => addons.some((addon) => addon.name === name))
        )
      )

      const eligible = isCeramicEligible(pkg ?? null)
      const hasCeramic = eligible && ceramicServices.some(
        (service) => service.id === 'graphene-coating' && service.name === initialSelection.ceramic
      )
      setCeramicCoatingSelected(hasCeramic)

      if (eligible && initialSelection.paintCorrection) {
        const match = ceramicServices.find((s) => s.name === initialSelection.paintCorrection)
        setSelectedPaintCorrection(normalizePaintCorrection(match?.id ?? null, hasCeramic))
      }
    } else if (initialPackageSelection) {
      const pkg = allPackagesFlat.find(
        (p) =>
          p.categoryId === initialPackageSelection.categoryId &&
          p.id === initialPackageSelection.packageId
      )
      if (pkg) setSelectedPackage(pkg)
    }
  }, []) // Run once on mount

  // ---- Navigation ----
  // Bring the top of the wizard into view below the fixed nav, but only when
  // it has scrolled out of view; otherwise stay put so the page doesn't jump.
  const scrollToTop = useCallback(() => {
    const el = wizardRef.current
    if (!el) return
    const navHeight = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-bar-height')) || 72
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

  // Can advance from current step?
  const canAdvance = useMemo(() => {
    if (!currentStep) return false
    switch (currentStep.id) {
      case 'vehicle':
        return Boolean(vehicleSize)
      case 'package':
        return Boolean(selectedPackage)
      case 'addons':
        return true // optional
      case 'ceramic':
        return true // optional
      case 'schedule':
        return false // handled by Cal.com
      default:
        return false
    }
  }, [currentStep, vehicleSize, selectedPackage])

  // Handle addon toggle
  const toggleAddon = useCallback((name: string) => {
    setSelectedAddons((prev) => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })
  }, [])

  const toggleCeramic = useCallback(() => {
    const nextCoatingSelected = !ceramicCoatingSelected
    setCeramicCoatingSelected(nextCoatingSelected)
    setSelectedPaintCorrection((current) => normalizePaintCorrection(current, nextCoatingSelected))
  }, [ceramicCoatingSelected])

  const selectPaintCorrection = useCallback(
    (id: string | null) => {
      if (selectedPaintCorrection === id) {
        setSelectedPaintCorrection(null)
      } else {
        setSelectedPaintCorrection(id)
      }
    },
    [selectedPaintCorrection]
  )

  // Handle summary edit navigation
  const handleEditStep = useCallback(
    (stepIndex: number) => {
      goToStep(stepIndex)
    },
    [goToStep]
  )

  // Handle Cal.com booking success
  const handleBookingSuccess = useCallback(() => {
    setBookingConfirmed(true)
    scrollToTop()
  }, [scrollToTop])

  // ---- Render ----
  if (bookingConfirmed && currentSelection) {
    return (
      <div ref={wizardRef}>
        <div className="max-w-2xl mx-auto">
          <ConfirmationStep selection={currentSelection} depositAmount={depositAmount} />
        </div>
      </div>
    )
  }

  const sizeAdd = sizeAdjustments.find((s) => s.id === vehicleSize)?.add ?? 0
  const showDeposit = hasBookingDeposit(depositAmount)

  const nextStep = steps[currentStepIndex + 1]

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
                sizeAdjustments={sizeAdjustments}
                vehicleSize={vehicleSize}
                onSelect={setVehicleSize}
              />
            )}

            {currentStep?.id === 'package' && (
              <PackageStep
                packages={allPackagesFlat}
                selectedPackage={selectedPackage}
                sizeAdd={sizeAdd}
                onSelect={setSelectedPackage}
              />
            )}

            {currentStep?.id === 'addons' && (
              <AddonsStep
                addons={addons}
                selectedAddons={selectedAddons}
                onToggle={toggleAddon}
              />
            )}

            {currentStep?.id === 'ceramic' && (
              <CeramicStep
                ceramicServices={ceramicServices}
                ceramicCoatingSelected={ceramicCoatingSelected}
                selectedPaintCorrection={selectedPaintCorrection}
                onToggleCeramic={toggleCeramic}
                onSelectPaintCorrection={selectPaintCorrection}
              />
            )}

            {currentStep?.id === 'schedule' && (
              <div>
                <h3 className="text-white font-semibold text-xl mb-1">Pick a time</h3>
                <p className="text-neutral-400 mb-6">
                  {showDeposit
                    ? `A $${depositAmount} deposit holds the slot. It is refunded in full if you cancel at least 24 hours ahead.`
                    : 'Choose a day and time that works. You pay when the job is done.'}
                </p>
                <div className="-mx-2 sm:mx-0 min-h-[600px]">
                  <CalEmbed
                    selection={currentSelection ?? undefined}
                    depositAmount={depositAmount}
                    onBookingSuccessful={handleBookingSuccess}
                  />
                </div>
                <button
                  type="button"
                  onClick={goBack}
                  className="mt-6 min-h-11 rounded-lg px-3 -ml-3 text-sm font-medium text-neutral-300 hover:text-white transition-colors"
                >
                  Back to {steps[currentStepIndex - 1]?.label.toLowerCase()}
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
                  Back
                </button>
              ) : (
                <span />
              )}

              <div className="flex items-center gap-4">
                {!canAdvance && currentStep?.id === 'package' && (
                  <span className="hidden sm:inline text-sm text-neutral-500">Choose a package to continue</span>
                )}
                <button
                  type="button"
                  onClick={goNext}
                  disabled={!canAdvance}
                  className="btn-primary inline-flex min-h-11 items-center px-5 text-sm disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-neutral-500"
                >
                  {nextStep ? `Continue to ${nextStep.label.toLowerCase()}` : 'Continue'}
                </button>
              </div>
            </div>
          )}
        </div>

        <BookingSummary
          selection={currentSelection}
          vehicleLabel={sizeAdjustments.find((s) => s.id === vehicleSize)?.label}
          depositAmount={depositAmount}
          onEditStep={handleEditStep}
          containerRef={wizardRef}
        />
      </div>

      {/* Room for the fixed summary bar on mobile */}
      <div className="lg:hidden h-20" />
    </div>
  )
}
