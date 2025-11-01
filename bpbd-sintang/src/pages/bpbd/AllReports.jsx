import React from 'react'

export default function AllReports() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Semua Laporan</h1>
        <p className="text-gray-600 mt-1">Kelola semua laporan bencana dari seluruh kecamatan</p>
      </div>

      <div className="bg-white rounded-lg shadow-card p-6">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Daftar Laporan dalam Pengembangan</h3>
          <p className="text-gray-600">Halaman ini akan menampilkan semua laporan dengan filter dan export.</p>
        </div>
      </div>
    </div>
  )
}