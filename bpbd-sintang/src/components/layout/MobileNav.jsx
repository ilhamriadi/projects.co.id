import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'
import {
  Home,
  FileText,
  PlusCircle,
  CheckCircle,
  BarChart3,
  MapPin,
  Download,
  Users,
} from 'lucide-react'

const mobileNavigation = {
  desa: [
    { name: 'Beranda', href: '/desa', icon: Home },
    { name: 'Buat', href: '/desa/create', icon: PlusCircle },
    { name: 'Laporan', href: '/desa/reports', icon: FileText },
  ],
  kecamatan: [
    { name: 'Beranda', href: '/kecamatan', icon: Home },
    { name: 'Verifikasi', href: '/kecamatan/verify', icon: CheckCircle },
    { name: 'Data', href: '/kecamatan/reports', icon: FileText },
  ],
  bpbd: [
    { name: 'Beranda', href: '/bpbd', icon: Home },
    { name: 'Laporan', href: '/bpbd/reports', icon: FileText },
    { name: 'Analitik', href: '/bpbd/analytics', icon: BarChart3 },
    { name: 'Peta', href: '/bpbd/map', icon: MapPin },
    { name: 'Export', href: '/bpbd/export', icon: Download },
    { name: 'User', href: '/bpbd/users', icon: Users },
  ],
}

export function MobileNav() {
  const location = useLocation()
  const { getUserRole } = useAuth()
  const userRole = getUserRole()
  const navigation = mobileNavigation[userRole] || []

  return (
    <nav className="mobile-nav">
      <div className="flex justify-around items-center h-16">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href
          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={cn(
                'flex flex-col items-center justify-center space-y-1 px-3 py-2 text-xs font-medium transition-colors',
                isActive
                  ? 'text-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              )}
            >
              <item.icon
                className={cn(
                  'w-5 h-5',
                  isActive ? 'text-primary-600' : 'text-gray-400'
                )}
              />
              <span>{item.name}</span>
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}