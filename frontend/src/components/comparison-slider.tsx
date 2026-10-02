'use client'

import { useCallback, useMemo, useState } from 'react'
import { CldImage } from 'next-cloudinary'

type ComparisonSliderProps = {
	beforeUrl: string
	afterUrl: string
	altBefore?: string
	altAfter?: string
	initialPosition?: number // 0-100
	className?: string
	imageFit?: 'cover' | 'contain'
	sizes?: string
	/** Load eagerly; set for above-the-fold instances. */
	priority?: boolean
}

function clampPosition(value: number) {
	return Number.isFinite(value) ? Math.min(100, Math.max(0, value)) : 50
}

export function ComparisonSlider({
	beforeUrl,
	afterUrl,
	altBefore = 'Before image',
	altAfter = 'After image',
	initialPosition = 50,
	className = '',
	imageFit = 'cover',
	sizes = '(max-width: 640px) 100vw, 50vw',
	priority = false,
}: ComparisonSliderProps) {
	const [position, setPosition] = useState<number>(() => clampPosition(initialPosition))
	const clipStyle = useMemo(() => ({ clipPath: `polygon(0 0, ${position}% 0, ${position}% 100%, 0 100%)` }), [position])
	const imageClassName = `${imageFit === 'contain' ? 'object-contain' : 'object-cover'} select-none`

	const onChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		const nextPosition = Number(e.target.value)
		if (Number.isFinite(nextPosition)) setPosition(clampPosition(nextPosition))
	}, [])

	return (
		<div className={`group relative w-full aspect-4/3 rounded-xl overflow-hidden bg-brand-charcoal-light has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-red-500 ${className}`.trim()}>
			{/* After image as base layer */}
			<CldImage src={afterUrl} alt={altAfter} fill sizes={sizes} format="auto" quality="auto" className={imageClassName} priority={priority} />

			{/* Before image clipped to position (keeps full size, clips using CSS) */}
			<div className="absolute inset-0 pointer-events-none" style={clipStyle} aria-hidden>
				<CldImage src={beforeUrl} alt={altBefore} fill sizes={sizes} format="auto" quality="auto" className={imageClassName} priority={priority} />
			</div>

			{/* Divider + handle */}
			<div className="absolute inset-y-0" style={{ left: `${position}%` }}>
				{/* divider line - subtle */}
				<div className="-ml-[0.5px] h-full w-px bg-white/70" />
				{/* handle - compact and low-key; highlights on hover/focus */}
				<div className="absolute top-1/2 -translate-y-1/2 -ml-3">
						<div className="h-7 w-7 rounded-full bg-white text-neutral-800 border border-white/80 shadow-md flex items-center justify-center motion-safe:transition-all motion-safe:duration-200 pointer-events-none group-hover:bg-white group-has-[:focus-visible]:bg-red-600 group-has-[:focus-visible]:text-white">
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
				aria-valuetext={`${position}% before image, ${100 - position}% after image`}
				className="absolute inset-0 w-full h-full appearance-none bg-transparent opacity-0 cursor-col-resize focus:outline-none focus-visible:outline-none"
			/>

			{/* focus ring handled by container focus-within classes */}
		</div>
	)
}

export default ComparisonSlider
