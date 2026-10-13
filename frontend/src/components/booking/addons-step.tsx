'use client'

import { useBookingCopy } from './booking-copy'

import type { CatalogAddon } from '@/lib/content/types'
import { formatCents } from '@/lib/content/catalog'
import { optionCardClass } from './option-card'

interface AddonsStepProps {
  addons: CatalogAddon[]
  selectedAddonIds: string[]
  onToggle: (id: string) => void
}

export function AddonsStep({ addons, selectedAddonIds, onToggle }: AddonsStepProps) {
  const text = useBookingCopy()
  return (
    <div>
      <h3 className="text-white font-semibold text-xl mb-1">{text('addonsHeading')}</h3>
      <p className="text-neutral-400 mb-6">
        {text('addonsDescription')}
      </p>
      <div className="grid sm:grid-cols-2 gap-3">
        {addons.map((addon) => {
          const active = selectedAddonIds.includes(addon.id)
          return (
            <label
              key={addon.id}
              className={optionCardClass(active)}
            >
              <input
                type="checkbox"
                className="sr-only"
                checked={active}
                onChange={() => onToggle(addon.id)}
              />
              <div className="flex items-start justify-between gap-3 mb-1">
                <span className="flex items-center gap-2.5 font-medium text-white">
                  <span
                    aria-hidden="true"
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                      active ? 'border-red-500 bg-red-500' : 'border-white/30'
                    }`}
                  >
                    {active && (
                      <svg className="h-3 w-3 text-white" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M3 8.5l3 3 7-7" /></svg>
                    )}
                  </span>
                  {addon.name}
                </span>
                <span className="text-neutral-300 tabular">+{formatCents(addon.priceCents)}</span>
              </div>
              <p className="pl-6.5 text-neutral-400 text-sm">{addon.description}</p>
            </label>
          )
        })}
      </div>
    </div>
  )
}
