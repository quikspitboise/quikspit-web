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
		<div className="relative w-full aspect-[16/10] rounded-lg overflow-hidden border border-neutral-700 bg-neutral-800">
			{/* After image as base layer */}
			<Image src={afterUrl} alt={altAfter} fill sizes="(max-width: 640px) 100vw, 50vw" className="object-cover select-none" priority={false} />

			{/* Before image clipped to position (keeps full size, clips using CSS) */}
			<div className="absolute inset-0 pointer-events-none" style={clipStyle} aria-hidden>
				<Image src={beforeUrl} alt={altBefore} fill sizes="(max-width: 640px) 100vw, 50vw" className="object-cover select-none" />
			</div>

			{/* Divider handle */}
			<div className="absolute inset-y-0" style={{ left: `${position}%` }}>
				<div className="-ml-[1px] h-full w-0.5 bg-white/70" />
				<div className="absolute top-1/2 -translate-y-1/2 -ml-3 h-6 w-6 rounded-full bg-red-600 border-2 border-white shadow" />
			</div>

			{/* Accessible range input overlay */}
			<input
				type="range"
				min={0}
				max={100}
				value={position}
				onChange={onChange}
				aria-label="Before and after comparison slider"
				className="absolute inset-0 w-full h-full opacity-0 cursor-col-resize focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-800"
			/>
		</div>
	)
}

export default ComparisonSlider


