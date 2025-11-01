import React from 'react'

export default function MapView() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Peta Bencana</h1>
        <p className="text-gray-600 mt-1">Peta sebaran bencana di Kabupaten Sintang</p>
      </div>

      <div className="bg-white rounded-lg shadow-card p-6">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Peta Bencana dalam Pengembangan</h3>
          <p className="text-gray-600">Halaman ini akan menampilkan peta interaktif dengan lokasi bencana.</p>
        </div>
      </div>
    </div>
  )
}