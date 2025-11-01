import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@/hooks/useAuth'
import { PublicLayout } from '@/components/layout/Layout'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Input'
import { Checkbox } from '@/components/ui/Input'
import { Shield, AlertCircle, Eye, EyeOff, UserPlus } from 'lucide-react'
import { KECAMATAN_LIST } from '@/lib/constants'

const registerSchema = z.object({
  fullName: z.string().min(3, 'Nama minimal 3 karakter'),
  email: z.string().email('Email tidak valid'),
  password: z.string().min(8, 'Password minimal 8 karakter'),
  confirmPassword: z.string().min(1, 'Konfirmasi password wajib diisi'),
  role: z.enum(['desa', 'kecamatan'], {
    required_error: 'Role harus dipilih',
  }),
  kecamatan: z.string().min(1, 'Kecamatan harus dipilih'),
  desa: z.string().optional(),
  phone: z.string().optional(),
  agreeToTerms: z.boolean().refine(val => val === true, {
    message: 'Anda harus menyetujui syarat dan ketentuan',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Password tidak cocok',
  path: ['confirmPassword'],
}).refine((data) => {
  if (data.role === 'desa') {
    return data.desa && data.desa.trim() !== ''
  }
  return true
}, {
  message: 'Desa harus diisi untuk role Desa',
  path: ['desa'],
})

export default function Register() {
  const navigate = useNavigate()
  const { register: registerUser, loading, isAuthenticated } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [registerError, setRegisterError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: '',
      kecamatan: '',
      desa: '',
      phone: '',
      agreeToTerms: false,
    },
  })

  const selectedRole = watch('role')
  const selectedKecamatan = watch('kecamatan')

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true })
    }
  }, [isAuthenticated, navigate])

  useEffect(() => {
    // Reset desa field when role changes
    if (selectedRole !== 'desa') {
      setValue('desa', '')
    }
  }, [selectedRole, setValue])

  const onSubmit = async (data) => {
    setRegisterError('')
    setIsSubmitting(true)

    try {
      const result = await registerUser({
        fullName: data.fullName,
        email: data.email,
        password: data.password,
        role: data.role,
        kecamatan: data.kecamatan,
        desa: data.role === 'desa' ? data.desa : null,
        phone: data.phone || null,
      })

      if (!result.success) {
        setRegisterError(result.error)
      } else {
        // Registration successful, redirect to login
        navigate('/login', {
          state: {
            message: 'Registrasi berhasil! Silakan cek email Anda untuk verifikasi.',
            type: 'success'
          }
        })
      }
    } catch (error) {
      setRegisterError('Terjadi kesalahan saat registrasi. Silakan coba lagi.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <PublicLayout>
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="mx-auto h-16 w-16 bg-primary-100 rounded-full flex items-center justify-center">
              <UserPlus className="h-10 w-10 text-primary-600" />
            </div>
            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              Daftar Akun Baru
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Buat akun untuk mengakses Sistem Pendataan Terdampak Bencana BPBD Kabupaten Sintang
            </p>
          </div>

          {/* Register Form */}
          <div className="bg-white py-8 px-6 shadow-lg rounded-lg">
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              {/* Error Message */}
              {registerError && (
                <div className="rounded-md bg-red-50 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <AlertCircle className="h-5 w-5 text-red-400" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">
                        Registrasi Gagal
                      </h3>
                      <div className="mt-2 text-sm text-red-700">
                        <p>{registerError}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Full Name */}
                <Input
                  label="Nama Lengkap"
                  type="text"
                  autoComplete="name"
                  error={errors.fullName?.message}
                  {...register('fullName')}
                  disabled={loading || isSubmitting}
                />

                {/* Email */}
                <Input
                  label="Email"
                  type="email"
                  autoComplete="email"
                  error={errors.email?.message}
                  {...register('email')}
                  disabled={loading || isSubmitting}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Password */}
                <div className="relative">
                  <Input
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    error={errors.password?.message}
                    helperText="Minimal 8 karakter"
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

                {/* Confirm Password */}
                <div className="relative">
                  <Input
                    label="Konfirmasi Password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    error={errors.confirmPassword?.message}
                    {...register('confirmPassword')}
                    disabled={loading || isSubmitting}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center pt-6"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={loading || isSubmitting}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Role */}
                <Select
                  label="Role"
                  error={errors.role?.message}
                  {...register('role')}
                  disabled={loading || isSubmitting}
                >
                  <option value="">Pilih Role</option>
                  <option value="desa">Desa</option>
                  <option value="kecamatan">Kecamatan</option>
                </Select>

                {/* Phone */}
                <Input
                  label="No. Telepon (Opsional)"
                  type="tel"
                  autoComplete="tel"
                  helperText="Contoh: 08123456789"
                  {...register('phone')}
                  disabled={loading || isSubmitting}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Kecamatan */}
                <Select
                  label="Kecamatan"
                  error={errors.kecamatan?.message}
                  {...register('kecamatan')}
                  disabled={loading || isSubmitting}
                >
                  <option value="">Pilih Kecamatan</option>
                  {KECAMATAN_LIST.map((kecamatan) => (
                    <option key={kecamatan} value={kecamatan}>
                      {kecamatan}
                    </option>
                  ))}
                </Select>

                {/* Desa (only show for Desa role) */}
                {selectedRole === 'desa' && (
                  <Input
                    label="Desa"
                    type="text"
                    placeholder="Nama desa/kelurahan"
                    error={errors.desa?.message}
                    {...register('desa')}
                    disabled={loading || isSubmitting}
                  />
                )}
              </div>

              {/* Terms and Conditions */}
              <Checkbox
                label="Saya menyetujui syarat dan ketentuan yang berlaku"
                checked={watch('agreeToTerms')}
                onChange={(e) => setValue('agreeToTerms', e.target.checked)}
                error={errors.agreeToTerms?.message}
                disabled={loading || isSubmitting}
              />

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                loading={loading || isSubmitting}
                disabled={loading || isSubmitting}
              >
                Daftar Sekarang
              </Button>
            </form>

            {/* Login Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Sudah punya akun?{' '}
                <Link
                  to="/login"
                  className="font-medium text-primary-600 hover:text-primary-500"
                >
                  Masuk di sini
                </Link>
              </p>
            </div>
          </div>

          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <Shield className="h-5 w-5 text-blue-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Informasi Registrasi
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <ul className="list-disc list-inside space-y-1">
                    <li>Akun Desa: Dapat membuat dan mengelola laporan bencana untuk desa masing-masing</li>
                    <li>Akun Kecamatan: Dapat memverifikasi laporan dari desa di wilayah kecamatan</li>
                    <li>Akun BPBD: Dapat mengakses semua data dan mengelola sistem</li>
                    <li>Semua akun perlu verifikasi email sebelum dapat digunakan</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}