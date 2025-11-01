import React from 'react'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

const buttonVariants = {
  variant: {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    danger: 'btn-danger',
    success: 'btn-success',
    ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
    outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-primary-500',
  },
  size: {
    sm: 'btn-sm',
    md: '',
    lg: 'btn-lg',
  },
}

export function Button({
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  type = 'button',
  onClick,
  ...props
}) {
  const baseClasses = buttonVariants.variant[variant] || buttonVariants.variant.primary
  const sizeClasses = buttonVariants.size[size] || ''

  return (
    <button
      type={type}
      className={cn(
        'btn',
        baseClasses,
        sizeClasses,
        (loading || disabled) && 'opacity-50 cursor-not-allowed',
        className
      )}
      disabled={loading || disabled}
      onClick={onClick}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}

      {icon && iconPosition === 'left' && !loading && (
        <span className="mr-2">{icon}</span>
      )}

      {children}

      {icon && iconPosition === 'right' && !loading && (
        <span className="ml-2">{icon}</span>
      )}
    </button>
  )
}

export function IconButton({
  icon,
  className = '',
  variant = 'ghost',
  size = 'md',
  loading = false,
  disabled = false,
  tooltip,
  ...props
}) {
  return (
    <button
      className={cn(
        'p-2 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2',
        {
          'hover:bg-gray-100 focus:ring-gray-500': variant === 'ghost',
          'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500': variant === 'primary',
          'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500': variant === 'danger',
          'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-primary-500': variant === 'outline',
        },
        (loading || disabled) && 'opacity-50 cursor-not-allowed',
        className
      )}
      disabled={loading || disabled}
      title={tooltip}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        icon
      )}
    </button>
  )
}