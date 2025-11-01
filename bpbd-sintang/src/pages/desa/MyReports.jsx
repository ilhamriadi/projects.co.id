import React from 'react'

export default function MyReports() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Laporan Saya</h1>
        <p className="text-gray-600 mt-1">Kelola dan pantau semua laporan yang telah Anda buat</p>
      </div>

      <div className="bg-white rounded-lg shadow-card p-6">
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Daftar Laporan dalam Pengembangan</h3>
          <p className="text-gray-600">Halaman ini akan menampilkan semua laporan yang telah Anda buat dengan filter dan status tracking.</p>
        </div>
      </div>
    </div>
  )
}