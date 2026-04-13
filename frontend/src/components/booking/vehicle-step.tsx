'use client'

import type { SizeAdjustment } from './booking-data'

interface VehicleStepProps {
  sizeAdjustments: SizeAdjustment[]
  vehicleSize: string
  onSelect: (sizeId: string) => void
}

export function VehicleStep({ sizeAdjustments, vehicleSize, onSelect }: VehicleStepProps) {
  return (
    <div>
      <h3 className="text-white font-semibold text-lg mb-2">Select Your Vehicle Size</h3>
      <p className="text-neutral-400 text-sm mb-5">
        Pricing adjusts based on vehicle size. Choose what best describes your vehicle.
      </p>
      <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="Vehicle size">
        {sizeAdjustments.map((size) => {
          const active = size.id === vehicleSize
          return (
            <label
              key={size.id}
              className={`cursor-pointer select-none px-4 py-4 rounded-xl border text-sm font-medium transition-colors duration-150 ${
                active
                  ? 'bg-red-600/15 text-white border-red-600 shadow-sm shadow-red-600/20'
                  : 'bg-neutral-800/60 text-neutral-300 border-neutral-700 hover:border-neutral-500 hover:text-white'
              }`}
            >
              <input
                type="radio"
                name="vehicleSize"
                value={size.id}
                className="sr-only"
                checked={active}
                onChange={() => onSelect(size.id)}
              />
              <span className="block">{size.label}</span>
              {size.add > 0 && (
                <span className={`text-xs mt-1 block ${active ? 'text-red-300' : 'text-neutral-500'}`}>
                  +${size.add} adjustment
                </span>
              )}
            </label>
          )
        })}
      </div>
    </div>
  )
}
