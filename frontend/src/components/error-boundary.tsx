'use client'

import React, { Component, ReactNode } from 'react'
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
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
        <div className="min-h-screen bg-transparent flex items-center justify-center px-4">
          <div className="max-w-2xl w-full bg-brand-charcoal-light border border-neutral-600 rounded-xl shadow-2xl p-8 sm:p-12 text-center">
            {/* Error Icon */}
            <div className="w-20 h-20 bg-red-600/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg 
                className="w-10 h-10 text-red-600" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
                />
              </svg>
            </div>

            {/* Error Message */}
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Oops! Something Went Wrong
            </h1>
            <p className="text-lg text-neutral-300 mb-8">
              We encountered an unexpected error. Don&apos;t worry, our team has been notified and we&apos;re working on it.
            </p>

            {/* Error Details (only in development) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mb-8 text-left bg-neutral-800 border border-neutral-700 rounded-lg p-4">
                <summary className="cursor-pointer text-red-600 font-semibold mb-2">
                  Error Details (Development Only)
                </summary>
                <div className="text-xs text-neutral-400 font-mono overflow-auto">
                  <p className="text-red-500 mb-2">{this.state.error.toString()}</p>
                  {this.state.errorInfo && (
                    <pre className="whitespace-pre-wrap break-words">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  )}
                </div>
              </details>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={this.handleReset}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-neutral-800"
              >
                Try Again
              </button>
              <Link
                href="/"
                className="border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-neutral-800 inline-block"
              >
                Go Home
              </Link>
              <Link
                href="/contact"
                className="border-2 border-neutral-600 text-neutral-300 hover:border-red-600 hover:text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-neutral-800 inline-block"
              >
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
