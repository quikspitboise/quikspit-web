'use client'

interface Step {
  label: string
  shortLabel: string
}

interface StepIndicatorProps {
  steps: Step[]
  currentStep: number
  /** Called when user clicks a completed step to jump back */
  onStepClick: (index: number) => void
}

export function StepIndicator({ steps, currentStep, onStepClick }: StepIndicatorProps) {
  return (
    <nav aria-label="Booking progress" className="mb-6">
      {/* Desktop: full horizontal bar */}
      <ol className="hidden sm:flex items-center justify-between gap-2">
        {steps.map((step, i) => {
          const isCompleted = i < currentStep
          const isCurrent = i === currentStep
          const isFuture = i > currentStep

          return (
            <li key={i} className="flex items-center flex-1 last:flex-none">
              <button
                type="button"
                disabled={isFuture}
                onClick={() => isCompleted && onStepClick(i)}
                className={`flex min-h-11 items-center gap-2.5 rounded-md group ${isCompleted ? 'cursor-pointer' : 'cursor-default'}`}
                aria-current={isCurrent ? 'step' : undefined}
              >
                {/* Circle */}
                <span
                  className={`flex items-center justify-center w-7 h-7 rounded-full text-sm font-semibold tabular shrink-0 transition-colors duration-300 ${
                    isCompleted
                      ? 'bg-white/10 text-white group-hover:bg-white/20'
                      : isCurrent
                        ? 'bg-red-600 text-white'
                        : 'border border-white/15 text-neutral-500'
                  }`}
                >
                  {isCompleted ? (
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    i + 1
                  )}
                </span>
                {/* Label */}
                <span
                  className={`text-sm font-medium whitespace-nowrap ${
                    isCompleted
                      ? 'text-neutral-300 group-hover:text-white'
                      : isCurrent
                        ? 'text-white'
                        : 'text-neutral-500'
                  }`}
                >
                  {step.label}
                </span>
              </button>
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className="flex-1 mx-3 h-px bg-white/10 overflow-hidden" aria-hidden="true">
                  <div
                    className={`h-full bg-red-600 origin-left transition-transform duration-500 ease-out-expo ${
                      i < currentStep ? 'scale-x-100' : 'scale-x-0'
                    }`}
                  />
                </div>
              )}
            </li>
          )
        })}
      </ol>

      {/* Mobile: compact text + progress bar */}
      <div className="sm:hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-neutral-400">
            Step {currentStep + 1} of {steps.length}
          </span>
          <span className="text-sm text-white font-medium">
            {steps[currentStep]?.label}
          </span>
        </div>
        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden" aria-hidden="true">
          <div
            className="h-full bg-red-600 rounded-full origin-left transition-transform duration-500 ease-out-expo"
            style={{ transform: `scaleX(${(currentStep + 1) / steps.length})` }}
          />
        </div>
      </div>
    </nav>
  )
}
