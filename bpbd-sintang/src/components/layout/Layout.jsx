import React, { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { ProtectedRoute } from '@/components/ui/ProtectedRoute'
import { Sidebar, MobileSidebar } from './Sidebar'
import { Header } from './Header'
import { MobileNav } from './MobileNav'
import { LoadingScreen } from '@/components/ui/LoadingSpinner'

export function Layout({ children, requiredRole = null }) {
  const { loading, isAuthenticated, getUserRole } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const userRole = getUserRole()

  if (loading) {
    return <LoadingScreen message="Memuat aplikasi..." />
  }

  if (!isAuthenticated) {
    return children // Will be handled by routes
  }

  return (
    <ProtectedRoute requiredRole={requiredRole}>
      <div className="min-h-screen bg-gray-50">
        {/* Mobile sidebar */}
        <MobileSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Desktop sidebar */}
        <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
          <Sidebar isOpen={true} />
        </div>

        {/* Main content */}
        <div className="lg:pl-64">
          {/* Header */}
          <Header
            onMenuClick={() => setSidebarOpen(true)}
            showMenuButton={true}
          />

          {/* Page content */}
          <main className="flex-1 pb-16 lg:pb-0">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              {children}
            </div>
          </main>

          {/* Mobile navigation */}
          <div className="lg:hidden">
            <MobileNav />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}

export function PublicLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="flex-1">
        {children}
      </main>
    </div>
  )
}