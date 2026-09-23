'use client'

import React, { Component, createRef, ReactNode } from 'react'
import Link from 'next/link'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private readonly fallbackRef = createRef<HTMLDivElement>()

  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(_error: Error): Partial<ErrorBoundaryState> {
    // Update state so the next render will show the fallback UI
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error details for debugging
    console.error('Error Boundary caught an error:', error, errorInfo)
    
    this.setState({
      error,
      errorInfo,
    })

    // You can also log the error to an error reporting service here
    // Example: logErrorToService(error, errorInfo)
  }

  componentDidUpdate(_previousProps: ErrorBoundaryProps, previousState: ErrorBoundaryState) {
    if (!previousState.hasError && this.state.hasError) {
      this.fallbackRef.current?.focus()
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          ref={this.fallbackRef}
          className="min-h-[70vh] container mx-auto px-5 sm:px-6 lg:px-8 py-20 lg:py-32"
          role="alert"
          tabIndex={-1}
        >
          <h1 className="font-display text-3xl sm:text-5xl text-white uppercase">Something broke on this page</h1>
          <p className="mt-5 max-w-lg text-lg text-neutral-400 text-pretty">
            Try loading it again. If it keeps happening, call or text (208) 960-4970 and we&apos;ll book you in by phone.
          </p>

          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details className="mt-8 max-w-3xl rounded-lg border border-white/10 p-4 text-left">
              <summary className="cursor-pointer text-red-400 font-medium">Error details (development only)</summary>
              <div className="mt-3 text-xs text-neutral-400 font-mono overflow-auto">
                <p className="text-red-400 mb-2">{this.state.error.toString()}</p>
                {this.state.errorInfo && (
                  <pre className="whitespace-pre-wrap break-words">{this.state.errorInfo.componentStack}</pre>
                )}
              </div>
            </details>
          )}

          <div className="mt-10 flex flex-col sm:flex-row gap-3">
            <button type="button" onClick={this.handleReset} className="btn-primary inline-flex min-h-11 items-center justify-center px-5">
              Try again
            </button>
            <Link href="/" onClick={this.handleReset} className="btn-secondary inline-flex min-h-11 items-center justify-center px-5">
              Go to the home page
            </Link>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
