import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { supabase } from '@/lib/supabase'
import { USER_ROLES } from '@/lib/constants'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      session: null,
      loading: true,
      isAuthenticated: false,

      // Actions
      setLoading: (loading) => set({ loading }),

      setUser: (user) => set({ user, isAuthenticated: !!user }),

      setSession: (session) => {
        set({ session, user: session?.user || null, isAuthenticated: !!session?.user })
      },

      login: async (email, password, rememberMe = false) => {
        try {
          set({ loading: true })

          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
            options: {
              // Persist session based on remember me checkbox
              ...(rememberMe ? {} : { expiresIn: '1h' })
            }
          })

          if (error) {
            throw error
          }

          if (data.user) {
            // Fetch user profile data
            const { data: profile, error: profileError } = await supabase
              .from('users')
              .select('*')
              .eq('id', data.user.id)
              .single()

            if (profileError) {
              console.error('Error fetching user profile:', profileError)
            }

            const userWithProfile = {
              ...data.user,
              profile: profile || null
            }

            set({
              user: userWithProfile,
              session: data.session,
              isAuthenticated: true,
              loading: false
            })

            return { success: true, user: userWithProfile }
          }

          return { success: false, error: 'Login failed' }
        } catch (error) {
          set({ loading: false })
          return { success: false, error: error.message }
        }
      },

      logout: async () => {
        try {
          await supabase.auth.signOut()
          set({
            user: null,
            session: null,
            isAuthenticated: false,
            loading: false
          })
        } catch (error) {
          console.error('Logout error:', error)
          // Force logout even if there's an error
          set({
            user: null,
            session: null,
            isAuthenticated: false,
            loading: false
          })
        }
      },

      register: async (userData) => {
        try {
          set({ loading: true })

          const { email, password, fullName, role, kecamatan, desa, phone } = userData

          // Create auth user
          const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                full_name: fullName,
              }
            }
          })

          if (authError) {
            throw authError
          }

          if (authData.user) {
            // Create user profile
            const { data: profile, error: profileError } = await supabase
              .from('users')
              .insert({
                id: authData.user.id,
                email,
                full_name: fullName,
                role,
                kecamatan,
                desa,
                phone,
                is_active: true
              })
              .select()
              .single()

            if (profileError) {
              throw profileError
            }

            set({ loading: false })
            return { success: true, user: profile }
          }

          return { success: false, error: 'Registration failed' }
        } catch (error) {
          set({ loading: false })
          return { success: false, error: error.message }
        }
      },

      updateProfile: async (updates) => {
        try {
          const { user } = get()
          if (!user?.id) {
            throw new Error('User not authenticated')
          }

          set({ loading: true })

          const { data, error } = await supabase
            .from('users')
            .update(updates)
            .eq('id', user.id)
            .select()
            .single()

          if (error) {
            throw error
          }

          set({
            user: { ...user, profile: data },
            loading: false
          })

          return { success: true, data }
        } catch (error) {
          set({ loading: false })
          return { success: false, error: error.message }
        }
      },

      changePassword: async (currentPassword, newPassword) => {
        try {
          set({ loading: true })

          const { error } = await supabase.rpc('change_user_password', {
            current_password: currentPassword,
            new_password: newPassword
          })

          if (error) {
            throw error
          }

          set({ loading: false })
          return { success: true }
        } catch (error) {
          set({ loading: false })
          return { success: false, error: error.message }
        }
      },

      resetPassword: async (email) => {
        try {
          set({ loading: true })

          const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
          })

          if (error) {
            throw error
          }

          set({ loading: false })
          return { success: true }
        } catch (error) {
          set({ loading: false })
          return { success: false, error: error.message }
        }
      },

      refreshSession: async () => {
        try {
          const { data, error } = await supabase.auth.refreshSession()

          if (error) {
            throw error
          }

          if (data.session) {
            const { data: profile, error: profileError } = await supabase
              .from('users')
              .select('*')
              .eq('id', data.session.user.id)
              .single()

            if (profileError) {
              console.error('Error fetching user profile:', profileError)
            }

            const userWithProfile = {
              ...data.session.user,
              profile: profile || null
            }

            set({
              user: userWithProfile,
              session: data.session,
              isAuthenticated: true,
              loading: false
            })
          }

          return data.session
        } catch (error) {
          console.error('Error refreshing session:', error)
          set({
            user: null,
            session: null,
            isAuthenticated: false,
            loading: false
          })
          return null
        }
      },

      // Getters
      getUserRole: () => {
        const { user } = get()
        return user?.profile?.role || null
      },

      getUserPermissions: () => {
        const { user } = get()
        const role = user?.profile?.role
        const roleConfig = USER_ROLES.find(r => r.value === role)
        return roleConfig?.permissions || []
      },

      hasPermission: (permission) => {
        const permissions = get().getUserPermissions()
        return permissions.includes(permission)
      },

      isDesa: () => get().getUserRole() === 'desa',
      isKecamatan: () => get().getUserRole() === 'kecamatan',
      isBpbd: () => get().getUserRole() === 'bpbd',

      getUserKecamatan: () => {
        const { user } = get()
        return user?.profile?.kecamatan || null
      },

      getUserDesa: () => {
        const { user } = get()
        return user?.profile?.desa || null
      },

      canAccessRoute: (route) => {
        const role = get().getUserRole()

        if (!role) return false

        // Define route access rules
        const routePermissions = {
          '/desa': ['desa'],
          '/desa/create': ['desa'],
          '/desa/reports': ['desa'],
          '/kecamatan': ['kecamatan'],
          '/kecamatan/verify': ['kecamatan'],
          '/kecamatan/reports': ['kecamatan'],
          '/bpbd': ['bpbd'],
          '/bpbd/reports': ['bpbd'],
          '/bpbd/analytics': ['bpbd'],
          '/bpbd/map': ['bpbd'],
          '/bpbd/export': ['bpbd'],
          '/bpbd/users': ['bpbd'],
        }

        const allowedRoles = routePermissions[route] || []
        return allowedRoles.includes(role)
      }
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        session: state.session,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

// Initialize auth state
export const initializeAuth = async () => {
  const { setLoading, refreshSession } = useAuthStore.getState()

  try {
    setLoading(true)
    const session = await refreshSession()

    if (!session) {
      setLoading(false)
    }
  } catch (error) {
    console.error('Error initializing auth:', error)
    setLoading(false)
  }
}

// Set up auth state change listener
supabase.auth.onAuthStateChange(async (event, session) => {
  const { setSession, setLoading } = useAuthStore.getState()

  if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
    if (session) {
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single()

      const userWithProfile = {
        ...session.user,
        profile: profile || null
      }

      setSession({ ...session, user: userWithProfile })
    }
  } else if (event === 'SIGNED_OUT') {
    setSession(null)
  }

  setLoading(false)
})