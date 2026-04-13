'use client'

import type { Addon } from './booking-data'

interface AddonsStepProps {
  addons: Addon[]
  selectedAddons: Set<string>
  onToggle: (name: string) => void
}

export function AddonsStep({ addons, selectedAddons, onToggle }: AddonsStepProps) {
  return (
    <div>
      <h3 className="text-white font-semibold text-lg mb-2">
        Add Extra Services{' '}
        <span className="text-neutral-400 font-normal text-sm">(optional)</span>
      </h3>
      <p className="text-neutral-400 text-sm mb-5">
        Enhance your detail with any of these add-ons. Skip this step if none apply.
      </p>
      <div className="grid sm:grid-cols-2 gap-3">
        {addons.map((addon) => {
          const active = selectedAddons.has(addon.name)
          return (
            <label
              key={addon.name}
              className={`cursor-pointer select-none p-4 rounded-xl border transition-colors duration-150 ${
                active
                  ? 'bg-red-600/10 border-red-600'
                  : 'bg-neutral-800/50 border-neutral-700 hover:border-neutral-500'
              }`}
            >
              <input
                type="checkbox"
                className="sr-only"
                checked={active}
                onChange={() => onToggle(addon.name)}
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
    </div>
  )
}
