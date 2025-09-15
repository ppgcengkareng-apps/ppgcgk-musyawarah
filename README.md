# Sistem Musyawarah PPG

Sistem manajemen musyawarah Program Penggerak Pembina Generasi (PPG) dengan fitur notulensi digital, absensi real-time, dan dashboard peserta. Mendukung hingga 100 peserta dengan sistem role-based access control.

## 🚀 Fitur Utama

### 🔐 Sistem Role-Based Access Control
- **Super Admin**: Akses penuh ke semua fitur sistem
- **Admin**: Manajemen peserta, sesi, dan approval notulensi
- **Sekretaris PPG**: Membuat dan mengedit notulensi, assign akses khusus
- **Peserta**: Dashboard personal, akses notulensi, sistem komentar

### 📋 Manajemen Sesi Musyawarah
- Buat dan kelola sesi musyawarah dengan detail lengkap
- Sistem absensi dengan URL unik per sesi
- Status sesi: Terjadwal → Aktif → Selesai
- Batas waktu absensi yang dapat dikonfigurasi
- Dukungan sesi offline, online, dan hybrid

### ✅ Sistem Absensi Real-time
- Form absensi mobile-optimized dengan pencarian peserta
- Status kehadiran: Hadir, Terlambat, Izin, Sakit
- Validasi waktu dan pencegahan duplikasi
- Logging IP address dan user agent
- Notifikasi real-time untuk admin

### 📝 Notulensi Digital dengan Approval
- Rich text editor dengan template standar Indonesia
- Workflow approval: Draft → Pending → Approved/Rejected
- Version control dan audit trail
- Assign akses khusus untuk peserta non-hadir
- Export ke PDF dan Excel

### 💬 Sistem Komentar Real-time
- Komentar threaded dengan reply
- Real-time updates menggunakan Supabase
- @ mention system dengan notifikasi
- Moderasi komentar oleh admin

### 📊 Dashboard & Laporan
- Dashboard admin dengan statistik real-time
- Dashboard peserta dengan riwayat kehadiran
- Laporan kehadiran dan analitik partisipasi
- Export data dalam format Excel dan PDF

## 🛠️ Tech Stack

- **Frontend**: Next.js 13+ (App Router), TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui, Radix UI
- **Backend**: Next.js API Routes, Supabase
- **Database**: PostgreSQL (Supabase)
- **Authentication**: Supabase Auth + Custom Role System
- **Real-time**: Supabase Realtime
- **Rich Text**: React Quill
- **Charts**: Recharts
- **Deployment**: Vercel

## 📦 Instalasi

### 1. Clone Repository
```bash
git clone <repository-url>
cd ppg-musyawarah
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Salin `.env.local.example` ke `.env.local` dan isi dengan konfigurasi Anda:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# App Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_minimum_32_characters
NODE_ENV=development

# Email Configuration (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

### 4. Setup Supabase Database

1. Buat project baru di [Supabase](https://supabase.com)
2. Jalankan migration files di SQL Editor:
   - `supabase/migrations/20250101000001_initial_schema.sql`
   - `supabase/migrations/20250101000002_rls_policies.sql`
3. Jalankan seed data: `supabase/seed.sql`

### 5. Jalankan Development Server
```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

## 🔑 Demo Credentials

### Admin Login
- **Super Admin**: budi.setiawan@ppg.kemendikbud.go.id
- **Admin**: siti.nurhaliza@ppg.kemendikbud.go.id  
- **Sekretaris PPG**: maya.sari@ppg.kemendikbud.go.id
- **Password**: password123

### Peserta Login
- **Email**: andi.rahman@sman3mdn.sch.id (atau peserta lainnya)
- **Password**: password123

## 📱 Fitur Mobile-First

- Responsive design untuk semua ukuran layar
- Touch-optimized interface dengan target minimum 48px
- Pull-to-refresh dan swipe gestures
- Offline-capable dengan service worker
- PWA support dengan app installation

## 🔒 Keamanan

- Row Level Security (RLS) policies di Supabase
- Input sanitization dan validation
- Rate limiting pada API endpoints
- CSRF protection
- Session management dengan auto-logout
- Audit logging untuk semua aktivitas

## 📊 Performa

- Optimized untuk 100 peserta concurrent
- Database indexing untuk query cepat
- Real-time updates dengan latency <500ms
- Image optimization dan lazy loading
- Code splitting untuk loading cepat

## 🌐 Lokalisasi Indonesia

- Semua interface dalam Bahasa Indonesia
- Format tanggal: DD/MM/YYYY
- Format waktu: HH:MM WIB
- Format nomor: 1.000,00
- Validasi nomor telepon format +62

## 📁 Struktur Project

```
ppg-musyawarah/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── admin/             # Admin dashboard & management
│   │   ├── peserta/           # Participant dashboard
│   │   ├── absen/             # Attendance system
│   │   └── api/               # API routes
│   ├── components/            # React components
│   │   ├── ui/                # shadcn/ui components
│   │   ├── admin/             # Admin-specific components
│   │   ├── notulensi/         # Meeting notes components
│   │   └── common/            # Shared components
│   ├── lib/                   # Utilities & configurations
│   ├── types/                 # TypeScript type definitions
│   └── hooks/                 # Custom React hooks
├── supabase/                  # Database migrations & seed
└── public/                    # Static assets
```

## 🚀 Deployment

### Vercel Deployment
1. Push code ke GitHub repository
2. Connect repository di Vercel dashboard
3. Set environment variables di Vercel
4. Deploy otomatis akan berjalan

### Environment Variables untuk Production
Pastikan semua environment variables sudah diset di Vercel:
- Supabase credentials
- NEXTAUTH_SECRET (generate random 32+ characters)
- SMTP credentials (jika menggunakan email notifications)

## 📈 Monitoring & Analytics

- Real-time dashboard dengan metrics
- Activity logging untuk audit trail
- Error tracking dan performance monitoring
- User engagement analytics

## 🤝 Contributing

1. Fork repository
2. Buat feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buat Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

## 📞 Support

Untuk pertanyaan dan dukungan:
- Email: support@ppg-musyawarah.id
- Documentation: [Wiki](link-to-wiki)
- Issues: [GitHub Issues](link-to-issues)

## 🎯 Roadmap

- [ ] WhatsApp integration untuk notifikasi
- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Video conference integration
- [ ] Document management system

---

**Sistem Musyawarah PPG** - Dikembangkan untuk Program Penggerak Pembina Generasi Indonesia 🇮🇩