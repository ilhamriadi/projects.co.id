import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { LoadingSpinner } from './LoadingSpinner'

export function ProtectedRoute({
  children,
  requiredRole = null,
  requiredRoles = [],
  requiredPermission = null,
  redirectTo = '/login'
}) {
  const { isAuthenticated, loading, getUserRole, hasPermission } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />
  }

  // Check if specific role is required
  if (requiredRole) {
    const userRole = getUserRole()
    if (userRole !== requiredRole) {
      return <Navigate to="/unauthorized" replace />
    }
  }

  // Check if any of the specified roles are required
  if (requiredRoles.length > 0) {
    const userRole = getUserRole()
    if (!requiredRoles.includes(userRole)) {
      return <Navigate to="/unauthorized" replace />
    }
  }

  // Check if specific permission is required
  if (requiredPermission) {
    if (!hasPermission(requiredPermission)) {
      return <Navigate to="/unauthorized" replace />
    }
  }

  return children
}

// HOC for protecting components
export function withAuth(Component, options = {}) {
  return function AuthenticatedComponent(props) {
    return (
      <ProtectedRoute {...options}>
        <Component {...props} />
      </ProtectedRoute>
    )
  }
}

// Route specific wrappers
export function DesaRoute({ children }) {
  return (
    <ProtectedRoute requiredRole="desa">
      {children}
    </ProtectedRoute>
  )
}

export function KecamatanRoute({ children }) {
  return (
    <ProtectedRoute requiredRole="kecamatan">
      {children}
    </ProtectedRoute>
  )
}

export function BpbdRoute({ children }) {
  return (
    <ProtectedRoute requiredRole="bpbd">
      {children}
    </ProtectedRoute>
  )
}

export function AnyAuthRoute({ children }) {
  return (
    <ProtectedRoute requiredRoles={['desa', 'kecamatan', 'bpbd']}>
      {children}
    </ProtectedRoute>
  )
}

export function AdminRoute({ children }) {
  return (
    <ProtectedRoute
      requiredRoles={['bpbd']}
      requiredPermission="manage_users"
    >
      {children}
    </ProtectedRoute>
  )
}