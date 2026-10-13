'use client'

import { useBookingCopy } from './booking-copy'

import type { VehicleSize } from '@/lib/content/types'
import { formatCents } from '@/lib/content/catalog'
import { optionCardClass } from './option-card'

interface VehicleStepProps {
  sizes: VehicleSize[]
  vehicleSizeId: string
  onSelect: (sizeId: string) => void
}

export function VehicleStep({ sizes, vehicleSizeId, onSelect }: VehicleStepProps) {
  const text = useBookingCopy()
  return (
    <div>
      <h3 className="text-white font-semibold text-xl mb-1">{text('vehicleHeading')}</h3>
      <p className="text-neutral-400 mb-6">
        {text('vehicleDescription')}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" role="radiogroup" aria-label={text('vehicleGroupLabel')}>
        {sizes.map((size) => {
          const active = size.id === vehicleSizeId
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
                {size.surchargeCents > 0 ? `+${formatCents(size.surchargeCents)}` : text('basePriceLabel')}
              </span>
            </label>
          )
        })}
      </div>
    </div>
  )
}
