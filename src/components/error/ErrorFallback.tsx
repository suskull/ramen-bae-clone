'use client'

import { Button } from '@/components/ui/button'

interface ErrorFallbackProps {
  error: Error | null
  resetError?: () => void
  title?: string
  message?: string
}

export function ErrorFallback({
  error,
  resetError,
  title = 'Something went wrong',
  message,
}: ErrorFallbackProps) {
  const errorMessage = message || error?.message || 'An unexpected error occurred'

  return (
    <div className="min-h-[400px] flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          {/* Error Icon */}
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          {/* Error Title */}
          <h3 className="text-lg font-semibold text-red-800 mb-2">
            {title}
          </h3>

          {/* Error Message */}
          <p className="text-red-600 mb-6">
            {errorMessage}
          </p>

          {/* Error Details (Development Only) */}
          {process.env.NODE_ENV === 'development' && error?.stack && (
            <details className="mb-6 text-left">
              <summary className="cursor-pointer text-sm text-red-700 hover:text-red-800 mb-2">
                View error details
              </summary>
              <pre className="text-xs bg-red-100 p-3 rounded overflow-auto max-h-40 text-red-900">
                {error.stack}
              </pre>
            </details>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {resetError && (
              <Button
                onClick={resetError}
                variant="primary"
                className="min-w-[120px]"
              >
                Try Again
              </Button>
            )}
            <Button
              onClick={() => window.location.href = '/'}
              variant="outline"
              className="min-w-[120px]"
            >
              Go Home
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
