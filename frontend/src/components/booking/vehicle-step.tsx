'use client'

import type { SizeAdjustment } from './booking-data'
import { optionCardClass } from './option-card'

interface VehicleStepProps {
  sizeAdjustments: SizeAdjustment[]
  vehicleSize: string
  onSelect: (sizeId: string) => void
}

export function VehicleStep({ sizeAdjustments, vehicleSize, onSelect }: VehicleStepProps) {
  return (
    <div>
      <h3 className="text-white font-semibold text-xl mb-1">What are we detailing?</h3>
      <p className="text-neutral-400 mb-6">
        Bigger vehicles take longer, so the price goes up a little with size.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" role="radiogroup" aria-label="Vehicle size">
        {sizeAdjustments.map((size) => {
          const active = size.id === vehicleSize
          return (
            <label
              key={size.id}
              className={optionCardClass(active, 'flex items-center justify-between gap-3')}
            >
              <input
                type="radio"
                name="vehicleSize"
                value={size.id}
                className="sr-only"
                checked={active}
                onChange={() => onSelect(size.id)}
              />
              <span className="font-medium text-white">{size.label}</span>
              <span className={`text-sm tabular ${active ? 'text-red-300' : 'text-neutral-500'}`}>
                {size.add > 0 ? `+$${size.add}` : 'Base price'}
              </span>
            </label>
          )
        })}
      </div>
    </div>
  )
}
