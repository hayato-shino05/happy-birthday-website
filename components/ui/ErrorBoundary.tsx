'use client'

import { Component, ErrorInfo, ReactNode } from 'react'
import { Icon } from './Icon'
import { LANGUAGE_COOKIE_NAME } from '@/lib/i18n/cookie'
import { DEFAULT_LOCALE, translate } from '@/lib/i18n/resolveLocale'
import type { Locale } from '@/lib/i18n/types'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

function readLocaleFromCookie(): Locale {
  if (typeof document === 'undefined') return DEFAULT_LOCALE
  const match = document.cookie.match(new RegExp(`${LANGUAGE_COOKIE_NAME}=([^;]+)`))
  const value = match?.[1]
  return value === 'en' ? 'en' : DEFAULT_LOCALE
}

function DefaultErrorFallback({ onRetry, message }: { onRetry: () => void; message?: string }) {
  const locale = readLocaleFromCookie()
  return (
    <div className="min-h-[200px] flex items-center justify-center">
      <div className="bg-red-500/10 backdrop-blur-md rounded-2xl p-6 border border-red-500/20 text-center max-w-md">
        <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
          <Icon name="AlertTriangle" size={24} className="text-rose-300" aria-hidden="true" />
        </div>
        <h3 className="text-lg font-bold text-white mb-2">{translate(locale, 'error', DEFAULT_LOCALE)}</h3>
        <p className="text-white/70 text-sm mb-4">
          {message || translate(locale, 'unexpectedError', DEFAULT_LOCALE)}
        </p>
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors cursor-pointer"
        >
          {translate(locale, 'retry', DEFAULT_LOCALE)}
        </button>
      </div>
    </div>
  )
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <DefaultErrorFallback
          message={this.state.error?.message}
          onRetry={() => this.setState({ hasError: false, error: undefined })}
        />
      )
    }

    return this.props.children
  }
}
