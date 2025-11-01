import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@/hooks/useAuth'
import { PublicLayout } from '@/components/layout/Layout'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Checkbox } from '@/components/ui/Input'
import { Shield, AlertCircle, Eye, EyeOff } from 'lucide-react'
import { validateForm } from '@/lib/utils'

const loginSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(1, 'Password wajib diisi'),
  rememberMe: z.boolean().default(false),
})

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, loading, isAuthenticated } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [loginError, setLoginError] = useState('')

  const from = location.state?.from?.pathname || '/dashboard'

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  })

  useEffect(() => {
    if (isAuthenticated) {
      const userRole = localStorage.getItem('auth-storage')
        ? JSON.parse(localStorage.getItem('auth-storage')).state?.user?.profile?.role
        : null

      if (userRole === 'desa') {
        navigate('/desa', { replace: true })
      } else if (userRole === 'kecamatan') {
        navigate('/kecamatan', { replace: true })
      } else if (userRole === 'bpbd') {
        navigate('/bpbd', { replace: true })
      } else {
        navigate(from, { replace: true })
      }
    }
  }, [isAuthenticated, navigate, from])

  const onSubmit = async (data) => {
    setLoginError('')

    const result = await login(data.email, data.password, data.rememberMe)

    if (!result.success) {
      setLoginError(result.error)
    }
  }

  return (
    <PublicLayout>
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="mx-auto h-16 w-16 bg-primary-100 rounded-full flex items-center justify-center">
              <Shield className="h-10 w-10 text-primary-600" />
            </div>
            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              Masuk ke Akun Anda
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Sistem Pendataan Terdampak Bencana<br />BPBD Kabupaten Sintang
            </p>
          </div>

          {/* Login Form */}
          <div className="bg-white py-8 px-6 shadow-lg rounded-lg">
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              {/* Error Message */}
              {loginError && (
                <div className="rounded-md bg-red-50 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <AlertCircle className="h-5 w-5 text-red-400" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">
                        Login Gagal
                      </h3>
                      <div className="mt-2 text-sm text-red-700">
                        <p>{loginError}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Email */}
              <Input
                label="Email"
                type="email"
                autoComplete="email"
                error={errors.email?.message}
                {...register('email')}
                disabled={loading || isSubmitting}
              />

              {/* Password */}
              <div className="relative">
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  error={errors.password?.message}
                  {...register('password')}
                  disabled={loading || isSubmitting}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center pt-6"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading || isSubmitting}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between">
                <Checkbox
                  label="Ingat saya"
                  checked={watch('rememberMe')}
                  onChange={(e) => setValue('rememberMe', e.target.checked)}
                  disabled={loading || isSubmitting}
                />

                <div className="text-sm">
                  <Link
                    to="/forgot-password"
                    className="font-medium text-primary-600 hover:text-primary-500"
                  >
                    Lupa password?
                  </Link>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                loading={loading || isSubmitting}
                disabled={loading || isSubmitting}
              >
                Masuk
              </Button>
            </form>

            {/* Register Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Belum punya akun?{' '}
                <Link
                  to="/register"
                  className="font-medium text-primary-600 hover:text-primary-500"
                >
                  Daftar sekarang
                </Link>
              </p>
            </div>
          </div>

          {/* Demo Credentials */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-2">
              Akun Demo
            </h3>
            <div className="space-y-1 text-xs text-gray-600">
              <p><strong>Desa:</strong> desa@example.com / password</p>
              <p><strong>Kecamatan:</strong> kecamatan@example.com / password</p>
              <p><strong>BPBD:</strong> bpbd@example.com / password</p>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}