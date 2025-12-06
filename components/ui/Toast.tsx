'use client'

import { useState, useEffect, createContext, useContext, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'

type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading'
type ToastPosition = 'top-right' | 'top-left' | 'top-center' | 'bottom-right' | 'bottom-left' | 'bottom-center'

interface Toast {
  id: string
  message: string
  title?: string
  type: ToastType
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
  onClose?: () => void
}

interface ToastContextType {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => string
  removeToast: (id: string) => void
  updateToast: (id: string, toast: Partial<Toast>) => void
  success: (message: string, options?: Partial<Toast>) => string
  error: (message: string, options?: Partial<Toast>) => string
  warning: (message: string, options?: Partial<Toast>) => string
  info: (message: string, options?: Partial<Toast>) => string
  loading: (message: string, options?: Partial<Toast>) => string
  promise: <T>(
    promise: Promise<T>,
    messages: { loading: string; success: string; error: string }
  ) => Promise<T>
}

const ToastContext = createContext<ToastContextType | null>(null)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}

interface ToastProviderProps {
  children: React.ReactNode
  position?: ToastPosition
  maxToasts?: number
}

export function ToastProvider({ children, position = 'bottom-right', maxToasts = 5 }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    setToasts((prev) => {
      const newToasts = [...prev, { ...toast, id }]
      return newToasts.slice(-maxToasts)
    })
    return id
  }, [maxToasts])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const updateToast = useCallback((id: string, updates: Partial<Toast>) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    )
  }, [])

  const success = useCallback(
    (message: string, options?: Partial<Toast>) =>
      addToast({ message, type: 'success', duration: 4000, ...options }),
    [addToast]
  )

  const error = useCallback(
    (message: string, options?: Partial<Toast>) =>
      addToast({ message, type: 'error', duration: 5000, ...options }),
    [addToast]
  )

  const warning = useCallback(
    (message: string, options?: Partial<Toast>) =>
      addToast({ message, type: 'warning', duration: 4000, ...options }),
    [addToast]
  )

  const info = useCallback(
    (message: string, options?: Partial<Toast>) =>
      addToast({ message, type: 'info', duration: 4000, ...options }),
    [addToast]
  )

  const loading = useCallback(
    (message: string, options?: Partial<Toast>) =>
      addToast({ message, type: 'loading', duration: 0, ...options }),
    [addToast]
  )

  const promise = useCallback(
    async <T,>(
      promiseToResolve: Promise<T>,
      messages: { loading: string; success: string; error: string }
    ): Promise<T> => {
      const id = loading(messages.loading)
      try {
        const result = await promiseToResolve
        updateToast(id, { message: messages.success, type: 'success', duration: 4000 })
        return result
      } catch (err) {
        updateToast(id, { message: messages.error, type: 'error', duration: 5000 })
        throw err
      }
    },
    [loading, updateToast]
  )

  const positionClasses: Record<ToastPosition, string> = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'top-center': 'top-4 left-1/2 -translate-x-1/2',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
  }

  return (
    <ToastContext.Provider
      value={{ toasts, addToast, removeToast, updateToast, success, error, warning, info, loading, promise }}
    >
      {children}
      {mounted &&
        createPortal(
          <div
            className={`fixed z-[100] flex flex-col gap-3 pointer-events-none ${positionClasses[position]}`}
            aria-live="polite"
            aria-label="Notifications"
          >
            {toasts.map((toast, index) => (
              <ToastItem
                key={toast.id}
                toast={toast}
                onClose={() => {
                  toast.onClose?.()
                  removeToast(toast.id)
                }}
                index={index}
                position={position}
              />
            ))}
          </div>,
          document.body
        )}
    </ToastContext.Provider>
  )
}

const typeStyles: Record<ToastType, { bg: string; border: string; icon: React.ReactNode }> = {
  success: {
    bg: 'bg-gradient-to-r from-green-500/90 to-emerald-500/90',
    border: 'border-green-400/30',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  error: {
    bg: 'bg-gradient-to-r from-red-500/90 to-rose-500/90',
    border: 'border-red-400/30',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  warning: {
    bg: 'bg-gradient-to-r from-yellow-500/90 to-amber-500/90',
    border: 'border-yellow-400/30',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
  },
  info: {
    bg: 'bg-gradient-to-r from-blue-500/90 to-cyan-500/90',
    border: 'border-blue-400/30',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  loading: {
    bg: 'bg-gradient-to-r from-purple-500/90 to-pink-500/90',
    border: 'border-purple-400/30',
    icon: (
      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
    ),
  },
}

interface ToastItemProps {
  toast: Toast
  onClose: () => void
  index: number
  position: ToastPosition
}

function ToastItem({ toast, onClose, index, position }: ToastItemProps) {
  const [isExiting, setIsExiting] = useState(false)
  const [progress, setProgress] = useState(100)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const progressRef = useRef<NodeJS.Timeout | null>(null)

  const handleClose = useCallback(() => {
    setIsExiting(true)
    setTimeout(onClose, 200)
  }, [onClose])

  useEffect(() => {
    if (toast.duration && toast.duration > 0) {
      const startTime = Date.now()
      const duration = toast.duration

      progressRef.current = setInterval(() => {
        const elapsed = Date.now() - startTime
        const remaining = Math.max(0, 100 - (elapsed / duration) * 100)
        setProgress(remaining)
      }, 50)

      timerRef.current = setTimeout(handleClose, duration)
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      if (progressRef.current) clearInterval(progressRef.current)
    }
  }, [toast.duration, handleClose])

  const style = typeStyles[toast.type]

  const slideDirection = position.includes('right')
    ? 'translate-x-full'
    : position.includes('left')
    ? '-translate-x-full'
    : 'translate-y-full'

  return (
    <div
      className={`
        pointer-events-auto min-w-[320px] max-w-md
        ${style.bg} backdrop-blur-md
        text-white rounded-xl shadow-2xl
        border ${style.border}
        transition-all duration-200 ease-out
        ${isExiting ? `opacity-0 ${slideDirection}` : 'opacity-100 translate-x-0 translate-y-0'}
      `}
      style={{
        animationDelay: `${index * 50}ms`,
      }}
      role="alert"
    >
      <div className="flex items-start gap-3 p-4">
        {/* アイコン */}
        <div className="flex-shrink-0 mt-0.5">{style.icon}</div>

        {/* 本文 */}
        <div className="flex-1 min-w-0">
          {toast.title && (
            <p className="font-semibold text-white mb-0.5">{toast.title}</p>
          )}
          <p className="text-white/90 text-sm">{toast.message}</p>

          {/* アクションボタン */}
          {toast.action && (
            <button
              onClick={() => {
                toast.action?.onClick()
                handleClose()
              }}
              className="mt-2 text-sm font-medium text-white/80 hover:text-white underline underline-offset-2 cursor-pointer"
            >
              {toast.action.label}
            </button>
          )}
        </div>

        {/* 閉じるボタン */}
        {toast.type !== 'loading' && (
          <button
            onClick={handleClose}
            className="flex-shrink-0 w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-colors cursor-pointer"
            aria-label="通知を閉じる"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* プログレスバー */}
      {toast.duration && toast.duration > 0 && (
        <div className="h-1 bg-black/20 rounded-b-xl overflow-hidden">
          <div
            className="h-full bg-white/40 transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  )
}

export default ToastItem
