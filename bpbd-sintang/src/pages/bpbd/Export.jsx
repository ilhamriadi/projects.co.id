import React from 'react'

export default function Export() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Export Data</h1>
        <p className="text-gray-600 mt-1">Export data laporan dalam berbagai format</p>
      </div>

      <div className="bg-white rounded-lg shadow-card p-6">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Halaman Export dalam Pengembangan</h3>
          <p className="text-gray-600">Halaman ini akan menampilkan opsi export data (Excel, PDF, CSV).</p>
        </div>
      </div>
    </div>
  )
}