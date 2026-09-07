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
      <div className="flex min-h-[600px] items-center justify-center rounded-lg bg-neutral-900/50 text-neutral-400" role="status">
        Loading booking calendar...
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
      base.push({ id: 'ceramic', label: 'Ceramic & Polish', shortLabel: 'Ceramic' })
    }
    base.push({ id: 'schedule', label: 'Schedule', shortLabel: 'Schedule' })
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
  const scrollToTop = useCallback(() => {
    if (wizardRef.current) {
      const rect = wizardRef.current.getBoundingClientRect()
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      window.scrollTo({ top: rect.top + scrollTop - 24, behavior: 'smooth' })
    }
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
      <div ref={wizardRef} className="scroll-mt-6">
        <div className="max-w-2xl mx-auto">
          <ConfirmationStep selection={currentSelection} depositAmount={depositAmount} />
        </div>
      </div>
    )
  }

  const sizeAdd = sizeAdjustments.find((s) => s.id === vehicleSize)?.add ?? 0
  const showDeposit = hasBookingDeposit(depositAmount)

  return (
    <div ref={wizardRef} className="scroll-mt-6">
      <StepIndicator
        steps={steps}
        currentStep={currentStepIndex}
        onStepClick={goToStep}
      />

      <div className="lg:grid lg:grid-cols-[1fr_280px] lg:gap-8">
        {/* Main step area */}
        <div className="min-h-[400px]">
          <div className="bg-neutral-800/30 backdrop-blur-sm rounded-2xl border border-neutral-700 p-6">
            {/* Step content */}
            <div key={currentStep?.id} className="animate-fade-in" style={{ animationDuration: '200ms' }}>
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
                  <h3 className="text-white font-semibold text-lg mb-2">Choose Your Date & Time</h3>
                  {showDeposit ? (
                    <p className="text-neutral-400 text-sm mb-5">
                      Select a convenient time slot. A ${depositAmount} deposit secures your appointment.
                      Fully refundable if you cancel 24+ hours in advance.
                    </p>
                  ) : (
                    <p className="text-neutral-400 text-sm mb-5">
                      Select a convenient time slot to reserve your appointment.
                    </p>
                  )}
                  <div className="bg-neutral-900/50 rounded-xl border border-neutral-700 p-3 min-h-[600px]">
                    <CalEmbed
                      selection={currentSelection ?? undefined}
                      depositAmount={depositAmount}
                      onBookingSuccessful={handleBookingSuccess}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Navigation buttons */}
            {currentStep?.id !== 'schedule' && (
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-neutral-700">
                <button
                  type="button"
                  onClick={goBack}
                  disabled={currentStepIndex === 0}
                  className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 ${
                    currentStepIndex === 0
                      ? 'text-neutral-600 cursor-not-allowed'
                      : 'text-neutral-300 hover:text-white hover:bg-neutral-700/50'
                  }`}
                >
                  ← Back
                </button>

                <button
                  type="button"
                  onClick={goNext}
                  disabled={!canAdvance}
                  className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors duration-150 ${
                    canAdvance
                      ? 'bg-red-600 text-white hover:bg-red-500 shadow-sm shadow-red-600/20'
                      : 'bg-neutral-700 text-neutral-500 cursor-not-allowed'
                  }`}
                >
                  {currentStep?.id === 'addons' && !ceramicEnabled
                    ? 'Continue to Scheduling →'
                    : currentStep?.id === 'ceramic'
                      ? 'Continue to Scheduling →'
                      : 'Next →'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar summary (desktop) + bottom bar (mobile) */}
        <BookingSummary
          selection={currentSelection}
          depositAmount={depositAmount}
          onEditStep={handleEditStep}
        />
      </div>

      {/* Bottom padding on mobile for the fixed bottom bar */}
      <div className="lg:hidden h-16" />
    </div>
  )
}
