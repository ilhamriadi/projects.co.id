// Application constants for BPBD Sintang Disaster Reporting System

export const DISASTER_TYPES = [
  { value: 'banjir', label: 'Banjir', icon: '💧', color: 'blue' },
  { value: 'longsor', label: 'Longsor', icon: '🏔️', color: 'brown' },
  { value: 'kebakaran', label: 'Kebakaran', icon: '🔥', color: 'orange' },
  { value: 'angin_puting_beliung', label: 'Angin Puting Beliung', icon: '💨', color: 'gray' },
  { value: 'gempa', label: 'Gempa', icon: '🌍', color: 'yellow' },
  { value: 'kekeringan', label: 'Kekeringan', icon: '☀️', color: 'red' },
  { value: 'lainnya', label: 'Lainnya', icon: '⚠️', color: 'purple' },
]

export const USER_ROLES = [
  { value: 'desa', label: 'Desa', permissions: ['create_disaster', 'view_own_disasters', 'upload_photos'] },
  { value: 'kecamatan', label: 'Kecamatan', permissions: ['view_kecamatan_disasters', 'verify_disasters', 'reject_disasters'] },
  { value: 'bpbd', label: 'BPBD', permissions: ['view_all_disasters', 'export_data', 'manage_users', 'generate_reports', 'view_analytics'] },
]

export const DISASTER_STATUS = [
  { value: 'draft', label: 'Draft', color: 'gray', description: 'Belum dikirim' },
  { value: 'submitted', label: 'Menunggu Verifikasi', color: 'blue', description: 'Menunggu verifikasi dari Kecamatan' },
  { value: 'verified', label: 'Terverifikasi', color: 'green', description: 'Telah diverifikasi' },
  { value: 'rejected', label: 'Ditolak', color: 'red', description: 'Ditolak, perlu revisi' },
]

export const PUBLIC_FACILITY_TYPES = [
  'sekolah',
  'puskesmas',
  'rumah_sakit',
  'jembatan',
  'jalan',
  'masjid',
  'gereja',
  'pura',
  'viara',
  'kantor_desa',
  'pasar',
  'lainnya'
]

export const DAMAGE_LEVELS = [
  { value: 'ringan', label: 'Ringan', color: 'yellow' },
  { value: 'sedang', label: 'Sedang', color: 'orange' },
  { value: 'berat', label: 'Berat', color: 'red' },
]

export const NOTIFICATION_TYPES = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
}

export const API_ENDPOINTS = {
  DISASTERS: '/disasters',
  DISASTER_PHOTOS: '/disaster_photos',
  USERS: '/users',
  ACTIVITY_LOGS: '/activity_logs',
  NOTIFICATIONS: '/notifications',
  EXPORT: '/export',
}

export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  DESA: {
    DASHBOARD: '/desa',
    CREATE_REPORT: '/desa/create',
    MY_REPORTS: '/desa/reports',
  },
  KECAMATAN: {
    DASHBOARD: '/kecamatan',
    VERIFY_REPORTS: '/kecamatan/verify',
    REPORT_DETAIL: '/kecamatan/reports/:id',
  },
  BPBD: {
    DASHBOARD: '/bpbd',
    ALL_REPORTS: '/bpbd/reports',
    ANALYTICS: '/bpbd/analytics',
    MAP_VIEW: '/bpbd/map',
    EXPORT: '/bpbd/export',
    USER_MANAGEMENT: '/bpbd/users',
  },
}

export const KECAMATAN_LIST = [
  'Ambalau',
  'Binjai Hulu',
  'Dedai',
  'Embaloh Hulu',
  'Embaloh Hilir',
  'Jawai',
  'Jawai Selatan',
  'Kayan Hilir',
  'Kayan Hulu',
  'Ketungau Hilir',
  'Ketungau Hulu',
  'Ketungau Tengah',
  'Kuala Behe',
  'Kuantan',
  'Merakai',
  'Sebabi',
  'Sei/Sungai Ambawang',
  'Sei/Sungai Awan',
  'Sei/Sungai Durian',
  'Sei/Sungai Kuning',
  'Sei/Sungai Tebelian',
  'Serawai',
  'Sintang',
  'Sungai Betung',
  'Tempunak',
]

export const VALIDATION_RULES = {
  MAX_PHOTOS: 10,
  MAX_PHOTO_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_DESCRIPTION_LENGTH: 1000,
  MAX_CAPTION_LENGTH: 200,
  MIN_PASSWORD_LENGTH: 8,
  AUTO_SAVE_INTERVAL: 30000, // 30 seconds
  MAX_OFFLINE_QUEUE: 50,
}

export const MAP_CONFIG = {
  DEFAULT_CENTER: [-0.0898, 111.4753], // Sintang coordinates
  DEFAULT_ZOOM: 10,
  MIN_ZOOM: 8,
  MAX_ZOOM: 18,
  TILE_URL: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  ATTRIBUTION: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}

export const CHART_COLORS = {
  PRIMARY: '#dc2626',
  SUCCESS: '#10b981',
  WARNING: '#f59e0b',
  ERROR: '#ef4444',
  INFO: '#3b82f6',
  GRAY: '#6b7280',
}

export const EXPORT_FORMATS = {
  EXCEL: 'xlsx',
  PDF: 'pdf',
  CSV: 'csv',
}

export const OFFLINE_STORAGE_KEYS = {
  DRAFT_DISASTERS: 'draft_disasters',
  PENDING_PHOTOS: 'pending_photos',
  SYNC_QUEUE: 'sync_queue',
  CACHED_DATA: 'cached_data',
  USER_PREFERENCES: 'user_preferences',
}