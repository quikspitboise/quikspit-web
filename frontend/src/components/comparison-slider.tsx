'use client'

import { useCallback, useMemo, useState } from 'react'
import Image from 'next/image'

type ComparisonSliderProps = {
	beforeUrl: string
	afterUrl: string
	altBefore?: string
	altAfter?: string
	initialPosition?: number // 0-100
}

export function ComparisonSlider({ beforeUrl, afterUrl, altBefore = 'Before image', altAfter = 'After image', initialPosition = 50 }: ComparisonSliderProps) {
	const [position, setPosition] = useState<number>(Math.min(100, Math.max(0, initialPosition)))
	const clipStyle = useMemo(() => ({ clipPath: `polygon(0 0, ${position}% 0, ${position}% 100%, 0 100%)` }), [position])

	const onChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		setPosition(parseInt(e.target.value, 10))
	}, [])

	return (
		<div className="group relative w-full aspect-[16/10] rounded-xl overflow-hidden border border-neutral-600 bg-brand-charcoal-light focus-within:ring-2 focus-within:ring-red-600 focus-within:ring-offset-2 focus-within:ring-offset-brand-charcoal-light">
			{/* After image as base layer */}
			<Image src={afterUrl} alt={altAfter} fill sizes="(max-width: 640px) 100vw, 50vw" className="object-cover select-none" priority={false} />

			{/* Before image clipped to position (keeps full size, clips using CSS) */}
			<div className="absolute inset-0 pointer-events-none" style={clipStyle} aria-hidden>
				<Image src={beforeUrl} alt={altBefore} fill sizes="(max-width: 640px) 100vw, 50vw" className="object-cover select-none" />
			</div>

			{/* Divider + handle */}
			<div className="absolute inset-y-0" style={{ left: `${position}%` }}>
				{/* divider line - subtle */}
				<div className="-ml-[0.5px] h-full w-px bg-white/70" />
				{/* handle - compact and low-key; highlights on hover/focus */}
				<div className="absolute top-1/2 -translate-y-1/2 -ml-3">
						<div className="h-7 w-7 rounded-full bg-white text-neutral-800 border border-white/80 shadow-md flex items-center justify-center transition-all duration-200 pointer-events-none group-hover:bg-white group-focus-within:bg-red-600 group-focus-within:text-white">
							<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
							<polyline points="14 18 8 12 14 6"></polyline>
							<polyline points="10 18 16 12 10 6"></polyline>
						</svg>
						</div>
				</div>
			</div>

			{/* Accessible range input overlay */}
			<input
				type="range"
				min={0}
				max={100}
				value={position}
				onChange={onChange}
				aria-label="Before and after comparison slider"
				className="absolute inset-0 w-full h-full appearance-none bg-transparent opacity-0 cursor-col-resize focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-charcoal-light"
			/>

			{/* focus ring handled by container focus-within classes */}
		</div>
	)
}

export default ComparisonSlider


