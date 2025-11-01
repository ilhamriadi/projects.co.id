import React, { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { NotificationBadge } from '@/components/ui/Badge'
import { IconButton } from '@/components/ui/Button'
import {
  Menu,
  Bell,
  Search,
  User,
  Settings,
  LogOut,
  Wifi,
  WifiOff,
  AlertTriangle
} from 'lucide-react'
import { cn } from '@/lib/utils'

export function Header({ onMenuClick, showMenuButton = true }) {
  const { user, logout, getUserRole, isOnline } = useAuth()
  const [showNotifications, setShowNotifications] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [onlineStatus, setOnlineStatus] = useState(navigator.onLine)

  const fullName = user?.profile?.full_name || user?.user_metadata?.full_name || 'User'
  const userEmail = user?.email || ''

  useEffect(() => {
    const handleOnline = () => setOnlineStatus(true)
    const handleOffline = () => setOnlineStatus(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const handleLogout = async () => {
    setShowUserMenu(false)
    await logout()
  }

  // Mock notifications - replace with real data
  const notifications = [
    {
      id: 1,
      title: 'Laporan Baru',
      message: 'Desa Tanjung melaporkan kebakaran',
      type: 'info',
      read: false,
      time: '5 menit yang lalu'
    },
    {
      id: 2,
      title: 'Verifikasi Berhasil',
      message: 'Laporan #123 telah diverifikasi',
      type: 'success',
      read: false,
      time: '1 jam yang lalu'
    }
  ]

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side */}
          <div className="flex items-center">
            {showMenuButton && (
              <IconButton
                icon={<Menu className="w-5 h-5" />}
                onClick={onMenuClick}
                variant="ghost"
                className="lg:hidden"
              />
            )}

            <div className="hidden sm:flex items-center space-x-4">
              <div className="flex items-center text-sm text-gray-500">
                {onlineStatus ? (
                  <>
                    <Wifi className="w-4 h-4 text-green-500 mr-1" />
                    <span>Online</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-4 h-4 text-red-500 mr-1" />
                    <span>Offline</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Center - Search */}
          <div className="hidden md:flex flex-1 max-w-lg mx-8">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Cari laporan, lokasi, atau..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <div className="relative">
              <IconButton
                icon={<Bell className="w-5 h-5" />}
                onClick={() => {
                  setShowNotifications(!showNotifications)
                  setShowUserMenu(false)
                }}
                variant="ghost"
                tooltip="Notifikasi"
              />
              {unreadCount > 0 && (
                <NotificationBadge count={unreadCount} />
              )}

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="text-sm font-medium text-gray-900">Notifikasi</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length > 0 ? (
                      <div className="divide-y divide-gray-200">
                        {notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={cn(
                              'p-4 hover:bg-gray-50 cursor-pointer',
                              !notification.read && 'bg-blue-50'
                            )}
                          >
                            <div className="flex items-start">
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">
                                  {notification.title}
                                </p>
                                <p className="text-sm text-gray-600 mt-1">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {notification.time}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 text-center text-sm text-gray-500">
                        Tidak ada notifikasi
                      </div>
                    )}
                  </div>
                  <div className="p-3 border-t border-gray-200">
                    <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                      Lihat Semua Notifikasi
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* User Menu */}
            <div className="relative">
              <IconButton
                icon={<User className="w-5 h-5" />}
                onClick={() => {
                  setShowUserMenu(!showUserMenu)
                  setShowNotifications(false)
                }}
                variant="ghost"
                tooltip="Profil"
              />

              {/* User Dropdown */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <div className="p-4 border-b border-gray-200">
                    <p className="text-sm font-medium text-gray-900">{fullName}</p>
                    <p className="text-sm text-gray-500">{userEmail}</p>
                    <div className="mt-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                        {getUserRole()?.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="py-2">
                    <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                      <Settings className="w-4 h-4 mr-3" />
                      Pengaturan
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Search Bar */}
      <div className="md:hidden border-t border-gray-200 px-4 py-3">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Cari laporan..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          />
        </div>
      </div>
    </header>
  )
}