'use client'

import type { CeramicService } from './booking-data'
import { getPaintCorrectionUpgradePrice } from './pricing-utils'
import { CeramicInfoPopover } from '@/components/ceramic-info-popover'
import { optionCardClass } from './option-card'

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
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mb-1">
        <h3 className="text-white font-semibold text-xl">Protect the paint?</h3>
        <CeramicInfoPopover />
      </div>
      <p className="text-neutral-400 mb-6">
        Optional. Your package qualifies for ceramic coating and paint correction.
      </p>

      <div className="space-y-4">
        {/* Ceramic Coating Toggle */}
        {ceramicServices
          .filter((s) => s.id === 'graphene-coating')
          .map((service) => (
            <label
              key={service.id}
              className={optionCardClass(ceramicCoatingSelected)}
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
                    ceramicCoatingSelected ? 'text-white' : 'text-neutral-200'
                  }`}
                >
                  {service.name}
                </span>
                <span className="text-white font-display text-lg tabular">+${service.price}</span>
              </div>
              <p className="text-neutral-400 text-sm">{service.description}</p>
              {service.note && (
                <p className="text-neutral-500 text-sm mt-1">{service.note}</p>
              )}
            </label>
          ))}

        {/* Paint Correction Options */}
        <div className="border-t border-white/10 pt-5">
          {ceramicCoatingSelected ? (
            <>
              <p className="mb-4 flex items-center gap-2 text-sm text-emerald-300">
                <svg className="h-4 w-4 shrink-0" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 8.5l3 3 7-7" /></svg>
                A 1-step paint correction comes with the coating.
              </p>
              <p className="text-neutral-400 text-sm mb-3">Optional upgrade</p>
              <div className="space-y-3">
                {(() => {
                  const active = selectedPaintCorrection === 'paint-correction-2-upgrade'
                  return (
                    <label
                      className={optionCardClass(active)}
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
                          Upgrade to a 2-step correction
                        </span>
                        <span className="text-white font-display text-lg tabular">+${upgradePrice}</span>
                      </div>
                      <p className="text-neutral-400 text-sm">
                        Compounding followed by polishing. Removes the most defects of any option.
                      </p>
                    </label>
                  )
                })()}
              </div>
            </>
          ) : (
            <>
              <p className="text-neutral-400 text-sm mb-3">
                Paint correction <span className="text-neutral-500">(choose one, or none)</span>
              </p>
              <div className="space-y-3">
                {ceramicServices
                  .filter((s) => s.id.startsWith('paint-correction'))
                  .map((service) => {
                    const active = selectedPaintCorrection === service.id
                    return (
                      <label
                        key={service.id}
                        className={optionCardClass(active)}
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
                          <span className="text-white font-display text-lg tabular">+${service.price}</span>
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
