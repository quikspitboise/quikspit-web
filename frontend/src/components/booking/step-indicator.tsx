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
    <nav aria-label="Booking progress" className="mb-8">
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
                className={`flex items-center gap-2 group ${
                  isCompleted ? 'cursor-pointer' : isFuture ? 'cursor-default' : 'cursor-default'
                }`}
                aria-current={isCurrent ? 'step' : undefined}
              >
                {/* Circle */}
                <span
                  className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold shrink-0 transition-colors duration-150 ${
                    isCompleted
                      ? 'bg-red-600 text-white group-hover:bg-red-500'
                      : isCurrent
                        ? 'bg-red-600 text-white ring-2 ring-red-400/50 ring-offset-2 ring-offset-neutral-900'
                        : 'bg-neutral-800 text-neutral-500 border border-neutral-700'
                  }`}
                >
                  {isCompleted ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    i + 1
                  )}
                </span>
                {/* Label */}
                <span
                  className={`text-xs font-medium whitespace-nowrap ${
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
                <div className="flex-1 mx-2">
                  <div
                    className={`h-px transition-colors duration-150 ${
                      i < currentStep ? 'bg-red-600' : 'bg-neutral-700'
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
        <div className="w-full h-1 bg-neutral-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-red-600 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>
    </nav>
  )
}
