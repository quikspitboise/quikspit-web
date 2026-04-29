'use client'

import type { CeramicService } from './booking-data'
import { getPaintCorrectionUpgradePrice } from './pricing-utils'
import { CeramicInfoPopover } from '@/components/ceramic-info-popover'

interface CeramicStepProps {
  ceramicServices: CeramicService[]
  ceramicCoatingSelected: boolean
  selectedPaintCorrection: string | null
  onToggleCeramic: () => void
  onSelectPaintCorrection: (id: string | null) => void
}

export function CeramicStep({
  ceramicServices,
  ceramicCoatingSelected,
  selectedPaintCorrection,
  onToggleCeramic,
  onSelectPaintCorrection,
}: CeramicStepProps) {
  const upgradePrice = getPaintCorrectionUpgradePrice(ceramicServices)

  return (
    <div>
      <h3 className="text-white font-semibold text-lg mb-2 flex items-center gap-2">
        Ceramic Coating & Paint Correction{' '}
        <span className="text-neutral-400 font-normal text-sm">(optional)</span>
        <CeramicInfoPopover />
      </h3>
      <p className="text-neutral-400 text-sm mb-5">
        Protect and perfect your paint with ceramic coating and paint correction services.
      </p>

      <div className="space-y-4">
        {/* Ceramic Coating Toggle */}
        {ceramicServices
          .filter((s) => s.id === 'graphene-coating')
          .map((service) => (
            <label
              key={service.id}
              className={`block cursor-pointer select-none p-4 rounded-xl border transition-colors duration-150 ${
                ceramicCoatingSelected
                  ? 'bg-red-600/10 border-red-600'
                  : 'bg-neutral-800/50 border-neutral-700 hover:border-neutral-500'
              }`}
            >
              <input
                type="checkbox"
                className="sr-only"
                checked={ceramicCoatingSelected}
                onChange={onToggleCeramic}
              />
              <div className="flex items-start justify-between mb-1">
                <span
                  className={`font-medium ${
                    ceramicCoatingSelected ? 'text-white' : 'text-neutral-300'
                  }`}
                >
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

        {/* Paint Correction Options */}
        <div className="border-t border-neutral-700 pt-4">
          {ceramicCoatingSelected ? (
            <>
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 mb-4">
                <p className="text-green-400 text-sm">
                  ✓ <strong>1-Step Paint Correction included</strong> with your ceramic coating
                  selection.
                </p>
              </div>
              <p className="text-neutral-400 text-sm mb-3">
                Want more? <span className="text-neutral-500">(optional upgrade)</span>
              </p>
              <div className="space-y-3">
                {(() => {
                  const active = selectedPaintCorrection === 'paint-correction-2-upgrade'
                  return (
                    <label
                      className={`block cursor-pointer select-none p-4 rounded-xl border transition-colors duration-150 ${
                        active
                          ? 'bg-red-600/10 border-red-600'
                          : 'bg-neutral-800/50 border-neutral-700 hover:border-neutral-500'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paintCorrection"
                        className="sr-only"
                        checked={active}
                        onClick={() => {
                          if (active) onSelectPaintCorrection(null)
                        }}
                        onChange={() => {
                          if (!active) onSelectPaintCorrection('paint-correction-2-upgrade')
                        }}
                      />
                      <div className="flex items-start justify-between mb-1">
                        <span className={`font-medium ${active ? 'text-white' : 'text-neutral-300'}`}>
                          Upgrade to 2-Step Paint Correction
                        </span>
                        <span className="text-red-500 font-display">+${upgradePrice}</span>
                      </div>
                      <p className="text-neutral-400 text-sm">
                        Maximum defect removal with multi-stage compounding and polishing for a
                        flawless finish.
                      </p>
                    </label>
                  )
                })()}
              </div>
            </>
          ) : (
            <>
              <p className="text-neutral-400 text-sm mb-3">
                Paint Correction <span className="text-neutral-500">(choose one)</span>
              </p>
              <div className="space-y-3">
                {ceramicServices
                  .filter((s) => s.id.startsWith('paint-correction'))
                  .map((service) => {
                    const active = selectedPaintCorrection === service.id
                    return (
                      <label
                        key={service.id}
                        className={`block cursor-pointer select-none p-4 rounded-xl border transition-colors duration-150 ${
                          active
                            ? 'bg-red-600/10 border-red-600'
                            : 'bg-neutral-800/50 border-neutral-700 hover:border-neutral-500'
                        }`}
                      >
                        <input
                          type="radio"
                          name="paintCorrection"
                          className="sr-only"
                          checked={active}
                          onClick={() => {
                            if (active) onSelectPaintCorrection(null)
                          }}
                          onChange={() => {
                            if (!active) onSelectPaintCorrection(service.id)
                          }}
                        />
                        <div className="flex items-start justify-between mb-1">
                          <span
                            className={`font-medium ${active ? 'text-white' : 'text-neutral-300'}`}
                          >
                            {service.name}
                          </span>
                          <span className="text-red-500 font-display">+${service.price}</span>
                        </div>
                        <p className="text-neutral-400 text-sm">{service.description}</p>
                      </label>
                    )
                  })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
