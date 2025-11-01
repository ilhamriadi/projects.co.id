import React from 'react'
import { cn } from '@/lib/utils'
import { getStatusColor } from '@/lib/utils'

export function Badge({
  children,
  className = '',
  variant = 'default',
  size = 'normal',
  ...props
}) {
  const variantClasses = {
    default: 'badge-gray',
    primary: 'badge-primary',
    success: 'badge-success',
    warning: 'badge-warning',
    danger: 'badge-danger',
    info: 'bg-blue-100 text-blue-800',
  }

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    normal: 'px-2.5 py-0.5 text-xs',
    lg: 'px-3 py-1 text-sm',
  }

  return (
    <span
      className={cn(
        'badge',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}

export function StatusBadge({
  status,
  className = '',
  showLabel = true,
  ...props
}) {
  const statusConfig = {
    draft: {
      label: 'Draft',
      color: 'default',
      description: 'Belum dikirim'
    },
    submitted: {
      label: 'Menunggu Verifikasi',
      color: 'info',
      description: 'Menunggu verifikasi dari Kecamatan'
    },
    verified: {
      label: 'Terverifikasi',
      color: 'success',
      description: 'Telah diverifikasi'
    },
    rejected: {
      label: 'Ditolak',
      color: 'danger',
      description: 'Ditolak, perlu revisi'
    },
  }

  const config = statusConfig[status] || statusConfig.draft

  return (
    <Badge
      variant={config.color}
      className={cn('', className)}
      title={config.description}
      {...props}
    >
      {showLabel && config.label}
    </Badge>
  )
}

export function RoleBadge({
  role,
  className = '',
  ...props
}) {
  const roleConfig = {
    desa: {
      label: 'Desa',
      color: 'default'
    },
    kecamatan: {
      label: 'Kecamatan',
      color: 'info'
    },
    bpbd: {
      label: 'BPBD',
      color: 'primary'
    },
  }

  const config = roleConfig[role] || roleConfig.desa

  return (
    <Badge
      variant={config.color}
      className={cn('', className)}
      {...props}
    >
      {config.label}
    </Badge>
  )
}

export function DisasterTypeBadge({
  type,
  className = '',
  showIcon = true,
  ...props
}) {
  const disasterTypes = {
    banjir: { label: 'Banjir', icon: '💧', color: 'info' },
    longsor: { label: 'Longsor', icon: '🏔️', color: 'default' },
    kebakaran: { label: 'Kebakaran', icon: '🔥', color: 'danger' },
    angin_puting_beliung: { label: 'Angin', icon: '💨', color: 'default' },
    gempa: { label: 'Gempa', icon: '🌍', color: 'warning' },
    kekeringan: { label: 'Kekeringan', icon: '☀️', color: 'warning' },
    lainnya: { label: 'Lainnya', icon: '⚠️', color: 'default' },
  }

  const config = disasterTypes[type] || disasterTypes.lainnya

  return (
    <Badge
      variant={config.color}
      className={cn('flex items-center gap-1', className)}
      {...props}
    >
      {showIcon && <span>{config.icon}</span>}
      {config.label}
    </Badge>
  )
}

export function NotificationBadge({
  count,
  className = '',
  showZero = false,
  max = 99,
  ...props
}) {
  if (!showZero && count === 0) {
    return null
  }

  const displayCount = count > max ? `${max}+` : count

  return (
    <Badge
      variant="danger"
      className={cn('absolute -top-1 -right-1 min-w-[20px] h-5 flex items-center justify-center p-0', className)}
      {...props}
    >
      {displayCount}
    </Badge>
  )
}