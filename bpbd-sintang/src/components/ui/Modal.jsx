import React, { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'
import { X } from 'lucide-react'

export function Modal({
  open = false,
  onClose,
  title,
  description,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnBackdrop = true,
  className = '',
  ...props
}) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [open])

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && open) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [open, onClose])

  if (!open) return null

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-7xl',
  }

  const handleBackdropClick = (event) => {
    if (closeOnBackdrop && event.target === event.currentTarget) {
      onClose()
    }
  }

  const modal = (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          aria-hidden="true"
          onClick={handleBackdropClick}
        />

        {/* Center modal */}
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
          &#8203;
        </span>

        <div
          className={cn(
            'inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:w-full',
            sizeClasses[size],
            className
          )}
          {...props}
        >
          {/* Header */}
          {(title || description || showCloseButton) && (
            <div className="px-6 pt-6 pb-4 border-b border-gray-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {title && (
                    <h3 className="text-lg font-semibold text-gray-900" id="modal-title">
                      {title}
                    </h3>
                  )}
                  {description && (
                    <p className="text-sm text-gray-600 mt-1">
                      {description}
                    </p>
                  )}
                </div>
                {showCloseButton && (
                  <button
                    type="button"
                    className="ml-4 flex-shrink-0 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-md p-1"
                    onClick={onClose}
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Content */}
          <div className="px-6 py-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  )

  return createPortal(modal, document.body)
}

export function ConfirmModal({
  open = false,
  onClose,
  onConfirm,
  title = 'Konfirmasi',
  message,
  confirmText = 'Ya',
  cancelText = 'Batal',
  confirmVariant = 'primary',
  loading = false,
  icon,
  ...props
}) {
  const confirmClasses = {
    primary: 'btn-primary',
    danger: 'btn-danger',
    success: 'btn-success',
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      {...props}
    >
      <div className="text-center">
        {icon && (
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 mb-4">
            {icon}
          </div>
        )}
        <p className="text-gray-600">{message}</p>
      </div>

      <div className="mt-6 flex gap-3 justify-center">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onClose}
          disabled={loading}
        >
          {cancelText}
        </button>
        <button
          type="button"
          className={cn('btn', confirmClasses[confirmVariant])}
          onClick={onConfirm}
          disabled={loading}
        >
          {loading ? 'Memproses...' : confirmText}
        </button>
      </div>
    </Modal>
  )
}

export function AlertModal({
  open = false,
  onClose,
  title = 'Perhatian',
  message,
  buttonText = 'OK',
  icon,
  variant = 'info',
  ...props
}) {
  const iconColors = {
    info: 'text-blue-600 bg-blue-100',
    success: 'text-green-600 bg-green-100',
    warning: 'text-yellow-600 bg-yellow-100',
    error: 'text-red-600 bg-red-100',
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      {...props}
    >
      <div className="text-center">
        {icon && (
          <div className={cn('mx-auto flex items-center justify-center h-12 w-12 rounded-full mb-4', iconColors[variant])}>
            {icon}
          </div>
        )}
        <p className="text-gray-600">{message}</p>
      </div>

      <div className="mt-6 flex justify-center">
        <button
          type="button"
          className="btn btn-primary"
          onClick={onClose}
        >
          {buttonText}
        </button>
      </div>
    </Modal>
  )
}