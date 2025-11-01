import React from 'react'
import { Link } from 'react-router-dom'
import { MetricCard } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { FileText, PlusCircle, AlertTriangle, CheckCircle } from 'lucide-react'

export default function DesaDashboard() {
  // Mock data - replace with real API calls
  const stats = {
    totalReports: 12,
    pendingVerification: 3,
    verified: 8,
    rejected: 1,
  }

  const recentReports = [
    {
      id: 1,
      type: 'banjir',
      location: 'Dusun Merdeka',
      date: '2024-01-20',
      status: 'submitted',
      victims: 15,
    },
    {
      id: 2,
      type: 'kebakaran',
      location: 'RT 001/RW 002',
      date: '2024-01-18',
      status: 'verified',
      victims: 5,
    },
    {
      id: 3,
      type: 'longsor',
      location: 'Dusun Harapan',
      date: '2024-01-15',
      status: 'rejected',
      victims: 8,
    },
  ]

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Desa</h1>
        <p className="text-gray-600 mt-1">Kelola laporan bencana di wilayah Anda</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Total Laporan"
          value={stats.totalReports}
          change="+2 bulan ini"
          changeType="increase"
          icon={<FileText className="w-6 h-6" />}
        />
        <MetricCard
          title="Menunggu Verifikasi"
          value={stats.pendingVerification}
          change="Perlu ditindak"
          changeType="neutral"
          icon={<AlertTriangle className="w-6 h-6" />}
        />
        <MetricCard
          title="Terverifikasi"
          value={stats.verified}
          change="+1 minggu ini"
          changeType="increase"
          icon={<CheckCircle className="w-6 h-6" />}
        />
        <MetricCard
          title="Ditolak"
          value={stats.rejected}
          change="Perlu revisi"
          changeType="decrease"
          icon={<AlertTriangle className="w-6 h-6" />}
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-card p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Aksi Cepat</h2>
        <div className="flex flex-wrap gap-4">
          <Button asChild>
            <Link to="/desa/create">
              <PlusCircle className="w-4 h-4 mr-2" />
              Buat Laporan Baru
            </Link>
          </Button>
          <Button variant="secondary" asChild>
            <Link to="/desa/reports">
              <FileText className="w-4 h-4 mr-2" />
              Lihat Semua Laporan
            </Link>
          </Button>
        </div>
      </div>

      {/* Recent Reports */}
      <div className="bg-white rounded-lg shadow-card">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Laporan Terbaru</h2>
        </div>
        <div className="overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tanggal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Jenis Bencana
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lokasi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Korban
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentReports.map((report) => (
                <tr key={report.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {report.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant="info" className="capitalize">
                      {report.type}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {report.location}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {report.victims} jiwa
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={
                      report.status === 'verified' ? 'success' :
                      report.status === 'submitted' ? 'info' :
                      report.status === 'rejected' ? 'danger' : 'default'
                    }>
                      {report.status === 'verified' ? 'Terverifikasi' :
                       report.status === 'submitted' ? 'Menunggu Verifikasi' :
                       report.status === 'rejected' ? 'Ditolak' : 'Draft'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Button variant="ghost" size="sm">
                      Detail
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-gray-200">
          <Button variant="secondary" asChild className="w-full">
            <Link to="/desa/reports">Lihat Semua Laporan</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}