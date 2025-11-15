'use client'

import { Button } from '@/components/ui/button'

interface ErrorStateProps {
  title?: string
  message?: string
  onRetry?: () => void
  showHomeButton?: boolean
  icon?: 'error' | 'not-found' | 'network'
}

export function ErrorState({
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Please try again.',
  onRetry,
  showHomeButton = true,
  icon = 'error',
}: ErrorStateProps) {
  const icons = {
    error: (
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
    ),
    'not-found': (
      <svg
        className="w-8 h-8 text-gray-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    network: (
      <svg
        className="w-8 h-8 text-orange-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414"
        />
      </svg>
    ),
  }

  const colorClasses = {
    error: 'bg-red-50 border-red-200',
    'not-found': 'bg-gray-50 border-gray-200',
    network: 'bg-orange-50 border-orange-200',
  }

  const iconBgClasses = {
    error: 'bg-red-100',
    'not-found': 'bg-gray-100',
    network: 'bg-orange-100',
  }

  const titleClasses = {
    error: 'text-red-800',
    'not-found': 'text-gray-800',
    network: 'text-orange-800',
  }

  const messageClasses = {
    error: 'text-red-600',
    'not-found': 'text-gray-600',
    network: 'text-orange-600',
  }

  return (
    <div className="flex items-center justify-center p-4 min-h-[300px]">
      <div className="max-w-md w-full">
        <div className={`border rounded-lg p-6 text-center ${colorClasses[icon]}`}>
          {/* Icon */}
          <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${iconBgClasses[icon]}`}>
            {icons[icon]}
          </div>

          {/* Title */}
          <h3 className={`text-lg font-semibold mb-2 ${titleClasses[icon]}`}>
            {title}
          </h3>

          {/* Message */}
          <p className={`mb-6 ${messageClasses[icon]}`}>
            {message}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {onRetry && (
              <Button
                onClick={onRetry}
                variant="primary"
                className="min-w-[120px]"
              >
                Try Again
              </Button>
            )}
            {showHomeButton && (
              <Button
                onClick={() => window.location.href = '/'}
                variant="outline"
                className="min-w-[120px]"
              >
                Go Home
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Specialized error states for common scenarios
export function NotFoundError({ 
  title = 'Not Found',
  message = 'The page or resource you are looking for does not exist.',
  onRetry,
}: Omit<ErrorStateProps, 'icon'>) {
  return (
    <ErrorState
      title={title}
      message={message}
      onRetry={onRetry}
      icon="not-found"
    />
  )
}

export function NetworkError({
  title = 'Connection Error',
  message = 'Unable to connect to the server. Please check your internet connection and try again.',
  onRetry,
}: Omit<ErrorStateProps, 'icon'>) {
  return (
    <ErrorState
      title={title}
      message={message}
      onRetry={onRetry}
      icon="network"
    />
  )
}
