'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { GlassCard } from '@/components/ui/glass-card'
import { Reveal } from '@/components/reveal'
import { buildBookingParams } from '@/components/cal-embed'

// Types
type Package = {
    id: string
    name: string
    tagline?: string
    description?: string
    basePrice: number
    features: string[]
    highlight?: boolean
    categoryId: string
    categoryLabel: string
}

type SizeAdjustment = {
    id: string
    label: string
    add: number
}

type Addon = {
    name: string
    price: number
    description: string
}

type CeramicService = {
    id: string
    name: string
    price: number
    description: string
    note?: string
}

type PricingCalculatorProps = {
    packages: Package[]
    sizeAdjustments: SizeAdjustment[]
    addons: Addon[]
    ceramicServices: CeramicService[]
}

export function PricingCalculator({
    packages,
    sizeAdjustments,
    addons,
    ceramicServices,
}: PricingCalculatorProps) {
    const router = useRouter()
    const [vehicleSize, setVehicleSize] = useState<string>('car')
    const [selectedPackage, setSelectedPackage] = useState<Package | null>(null)
    const [selectedAddons, setSelectedAddons] = useState<Set<string>>(new Set())
    const [ceramicCoatingSelected, setCeramicCoatingSelected] = useState<boolean>(false)
    const [selectedPaintCorrection, setSelectedPaintCorrection] = useState<string | null>(null)

    // Check if ceramic services are allowed
    const ceramicEnabled = useMemo(() => {
        if (!selectedPackage) return false
        // Prestige Exterior (exterior platinum) or Platinum Package (combo platinum)
        return (
            (selectedPackage.id === 'platinum' && selectedPackage.categoryId === 'combo') ||
            (selectedPackage.id === 'platinum' && selectedPackage.categoryId === 'exterior')
        )
    }, [selectedPackage])

    // Clear ceramic selections when disabled
    useMemo(() => {
        if (!ceramicEnabled) {
            setCeramicCoatingSelected(false)
            setSelectedPaintCorrection(null)
        }
    }, [ceramicEnabled])

    // Calculate totals
    const sizeData = sizeAdjustments.find((s) => s.id === vehicleSize)
    const sizeAdd = sizeData?.add || 0
    const sizeLabel = sizeData?.label || 'Car / Sedan'

    const packagePrice = selectedPackage ? selectedPackage.basePrice + sizeAdd : 0

    const addonsTotal = useMemo(() => {
        let total = 0
        selectedAddons.forEach((addonName) => {
            const addon = addons.find((a) => a.name === addonName)
            if (addon) total += addon.price
        })
        return total
    }, [selectedAddons, addons])

    const ceramicTotal = useMemo(() => {
        let total = 0
        // Ceramic coating
        if (ceramicCoatingSelected) {
            const coating = ceramicServices.find((s) => s.id === 'graphene-coating')
            if (coating) total += coating.price
        }
        // Paint correction (mutually exclusive)
        if (selectedPaintCorrection) {
            const correction = ceramicServices.find((s) => s.id === selectedPaintCorrection)
            if (correction) total += correction.price
        }
        return total
    }, [ceramicCoatingSelected, selectedPaintCorrection, ceramicServices])

    const grandTotal = packagePrice + addonsTotal + ceramicTotal

    const toggleAddon = (name: string) => {
        setSelectedAddons((prev) => {
            const next = new Set(prev)
            if (next.has(name)) {
                next.delete(name)
            } else {
                next.add(name)
            }
            return next
        })
    }

    const toggleCeramicCoating = () => {
        if (!ceramicEnabled) return
        setCeramicCoatingSelected((prev) => !prev)
    }

    const selectPaintCorrection = (id: string | null) => {
        if (!ceramicEnabled) return
        // Toggle off if clicking the same one
        if (selectedPaintCorrection === id) {
            setSelectedPaintCorrection(null)
        } else {
            setSelectedPaintCorrection(id)
        }
    }

    /**
     * Navigate to booking page with all selections as URL params
     */
    const handleBookNow = () => {
        if (!selectedPackage) return

        const ceramicName = ceramicCoatingSelected
            ? ceramicServices.find((s) => s.id === 'graphene-coating')?.name
            : undefined

        const paintCorrectionName = selectedPaintCorrection
            ? ceramicServices.find((s) => s.id === selectedPaintCorrection)?.name
            : undefined

        const params = buildBookingParams({
            category: selectedPackage.categoryId,
            tier: selectedPackage.id,
            size: vehicleSize,
            sizeLabel: sizeLabel,
            addons: Array.from(selectedAddons),
            ceramic: ceramicName,
            paintCorrection: paintCorrectionName,
            total: grandTotal,
            packageName: `${selectedPackage.name} (${selectedPackage.categoryLabel})`,
        })

        router.push(`/booking?${params.toString()}`)
    }

    // Group packages by category for display
    const packagesByCategory = useMemo(() => {
        const grouped: Record<string, Package[]> = {}
        packages.forEach((pkg) => {
            if (!grouped[pkg.categoryId]) {
                grouped[pkg.categoryId] = []
            }
            grouped[pkg.categoryId].push(pkg)
        })
        return grouped
    }, [packages])

    return (
        <div className="space-y-8">
            {/* Vehicle Size */}
            <Reveal skipOnRouteTransition>
                <GlassCard className="p-6">
                    <h3 className="text-white font-semibold text-lg mb-4">
                        1. Select Your Vehicle Size
                    </h3>
                    <div className="flex flex-wrap gap-3" role="radiogroup" aria-label="Vehicle size">
                        {sizeAdjustments.map((size) => {
                            const active = size.id === vehicleSize
                            return (
                                <label
                                    key={size.id}
                                    className={`cursor-pointer select-none px-4 py-3 rounded-lg border text-sm font-medium transition-all duration-200 ${active
                                        ? 'bg-red-600 text-white border-red-600 shadow shadow-red-600/30'
                                        : 'bg-neutral-800 text-neutral-300 border-neutral-600 hover:border-red-600 hover:text-white'
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        name="vehicleSize"
                                        value={size.id}
                                        className="sr-only"
                                        checked={active}
                                        onChange={() => setVehicleSize(size.id)}
                                    />
                                    {size.label}
                                    {size.add > 0 && (
                                        <span className="ml-1 text-neutral-400">+${size.add}</span>
                                    )}
                                </label>
                            )
                        })}
                    </div>
                </GlassCard>
            </Reveal>

            {/* Package Selection */}
            <Reveal delay={0.05} skipOnRouteTransition>
                <GlassCard className="p-6">
                    <h3 className="text-white font-semibold text-lg mb-4">
                        2. Choose Your Package
                    </h3>
                    <div className="space-y-6">
                        {Object.entries(packagesByCategory).map(([categoryId, pkgs]) => (
                            <div key={categoryId}>
                                <h4 className="text-red-500 text-sm uppercase tracking-wide font-medium mb-3">
                                    {pkgs[0]?.categoryLabel}
                                </h4>
                                <div className="grid sm:grid-cols-3 gap-3">
                                    {pkgs.map((pkg) => {
                                        const active = selectedPackage?.id === pkg.id && selectedPackage?.categoryId === pkg.categoryId
                                        const adjustedPrice = pkg.basePrice + sizeAdd
                                        return (
                                            <label
                                                key={`${pkg.categoryId}-${pkg.id}`}
                                                className={`cursor-pointer select-none p-4 rounded-lg border transition-all duration-200 ${active
                                                    ? 'bg-red-600/10 border-red-600 shadow shadow-red-600/20'
                                                    : 'bg-neutral-800/50 border-neutral-600 hover:border-red-600/50'
                                                    }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="selectedPackage"
                                                    className="sr-only"
                                                    checked={active}
                                                    onChange={() => setSelectedPackage(pkg)}
                                                />
                                                <div className="flex items-start justify-between mb-1">
                                                    <span className={`font-medium ${active ? 'text-white' : 'text-neutral-200'}`}>
                                                        {pkg.name}
                                                    </span>
                                                    <span className={`font-display ${active ? 'text-red-400' : 'text-red-500'}`}>
                                                        ${adjustedPrice}
                                                    </span>
                                                </div>
                                                {pkg.tagline && (
                                                    <p className="text-neutral-400 text-xs italic">{pkg.tagline}</p>
                                                )}
                                            </label>
                                        )
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </GlassCard>
            </Reveal>

            {/* Add-ons */}
            <Reveal delay={0.1} skipOnRouteTransition>
                <GlassCard className="p-6">
                    <h3 className="text-white font-semibold text-lg mb-4">
                        3. Add Extra Services <span className="text-neutral-400 font-normal text-sm">(optional)</span>
                    </h3>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {addons.map((addon) => {
                            const active = selectedAddons.has(addon.name)
                            return (
                                <label
                                    key={addon.name}
                                    className={`cursor-pointer select-none p-4 rounded-lg border transition-all duration-200 ${active
                                        ? 'bg-red-600/10 border-red-600'
                                        : 'bg-neutral-800/50 border-neutral-600 hover:border-red-600/50'
                                        }`}
                                >
                                    <input
                                        type="checkbox"
                                        className="sr-only"
                                        checked={active}
                                        onChange={() => toggleAddon(addon.name)}
                                    />
                                    <div className="flex items-start justify-between mb-1">
                                        <span className={`font-medium text-sm ${active ? 'text-white' : 'text-neutral-200'}`}>
                                            {addon.name}
                                        </span>
                                        <span className="text-red-500 text-sm">+${addon.price}</span>
                                    </div>
                                    <p className="text-neutral-400 text-xs">{addon.description}</p>
                                </label>
                            )
                        })}
                    </div>
                </GlassCard>
            </Reveal>

            {/* Ceramic Coating & Paint Correction */}
            <Reveal delay={0.15} skipOnRouteTransition>
                <GlassCard className={`p-6 ${!ceramicEnabled ? 'opacity-60' : ''}`}>
                    <h3 className="text-white font-semibold text-lg mb-2">
                        4. Ceramic Coating & Paint Correction{' '}
                        <span className="text-neutral-400 font-normal text-sm">(optional)</span>
                    </h3>
                    {!ceramicEnabled && (
                        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 mb-4">
                            <p className="text-amber-400 text-sm">
                                ⚠️ Ceramic coating and paint correction require <strong>Prestige Exterior</strong> or <strong>Platinum Package</strong>.
                            </p>
                        </div>
                    )}
                    <div className="space-y-4">
                        {/* Ceramic Coating - Checkbox */}
                        {ceramicServices.filter(s => s.id === 'graphene-coating').map((service) => (
                            <label
                                key={service.id}
                                className={`block cursor-pointer select-none p-4 rounded-lg border transition-all duration-200 ${!ceramicEnabled
                                    ? 'cursor-not-allowed bg-neutral-800/30 border-neutral-700'
                                    : ceramicCoatingSelected
                                        ? 'bg-red-600/10 border-red-600'
                                        : 'bg-neutral-800/50 border-neutral-600 hover:border-red-600/50'
                                    }`}
                            >
                                <input
                                    type="checkbox"
                                    className="sr-only"
                                    checked={ceramicCoatingSelected}
                                    disabled={!ceramicEnabled}
                                    onChange={toggleCeramicCoating}
                                />
                                <div className="flex items-start justify-between mb-1">
                                    <span className={`font-medium ${ceramicEnabled && ceramicCoatingSelected ? 'text-white' : 'text-neutral-300'}`}>
                                        {service.name}
                                    </span>
                                    <span className="text-red-500 font-display">+${service.price}</span>
                                </div>
                                <p className="text-neutral-400 text-sm">{service.description}</p>
                                {service.note && (
                                    <p className="text-neutral-500 text-xs italic mt-1">{service.note}</p>
                                )}
                            </label>
                        ))}

                        {/* Paint Correction - Radio Group (mutually exclusive) */}
                        <div className="border-t border-neutral-700 pt-4">
                            <p className="text-neutral-400 text-sm mb-3">Paint Correction <span className="text-neutral-500">(choose one)</span></p>
                            <div className="space-y-3">
                                {ceramicServices.filter(s => s.id.startsWith('paint-correction')).map((service) => {
                                    const active = selectedPaintCorrection === service.id
                                    return (
                                        <label
                                            key={service.id}
                                            className={`block cursor-pointer select-none p-4 rounded-lg border transition-all duration-200 ${!ceramicEnabled
                                                ? 'cursor-not-allowed bg-neutral-800/30 border-neutral-700'
                                                : active
                                                    ? 'bg-red-600/10 border-red-600'
                                                    : 'bg-neutral-800/50 border-neutral-600 hover:border-red-600/50'
                                                }`}
                                        >
                                            <input
                                                type="radio"
                                                name="paintCorrection"
                                                className="sr-only"
                                                checked={active}
                                                disabled={!ceramicEnabled}
                                                onChange={() => selectPaintCorrection(service.id)}
                                            />
                                            <div className="flex items-start justify-between mb-1">
                                                <span className={`font-medium ${ceramicEnabled && active ? 'text-white' : 'text-neutral-300'}`}>
                                                    {service.name}
                                                </span>
                                                <span className="text-red-500 font-display">+${service.price}</span>
                                            </div>
                                            <p className="text-neutral-400 text-sm">{service.description}</p>
                                        </label>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                </GlassCard>
            </Reveal>

            {/* Price Summary & Book */}
            <Reveal delay={0.2} skipOnRouteTransition>
                <GlassCard className="p-6" gradient="subtle">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        <div>
                            <h3 className="text-white font-semibold text-lg mb-3">Your Estimate</h3>
                            <div className="space-y-1 text-sm">
                                {selectedPackage ? (
                                    <div className="flex justify-between gap-8 text-neutral-300">
                                        <span>{selectedPackage.name} ({selectedPackage.categoryLabel})</span>
                                        <span>${packagePrice}</span>
                                    </div>
                                ) : (
                                    <p className="text-neutral-400 italic">Select a package to see pricing</p>
                                )}
                                {addonsTotal > 0 && (
                                    <div className="flex justify-between gap-8 text-neutral-300">
                                        <span>Add-ons ({selectedAddons.size})</span>
                                        <span>+${addonsTotal}</span>
                                    </div>
                                )}
                                {ceramicTotal > 0 && (
                                    <div className="flex justify-between gap-8 text-neutral-300">
                                        <span>Ceramic/Polish ({(ceramicCoatingSelected ? 1 : 0) + (selectedPaintCorrection ? 1 : 0)})</span>
                                        <span>+${ceramicTotal}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="text-right">
                                <p className="text-neutral-400 text-sm">Estimated Total</p>
                                <p className="font-display text-4xl text-white">
                                    <span className="text-red-500">${grandTotal}</span>
                                    <span className="text-neutral-500 text-base align-top ml-1">+*</span>
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={handleBookNow}
                                disabled={!selectedPackage}
                                className={`px-6 py-3 rounded-lg font-semibold text-white transition-all duration-200 shadow-lg ${selectedPackage
                                    ? 'bg-red-600 hover:bg-red-700 shadow-red-600/30 cursor-pointer'
                                    : 'bg-neutral-600 cursor-not-allowed'
                                    }`}
                            >
                                Book Now
                            </button>
                        </div>
                    </div>
                    <p className="text-neutral-500 text-xs mt-4">
                        * Final price may vary based on vehicle condition. Contact us for an exact quote.
                    </p>
                </GlassCard>
            </Reveal>
        </div>
    )
}
