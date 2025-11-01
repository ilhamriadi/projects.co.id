# Aplikasi PWA Sistem Pendataan Terdampak Bencana

Aplikasi web Progressive Web App (PWA) untuk pendataan terdampak bencana dengan multi-level akses user (Desa, Kecamatan, BPBD).

## Fitur Utama

- **Multi-Level User Access**: Desa, Kecamatan, BPBD (Admin)
- **Real-time Updates**: WebSocket untuk sinkronisasi data real-time
- **Offline Support**: PWA dengan service worker untuk mode offline
- **Responsive Design**: Mobile-first approach
- **Photo Upload**: Upload foto dengan kompresi dan thumbnail
- **Dashboard Analytics**: Visualisasi data terdampak bencana
- **Export Reports**: Export data ke Excel/PDF
- **Push Notifications**: Notifikasi real-time untuk update penting

## Struktur Project

```
pendataan-bencana/
├── backend/           # Node.js + Express.js API
├── frontend/          # React + Vite PWA
├── database/          # PostgreSQL schema dan migrations
└── docs/              # Dokumentasi API
```

## Stack Technology

### Backend
- Node.js 18+
- Express.js
- PostgreSQL
- Socket.io
- JWT Authentication
- Multer (file upload)
- Sharp (image processing)

### Frontend
- React 18
- Vite
- TypeScript
- TailwindCSS
- PWA
- Zustand (state management)
- React Query (server state)
- Socket.io-client

### Database
- PostgreSQL 14+
- Redis (caching & sessions)

## Installation & Setup

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Redis (optional)

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Configure .env file
npm run migrate
npm run seed
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql://user:password@localhost:5432/pendataan_bencana
JWT_SECRET=your-jwt-secret
REDIS_URL=redis://localhost:6379
UPLOAD_PATH=./uploads
PORT=3001
```

## API Documentation

Lihat `/docs/api.md` untuk dokumentasi API lengkap.

## Deployment

### Backend
- Docker support available
- PM2 for production
- Nginx reverse proxy

### Frontend
- Build untuk production
- PWA manifest sudah dikonfigurasi
- Service worker untuk offline support

## Contributing

1. Fork repository
2. Create feature branch
3. Commit perubahan
4. Push ke branch
5. Create Pull Request

## License

MIT License