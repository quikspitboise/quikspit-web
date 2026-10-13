'use client'

import { useBookingCopy } from './booking-copy'

import type { CeramicService } from '@/lib/content/types'
import { formatCents } from '@/lib/content/catalog'
import { siteCopy } from '@/lib/content/fields'
import { CeramicInfoPopover } from '@/components/ceramic-info-popover'
import { useSiteContent } from '@/components/content/site-content-context'
import { optionCardClass } from './option-card'

interface CeramicStepProps {
  coatings: CeramicService[]
  /** Corrections on offer with the chosen coating, priced as charged. */
  corrections: { service: CeramicService; amountCents: number }[]
  includedCorrection?: CeramicService
  coatingId?: string
  correctionId?: string
  onSelectCoating: (id: string | undefined) => void
  onSelectCorrection: (id: string | undefined) => void
}

function CheckMark() {
  return (
    <svg className="h-4 w-4 shrink-0" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 8.5l3 3 7-7" /></svg>
  )
}

export function CeramicStep({
  coatings,
  corrections,
  includedCorrection,
  coatingId,
  correctionId,
  onSelectCoating,
  onSelectCorrection,
}: CeramicStepProps) {
  const text = useBookingCopy()
  const site = useSiteContent()

  return (
    <div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mb-1">
        <h3 className="text-white font-semibold text-xl">{text('ceramicHeading')}</h3>
        <CeramicInfoPopover title={siteCopy(site, 'ceramicInfo.title')} body={siteCopy(site, 'ceramicInfo.body')} />
      </div>
      <p className="text-neutral-400 mb-6">
        {text('ceramicDescription')}
      </p>

      <div className="space-y-4">
        {coatings.map((service) => {
          const active = coatingId === service.id
          return (
            <label key={service.id} className={optionCardClass(active)}>
              <input
                type="checkbox"
                className="sr-only"
                checked={active}
                onChange={() => onSelectCoating(active ? undefined : service.id)}
              />
              <div className="flex items-start justify-between gap-3 mb-1">
                <span className={`font-medium ${active ? 'text-white' : 'text-neutral-200'}`}>
                  {service.name}
                </span>
                <span className="text-white font-display text-lg tabular">+{formatCents(service.priceCents)}</span>
              </div>
              <p className="text-neutral-400 text-sm">{service.description}</p>
              {service.note && (
                <p className="text-neutral-500 text-sm mt-1">{service.note}</p>
              )}
            </label>
          )
        })}

        {corrections.length > 0 && (
          <div className={coatings.length > 0 ? 'border-t border-white/10 pt-5' : ''}>
            {includedCorrection ? (
              <>
                <p className="mb-4 flex items-center gap-2 text-sm text-emerald-300">
                  <CheckMark />
                  {text('includedCorrectionMessage', { service: includedCorrection.name })}
                </p>
                <p className="text-neutral-400 text-sm mb-3">{text('upgradeLabel')}</p>
              </>
            ) : (
              <p className="text-neutral-400 text-sm mb-3">
                {text('correctionLabel')} <span className="text-neutral-500">{text('correctionChoiceHint')}</span>
              </p>
            )}
            <div className="space-y-3">
              {corrections.map(({ service, amountCents }) => {
                const active = correctionId === service.id
                return (
                  <label key={service.id} className={optionCardClass(active)}>
                    <input
                      type="radio"
                      name="paintCorrection"
                      className="sr-only"
                      checked={active}
                      onClick={() => {
                        if (active) onSelectCorrection(undefined)
                      }}
                      onChange={() => {
                        if (!active) onSelectCorrection(service.id)
                      }}
                    />
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <span className={`font-medium ${active ? 'text-white' : 'text-neutral-300'}`}>
                        {includedCorrection ? text('upgradeServiceLabel', { service: service.name }) : service.name}
                      </span>
                      <span className="text-white font-display text-lg tabular">+{formatCents(amountCents)}</span>
                    </div>
                    <p className="text-neutral-400 text-sm">{service.description}</p>
                  </label>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
