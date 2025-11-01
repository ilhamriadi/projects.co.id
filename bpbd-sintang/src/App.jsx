import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Layout } from '@/components/layout/Layout'
import { PublicLayout } from '@/components/layout/Layout'

// Auth pages
import Login from '@/pages/auth/Login'
import Register from '@/pages/auth/Register'

// Desa pages
import DesaDashboard from '@/pages/desa/Dashboard'
import CreateReport from '@/pages/desa/CreateReport'
import MyReports from '@/pages/desa/MyReports'

// Kecamatan pages
import KecamatanDashboard from '@/pages/kecamatan/Dashboard'
import VerifyReports from '@/pages/kecamatan/VerifyReports'
import ReportDetail from '@/pages/kecamatan/ReportDetail'

// BPBD pages
import BpbdDashboard from '@/pages/bpbd/Dashboard'
import AllReports from '@/pages/bpbd/AllReports'
import Analytics from '@/pages/bpbd/Analytics'
import MapView from '@/pages/bpbd/MapView'
import Export from '@/pages/bpbd/Export'
import UserManagement from '@/pages/bpbd/UserManagement'

// Placeholder components
const Dashboard = () => {
  const { getUserRole } = useAuth()
  const role = getUserRole()

  if (role === 'desa') return <Navigate to="/desa" replace />
  if (role === 'kecamatan') return <Navigate to="/kecamatan" replace />
  if (role === 'bpbd') return <Navigate to="/bpbd" replace />
  return <Navigate to="/login" replace />
}

const Unauthorized = () => (
  <PublicLayout>
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full text-center">
        <div className="mx-auto h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <svg className="h-10 w-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Akses Ditolak</h1>
        <p className="text-gray-600 mb-6">
          Anda tidak memiliki izin untuk mengakses halaman ini.
        </p>
        <button
          onClick={() => window.history.back()}
          className="btn btn-primary"
        >
          Kembali
        </button>
      </div>
    </div>
  </PublicLayout>
)

const NotFound = () => (
  <PublicLayout>
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full text-center">
        <div className="mx-auto h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <svg className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Halaman Tidak Ditemukan</h1>
        <p className="text-gray-600 mb-6">
          Halaman yang Anda cari tidak ada atau telah dipindahkan.
        </p>
        <button
          onClick={() => window.location.href = '/'}
          className="btn btn-primary"
        >
          Kembali ke Beranda
        </button>
      </div>
    </div>
  </PublicLayout>
)

function App() {
  const { loading, isAuthenticated, getUserRole } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat aplikasi...</p>
        </div>
      </div>
    )
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={
        isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
      } />
      <Route path="/register" element={
        isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />
      } />

      {/* Default dashboard route - redirects based on role */}
      <Route path="/dashboard" element={
        isAuthenticated ? <Dashboard /> : <Navigate to="/login" />
      } />

      {/* Desa routes */}
      <Route path="/desa" element={
        <Layout requiredRole="desa">
          <DesaDashboard />
        </Layout>
      } />
      <Route path="/desa/create" element={
        <Layout requiredRole="desa">
          <CreateReport />
        </Layout>
      } />
      <Route path="/desa/reports" element={
        <Layout requiredRole="desa">
          <MyReports />
        </Layout>
      } />

      {/* Kecamatan routes */}
      <Route path="/kecamatan" element={
        <Layout requiredRole="kecamatan">
          <KecamatanDashboard />
        </Layout>
      } />
      <Route path="/kecamatan/verify" element={
        <Layout requiredRole="kecamatan">
          <VerifyReports />
        </Layout>
      } />
      <Route path="/kecamatan/reports/:id" element={
        <Layout requiredRole="kecamatan">
          <ReportDetail />
        </Layout>
      } />

      {/* BPBD routes */}
      <Route path="/bpbd" element={
        <Layout requiredRole="bpbd">
          <BpbdDashboard />
        </Layout>
      } />
      <Route path="/bpbd/reports" element={
        <Layout requiredRole="bpbd">
          <AllReports />
        </Layout>
      } />
      <Route path="/bpbd/analytics" element={
        <Layout requiredRole="bpbd">
          <Analytics />
        </Layout>
      } />
      <Route path="/bpbd/map" element={
        <Layout requiredRole="bpbd">
          <MapView />
        </Layout>
      } />
      <Route path="/bpbd/export" element={
        <Layout requiredRole="bpbd">
          <Export />
        </Layout>
      } />
      <Route path="/bpbd/users" element={
        <Layout requiredRole="bpbd">
          <UserManagement />
        </Layout>
      } />

      {/* Unauthorized page */}
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* 404 page */}
      <Route path="*" element={<NotFound />} />

      {/* Root redirect */}
      <Route path="/" element={
        isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
      } />
    </Routes>
  )
}

export default App