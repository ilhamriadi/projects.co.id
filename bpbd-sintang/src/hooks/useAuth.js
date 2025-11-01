import { useAuthStore } from '@/stores/authStore'
import { useEffect, useState } from 'react'
import { initializeAuth } from '@/stores/authStore'
import toast from 'react-hot-toast'

export function useAuth() {
  const {
    user,
    session,
    loading,
    isAuthenticated,
    login,
    logout,
    register,
    updateProfile,
    changePassword,
    resetPassword,
    refreshSession,
    // Getters
    getUserRole,
    getUserPermissions,
    hasPermission,
    isDesa,
    isKecamatan,
    isBpbd,
    getUserKecamatan,
    getUserDesa,
    canAccessRoute,
    // Setters
    setLoading,
    setUser,
    setSession,
  } = useAuthStore()

  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    const init = async () => {
      if (!initialized) {
        await initializeAuth()
        setInitialized(true)
      }
    }

    init()
  }, [initialized])

  const handleLogin = async (email, password, rememberMe = false) => {
    const result = await login(email, password, rememberMe)

    if (result.success) {
      toast.success('Login berhasil!')
      return result
    } else {
      toast.error(result.error || 'Login gagal')
      return result
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      toast.success('Logout berhasil')
    } catch (error) {
      toast.error('Logout gagal')
    }
  }

  const handleRegister = async (userData) => {
    const result = await register(userData)

    if (result.success) {
      toast.success('Registrasi berhasil! Silakan cek email Anda.')
      return result
    } else {
      toast.error(result.error || 'Registrasi gagal')
      return result
    }
  }

  const handleUpdateProfile = async (updates) => {
    const result = await updateProfile(updates)

    if (result.success) {
      toast.success('Profil berhasil diperbarui')
      return result
    } else {
      toast.error(result.error || 'Gagal memperbarui profil')
      return result
    }
  }

  const handleChangePassword = async (currentPassword, newPassword) => {
    const result = await changePassword(currentPassword, newPassword)

    if (result.success) {
      toast.success('Password berhasil diubah')
      return result
    } else {
      toast.error(result.error || 'Gagal mengubah password')
      return result
    }
  }

  const handleResetPassword = async (email) => {
    const result = await resetPassword(email)

    if (result.success) {
      toast.success('Link reset password telah dikirim ke email Anda')
      return result
    } else {
      toast.error(result.error || 'Gagal mengirim link reset password')
      return result
    }
  }

  const requireAuth = (requiredRole = null) => {
    if (!isAuthenticated) {
      return false
    }

    if (requiredRole) {
      const userRole = getUserRole()
      if (userRole !== requiredRole) {
        return false
      }
    }

    return true
  }

  const requireAnyRole = (roles = []) => {
    if (!isAuthenticated) {
      return false
    }

    const userRole = getUserRole()
    return roles.includes(userRole)
  }

  const requirePermission = (permission) => {
    if (!isAuthenticated) {
      return false
    }

    return hasPermission(permission)
  }

  return {
    // State
    user,
    session,
    loading: loading || !initialized,
    isAuthenticated,
    initialized,

    // Actions
    login: handleLogin,
    logout: handleLogout,
    register: handleRegister,
    updateProfile: handleUpdateProfile,
    changePassword: handleChangePassword,
    resetPassword: handleResetPassword,
    refreshSession,

    // Getters
    getUserRole,
    getUserPermissions,
    hasPermission,
    isDesa,
    isKecamatan,
    isBpbd,
    getUserKecamatan,
    getUserDesa,
    canAccessRoute,

    // Auth helpers
    requireAuth,
    requireAnyRole,
    requirePermission,

    // Setters
    setLoading,
    setUser,
    setSession,
  }
}