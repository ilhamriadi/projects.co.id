import React, { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'
import {
  Home,
  FileText,
  PlusCircle,
  CheckCircle,
  MapPin,
  BarChart3,
  Download,
  Users,
  Bell,
  LogOut,
  Menu,
  X,
  Shield,
  AlertTriangle
} from 'lucide-react'
import { RoleBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'

const navigation = {
  desa: [
    { name: 'Dashboard', href: '/desa', icon: Home },
    { name: 'Buat Laporan', href: '/desa/create', icon: PlusCircle },
    { name: 'Laporan Saya', href: '/desa/reports', icon: FileText },
  ],
  kecamatan: [
    { name: 'Dashboard', href: '/kecamatan', icon: Home },
    { name: 'Verifikasi Laporan', href: '/kecamatan/verify', icon: CheckCircle },
    { name: 'Data Laporan', href: '/kecamatan/reports', icon: FileText },
  ],
  bpbd: [
    { name: 'Dashboard', href: '/bpbd', icon: Home },
    { name: 'Semua Laporan', href: '/bpbd/reports', icon: FileText },
    { name: 'Analitik', href: '/bpbd/analytics', icon: BarChart3 },
    { name: 'Peta Bencana', href: '/bpbd/map', icon: MapPin },
    { name: 'Export Data', href: '/bpbd/export', icon: Download },
    { name: 'Kelola User', href: '/bpbd/users', icon: Users },
  ],
}

export function Sidebar({ isOpen, onClose, mobile = false }) {
  const location = useLocation()
  const { user, logout, getUserRole, getUserKecamatan, getUserDesa } = useAuth()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const userRole = getUserRole()
  const userNavigation = navigation[userRole] || []
  const fullName = user?.profile?.full_name || user?.user_metadata?.full_name || 'User'
  const kecamatan = getUserKecamatan()
  const desa = getUserDesa()

  const handleLogout = async () => {
    setIsLoggingOut(true)
    await logout()
    setIsLoggingOut(false)
  }

  const sidebarClasses = cn(
    'sidebar',
    mobile ? 'fixed inset-y-0 left-0 z-50' : 'hidden lg:fixed lg:inset-y-0 lg:left-0',
    isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
    'transition-transform duration-300 ease-in-out'
  )

  return (
    <>
      {/* Mobile backdrop */}
      {mobile && isOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={sidebarClasses}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
            <div className="flex items-center">
              <Shield className="w-8 h-8 text-primary-600 mr-3" />
              <div>
                <h1 className="text-lg font-bold text-gray-900">BPBD Sintang</h1>
                <p className="text-xs text-gray-500">Sistem Pendataan Bencana</p>
              </div>
            </div>
            {mobile && (
              <button
                onClick={onClose}
                className="lg:hidden p-1 rounded-md text-gray-400 hover:text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* User Info */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                  <span className="text-primary-600 font-medium">
                    {fullName.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {fullName}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <RoleBadge role={userRole} size="sm" />
                  {kecamatan && (
                    <span className="text-xs text-gray-500">
                      Kec. {kecamatan}
                    </span>
                  )}
                  {desa && (
                    <span className="text-xs text-gray-500">
                      Desa {desa}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            {userNavigation.map((item) => {
              const isActive = location.pathname === item.href
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  onClick={() => mobile && onClose()}
                  className={cn(
                    'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                    isActive
                      ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <item.icon
                    className={cn(
                      'mr-3 h-5 w-5 flex-shrink-0',
                      isActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-500'
                    )}
                  />
                  {item.name}
                </NavLink>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="border-t border-gray-200 p-4">
            <Button
              variant="ghost"
              onClick={handleLogout}
              loading={isLoggingOut}
              className="w-full justify-start"
            >
              <LogOut className="w-4 h-4 mr-3" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}

export function MobileSidebar({ isOpen, onClose }) {
  return <Sidebar isOpen={isOpen} onClose={onClose} mobile={true} />
}