import React from 'react'
import { cn } from '@/lib/utils'

export function LoadingSpinner({
  size = 'md',
  className = '',
  text = ''
}) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  }

  return (
    <div className={cn('flex items-center justify-center', className)}>
      <div className="relative">
        <div
          className={cn(
            'animate-spin rounded-full border-2 border-gray-200 border-t-primary-600',
            sizeClasses[size]
          )}
        />
        {text && (
          <span className="ml-2 text-sm text-gray-600">{text}</span>
        )}
      </div>
    </div>
  )
}

export function LoadingScreen({ message = 'Memuat...' }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <LoadingSpinner size="xl" className="mb-4" />
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  )
}

export function LoadingCard({ className = '' }) {
  return (
    <div className={cn('animate-pulse', className)}>
      <div className="bg-gray-200 h-48 rounded-lg"></div>
    </div>
  )
}

export function LoadingTable({ rows = 5, columns = 4 }) {
  return (
    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
      <table className="min-w-full divide-y divide-gray-300">
        <thead className="bg-gray-50">
          <tr>
            {Array.from({ length: columns }).map((_, index) => (
              <th key={index} className="px-6 py-3">
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <tr key={rowIndex}>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <td key={colIndex} className="px-6 py-4 whitespace-nowrap">
                  <div className="h-4 bg-gray-100 rounded animate-pulse"></div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}