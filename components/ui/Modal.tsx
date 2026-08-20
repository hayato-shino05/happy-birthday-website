'use client'

import { useEffect, useCallback, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Icon } from './Icon'
import { useLanguage } from '@/lib/i18n/LanguageContext'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  description?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full' | 'widescreen'
  showCloseButton?: boolean
  closeOnBackdrop?: boolean
  closeOnEscape?: boolean
  footer?: React.ReactNode
  centered?: boolean
  scrollBehavior?: 'inside' | 'outside'
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
  full: 'max-w-7xl',
  widescreen: 'max-w-6xl',
}

export default function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnBackdrop = true,
  closeOnEscape = true,
  footer,
  centered = true,
  scrollBehavior = 'inside',
}: ModalProps) {
  const { t } = useLanguage()
  const [isAnimating, setIsAnimating] = useState(false)
  const [shouldRender, setShouldRender] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)
  const previousActiveElement = useRef<HTMLElement | null>(null)

  // Escape キー押下時のクローズ処理
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && closeOnEscape) {
        onClose()
      }
    },
    [onClose, closeOnEscape]
  )

  // Tab キーによるフォーカストラップの処理
  const handleTab = useCallback((e: KeyboardEvent) => {
    if (e.key !== 'Tab' || !modalRef.current) return

    const focusableElements = modalRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

    if (e.shiftKey && document.activeElement === firstElement) {
      e.preventDefault()
      lastElement?.focus()
    } else if (!e.shiftKey && document.activeElement === lastElement) {
      e.preventDefault()
      firstElement?.focus()
    }
  }, [])

  // アニメーションとライフサイクル管理
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement
      setShouldRender(true)
      requestAnimationFrame(() => {
        setIsAnimating(true)
      })
      document.body.style.overflow = 'hidden'
      document.addEventListener('keydown', handleEscape)
      document.addEventListener('keydown', handleTab)

      // Focus first focusable element
      setTimeout(() => {
        const firstFocusable = modalRef.current?.querySelector(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        ) as HTMLElement
        firstFocusable?.focus()
      }, 100)
    } else {
      setIsAnimating(false)
      setTimeout(() => {
        setShouldRender(false)
        document.body.style.overflow = ''
        previousActiveElement.current?.focus()
      }, 200)
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.removeEventListener('keydown', handleTab)
      document.body.style.overflow = ''
    }
  }, [isOpen, handleEscape, handleTab])

  if (!shouldRender) return null

  const modalContent = (
    <div
      className={`fixed inset-0 ${centered ? 'flex items-center justify-center' : ''} ${
        scrollBehavior === 'outside' ? 'overflow-y-auto' : ''
      }`}
      style={{ zIndex: 99999 }}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
      aria-describedby={description ? 'modal-description' : undefined}
    >
      {/* 背景のオーバーレイ */}
      <div
        className={`fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-200 ${
          isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={closeOnBackdrop ? onClose : undefined}
        aria-hidden="true"
      />

      {/* モーダル全体のコンテナ */}
      <div
        className={`${scrollBehavior === 'outside' ? 'min-h-full py-4 md:py-8' : ''} ${
          centered ? '' : 'pt-8 md:pt-16'
        } px-2 md:px-4 w-full flex items-start md:items-center justify-center pointer-events-none pt-4 md:pt-0 overflow-y-auto`}
        style={{ maxHeight: '100vh' }}
      >
        {/* ビンテージスタイルのモーダルコンテンツ */}
        <div
          ref={modalRef}
          style={{
            background: '#FFF9F3',
            border: '3px solid #D4B08C',
            borderRadius: '16px',
            boxShadow: '8px 8px 0 #D4B08C',
            maxHeight: '90vh',
            minHeight: size === 'widescreen' ? '80vh' : undefined,
            overflow: 'hidden',
            display: size === 'widescreen' ? 'flex' : undefined,
            flexDirection: size === 'widescreen' ? 'column' : undefined,
            marginTop: '10px',
            marginBottom: '10px',
          }}
          className={`
            relative w-full ${sizeClasses[size]}
            transition-all duration-200 ease-out
            pointer-events-auto
            ${isAnimating ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'}
          `}
          onClick={(e) => e.stopPropagation()}
        >
          {/* ヘッダー */}
          {(title || showCloseButton) && (
            <div 
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '20px',
                borderBottom: '2px solid #D4B08C',
              }}
            >
              <div>
                {title && (
                  <h2
                    id="modal-title"
                    style={{
                      color: '#854D27',
                      fontFamily: 'var(--font-heading)',
                      fontSize: '1.5rem',
                      fontWeight: 'bold',
                      margin: 0,
                    }}
                  >
                    {title}
                  </h2>
                )}
                {description && (
                  <p
                    id="modal-description"
                    style={{
                      color: '#854D27',
                      opacity: 0.7,
                      marginTop: '4px',
                      fontSize: '0.9rem',
                    }}
                  >
                    {description}
                  </p>
                )}
              </div>
              {showCloseButton && (
                <button
                  onClick={onClose}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '1.5rem',
                    cursor: 'pointer',
                    color: '#854D27',
                    padding: '5px',
                    lineHeight: 1,
                  }}
                  aria-label={t('close')}
                >
                  <Icon name="Close" size={24} className="text-rose-500" aria-hidden="true" />
                </button>
              )}
            </div>
          )}

          {/* 本文 */}
          <div
            style={{ 
              padding: '20px',
              flex: size === 'widescreen' ? 1 : undefined,
              minHeight: size === 'widescreen' ? 0 : undefined,
            }}
            className={scrollBehavior === 'inside' && size !== 'widescreen' ? 'max-h-[60vh] overflow-y-auto' : size === 'widescreen' ? 'overflow-y-auto' : ''}
          >
            {children}
          </div>

          {/* フッター */}
          {footer && (
            <div 
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '12px',
                padding: '20px',
                borderTop: '2px solid #D4B08C',
                background: 'rgba(212, 176, 140, 0.1)',
              }}
            >
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  )

  // モーダルを document.body にポータルとして描画
  if (typeof window !== 'undefined') {
    return createPortal(modalContent, document.body)
  }

  return modalContent
}

// 確認用モーダルコンポーネント
interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'info'
  isLoading?: boolean
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText,
  variant = 'danger',
  isLoading = false,
}: ConfirmModalProps) {
  const { t } = useLanguage()
  const resolvedConfirmText = confirmText ?? t('confirm')
  const resolvedCancelText = cancelText ?? t('cancel')
  const variantStyles = {
    danger: {
      icon: <Icon name="AlertTriangle" size={24} className="text-rose-300" />,
      iconBg: 'bg-red-500/20',
      confirmClass: 'bg-red-500 hover:bg-red-600',
    },
    warning: {
      icon: <Icon name="AlertTriangle" size={24} className="text-amber-300" />,
      iconBg: 'bg-yellow-500/20',
      confirmClass: 'bg-yellow-500 hover:bg-yellow-600',
    },
    info: {
      icon: <Icon name="Info" size={24} className="text-sky-300" />,
      iconBg: 'bg-blue-500/20',
      confirmClass: 'bg-blue-500 hover:bg-blue-600',
    },
  }

  const style = variantStyles[variant]

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" showCloseButton={false}>
      <div className="text-center">
        <div className={`w-14 h-14 rounded-full ${style.iconBg} flex items-center justify-center mx-auto mb-4`}>
          {style.icon}
        </div>
        <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
        <p className="text-white/70 mb-6">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-colors cursor-pointer disabled:opacity-50"
          >
            {resolvedCancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 px-4 py-2.5 ${style.confirmClass} text-white rounded-lg font-medium transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2`}
          >
            {isLoading && (
              <Icon name="LoaderCircle" size={16} className="animate-spin" aria-hidden="true" />
            )}
            {resolvedConfirmText}
          </button>
        </div>
      </div>
    </Modal>
  )
}
