import React from 'react'
import { cn } from '@/lib/utils'

export function Card({
  className = '',
  children,
  hover = false,
  padding = 'normal',
  ...props
}) {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    normal: 'p-6',
    lg: 'p-8',
  }

  return (
    <div
      className={cn(
        'card',
        paddingClasses[padding],
        hover && 'card-hover',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({
  className = '',
  children,
  ...props
}) {
  return (
    <div
      className={cn('mb-4', className)}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardTitle({
  className = '',
  children,
  ...props
}) {
  return (
    <h3
      className={cn('text-lg font-semibold text-gray-900', className)}
      {...props}
    >
      {children}
    </h3>
  )
}

export function CardDescription({
  className = '',
  children,
  ...props
}) {
  return (
    <p
      className={cn('text-sm text-gray-600 mt-1', className)}
      {...props}
    >
      {children}
    </p>
  )
}

export function CardContent({
  className = '',
  children,
  ...props
}) {
  return (
    <div
      className={cn('', className)}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardFooter({
  className = '',
  children,
  ...props
}) {
  return (
    <div
      className={cn('mt-4 pt-4 border-t border-gray-200', className)}
      {...props}
    >
      {children}
    </div>
  )
}

export function MetricCard({
  title,
  value,
  change,
  changeType = 'neutral',
  icon,
  className = '',
  ...props
}) {
  const changeColors = {
    increase: 'text-green-600 bg-green-100',
    decrease: 'text-red-600 bg-red-100',
    neutral: 'text-gray-600 bg-gray-100',
  }

  return (
    <Card className={cn('', className)} {...props}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900 mt-1">{value}</p>
          {change && (
            <div className={cn('mt-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium', changeColors[changeType])}>
              {change}
            </div>
          )}
        </div>
        {icon && (
          <div className="flex-shrink-0">
            <div className="w-8 h-8 text-gray-400">
              {icon}
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}