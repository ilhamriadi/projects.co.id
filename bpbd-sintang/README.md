# Sistem Pendataan Terdampak Bencana BPBD Kabupaten Sintang

Aplikasi web PWA (Progressive Web App) full-stack untuk **Sistem Pendataan Terdampak Bencana** dengan tiga level akses user: **Desa**, **Kecamatan**, dan **BPBD (Admin)**. Aplikasi ini real-time, responsif, dan mendukung mode offline.

## 🚀 Fitur Utama

### Multi-Role Access Control
- **Desa**: Membuat, mengelola, dan melihat laporan bencana di wilayah desa
- **Kecamatan**: Memverifikasi dan menyetujui laporan dari desa
- **BPBD**: Mengakses semua data, analitik, export, dan manajemen user

### Progressive Web App (PWA)
- Installable on mobile devices
- Offline support with data synchronization
- Push notifications
- Fast loading and responsive design

### Real-time Features
- Live notification system
- Real-time data synchronization
- Status tracking for reports

### Comprehensive Reporting
- Multi-section disaster report forms
- Photo uploads with compression
- GPS location tracking
- Offline data storage

## 🛠 Tech Stack

**Frontend:**
- React 18.3 + Vite 5.x
- Tailwind CSS 3.x + shadcn/ui
- React Router DOM 6.x
- React Hook Form + Zod validation
- TanStack Query v5
- Zustand (state management)
- Leaflet.js (maps & geo-location)
- Recharts (charts)
- Axios
- date-fns
- react-hot-toast
- Workbox (PWA service worker)

**Backend:**
- Supabase (PostgreSQL + Auth + Storage + Realtime)

**Hosting:**
- Frontend: Vercel
- Backend: Supabase Cloud

## 📋 Prerequisites

- Node.js 18+
- npm atau yarn
- Akun Supabase

## 🚀 Quick Start

### 1. Clone Repository
```bash
git clone <repository-url>
cd bpbd-sintang
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Supabase
1. Buat project baru di [Supabase Dashboard](https://supabase.com)
2. Jalankan SQL schema dari file `database_schema.sql`
3. Enable Row Level Security (RLS) policies
4. Copy Supabase URL dan Anon Key

### 4. Environment Configuration
1. Copy file `.env.example` ke `.env`:
```bash
cp .env.example .env
```

2. Update `.env` dengan credentials Supabase Anda:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 5. Run Development Server
```bash
npm run dev
```

Aplikasi akan berjalan di `http://localhost:5173`

### 6. Build for Production
```bash
npm run build
```

## 📁 Project Structure

```
bpbd-sintang/
├── public/
│   ├── icons/                    # PWA icons
│   ├── manifest.json            # PWA manifest
│   └── sw.js                   # Service worker
├── src/
│   ├── components/
│   │   ├── ui/                  # Reusable UI components (shadcn/ui)
│   │   ├── layout/              # Layout components
│   │   ├── forms/               # Form components
│   │   ├── charts/              # Chart components
│   │   ├── maps/                # Map components
│   │   └── shared/              # Shared components
│   ├── pages/
│   │   ├── auth/                # Authentication pages
│   │   ├── desa/                # Desa role pages
│   │   ├── kecamatan/           # Kecamatan role pages
│   │   └── bpbd/                # BPBD role pages
│   ├── hooks/                   # Custom React hooks
│   ├── lib/                     # Utility functions
│   ├── stores/                  # Zustand stores
│   └── App.jsx                  # Main App component
├── database_schema.sql          # Database schema
├── package.json
├── vite.config.js               # Vite configuration
├── tailwind.config.js           # Tailwind configuration
└── README.md
```

## 🔐 Authentication & Authorization

### Demo Accounts
- **Desa**: `desa@example.com` / `password`
- **Kecamatan**: `kecamatan@example.com` / `password`
- **BPBD**: `bpbd@example.com` / `password`

### Role-Based Access Control (RBAC)
- **Desa**: create_disaster, view_own_disasters, upload_photos
- **Kecamatan**: view_kecamatan_disasters, verify_disasters, reject_disasters
- **BPBD**: view_all_disasters, export_data, manage_users, generate_reports

## 📊 Database Schema

### Main Tables
1. **users** - User authentication and profiles
2. **disasters** - Disaster reports
3. **disaster_photos** - Photo attachments
4. **activity_logs** - Activity tracking
5. **notifications** - User notifications

### Key Features
- Row Level Security (RLS) for data protection
- Real-time subscriptions
- Automatic timestamps
- Soft delete functionality

## 🌐 PWA Features

### Offline Support
- IndexedDB for local storage
- Background sync
- Draft auto-save
- Queue system for failed requests

### Service Worker
- Cache strategies for static assets
- Network-first for API requests
- Background sync for form submissions

## 📱 Mobile Features

- Responsive design for all screen sizes
- Touch-friendly interface
- Mobile navigation with bottom tabs
- Offline mode indicator
- Push notifications support

## 🔧 Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Code Style
- ESLint for code quality
- Prettier for code formatting
- Tailwind CSS for styling
- TypeScript ready

## 🚀 Deployment

### Frontend (Vercel)
1. Connect repository ke Vercel
2. Set environment variables
3. Automatic deployment on push to main branch

### Backend (Supabase)
1. Run database migrations
2. Set up authentication providers
3. Configure storage buckets
4. Set up real-time subscriptions

## 🤝 Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, please contact:
- Email: support@bpbd-sintang.go.id
- Documentation: [Link to docs]
- Issues: [GitHub Issues](link-to-repo/issues)

## 🔄 Updates & Changelog

### Version 1.0.0 (Current)
- ✅ Basic authentication system
- ✅ Role-based access control
- ✅ Multi-level reporting system
- ✅ PWA functionality
- ✅ Offline support
- ✅ Real-time notifications

### Planned Features
- 📊 Advanced analytics dashboard
- 🗺️ Enhanced mapping features
- 📱 Mobile app (React Native)
- 🔄 API integrations
- 📈 Automated reporting
- 🔗 External system integrations