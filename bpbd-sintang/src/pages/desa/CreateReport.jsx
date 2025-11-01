import React from 'react'

export default function CreateReport() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Buat Laporan Bencana</h1>
        <p className="text-gray-600 mt-1">Laporkan kejadian bencana di wilayah Anda</p>
      </div>

      <div className="bg-white rounded-lg shadow-card p-6">
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Form Laporan dalam Pengembangan</h3>
          <p className="text-gray-600">Halaman ini akan menampilkan form lengkap untuk membuat laporan bencana.</p>
        </div>
      </div>
    </div>
  )
}