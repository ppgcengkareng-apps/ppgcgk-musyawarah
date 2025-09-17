# Sistem Musyawarah PPG

Sistem manajemen musyawarah Program Penggerak Pembina Generasi dengan fitur notulensi digital, absensi real-time, dan dashboard peserta. Mendukung hingga 100 peserta dengan sistem role-based access control.

## 🚀 Fitur yang Berhasil Diterapkan

### 🔐 Sistem Role-Based Access Control ✅
- **Admin**: Login dan akses penuh ke dashboard admin
- **Peserta**: Akses absensi tanpa login dengan username
- Sistem autentikasi berbasis email dan password
- Session management dengan localStorage

### 📋 Manajemen Sesi Musyawarah ✅
- **Buat Sesi**: Form lengkap dengan informasi sesi dan pemilihan peserta
- **Edit Sesi**: Load data sesi dan peserta yang sudah dipilih
- **Hapus Sesi**: Cascade delete dengan relasi terkait
- **Assign Peserta**: Sistem pemilihan peserta dengan search dan filter
- **Status Sesi**: Scheduled, Active, Completed, Cancelled
- **Tipe Sesi**: Offline, Online, Hybrid

### ✅ Sistem Absensi Real-time ✅
- **URL Publik**: `/absen` untuk akses peserta tanpa login
- **Search Username**: Cari peserta berdasarkan email/username
- **Tampil Sesi**: Otomatis menampilkan sesi yang di-assign ke peserta
- **Status Kehadiran**: Hadir, Terlambat, Izin, Sakit
- **Catatan Opsional**: Input catatan tambahan
- **Validasi Duplikasi**: Mencegah absensi ganda
- **Logging**: IP address dan user agent tersimpan
- **Real-time Update**: Status langsung berubah setelah absen

### 📝 Manajemen Peserta ✅
- **Database Peserta**: Tabel peserta dengan role dan informasi lengkap
- **Relasi Sesi-Peserta**: Tabel `sesi_peserta` untuk assign peserta ke sesi
- **Search & Filter**: Pencarian nama dan filter berdasarkan bidang
- **Bulk Selection**: Pilih semua, pilih berdasarkan bidang, clear all

### 📊 Dashboard Admin ✅
- **Login Admin**: Sistem autentikasi untuk admin
- **Manajemen Sesi**: CRUD sesi musyawarah lengkap
- **Daftar Sesi**: Tampilan semua sesi dengan status
- **Navigation**: Menu admin dengan akses ke semua fitur

## 🛠️ Tech Stack

- **Frontend**: Next.js 13+ (App Router), TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui, Radix UI
- **Backend**: Next.js API Routes, Supabase
- **Database**: PostgreSQL (Supabase)
- **Authentication**: Custom Auth System
- **Real-time**: Supabase Realtime
- **Deployment**: Vercel

## 📱 Flow Aplikasi

### 1. 🏠 Halaman Utama (`/`)
```
Akses: https://ppgcgk-musyawarah.vercel.app/
- Tombol "Login Admin" → `/admin/login`
- Tombol "Absensi Peserta" → `/absen`
- Informasi fitur sistem
- Statistik sistem (100 peserta, 4 level akses, 24/7)
```

### 2. 👨‍💼 Flow Admin

#### Login Admin (`/admin/login`)
```
1. Input username (email) dan password
2. Klik "Masuk"
3. Validasi kredensial
4. Redirect ke dashboard admin (`/admin`)
```

#### Dashboard Admin (`/admin`)
```
- Overview statistik sistem
- Menu navigasi: Sesi, Peserta, Notulensi, Laporan
- Quick actions untuk manajemen
```

#### Manajemen Sesi (`/admin/sesi`)
```
Daftar Sesi:
- Tampil semua sesi dengan status
- Tombol: Buat Sesi, Edit, Hapus
- Filter dan pencarian sesi

Buat Sesi (`/admin/sesi/buat`):
1. Isi Informasi Sesi:
   - Nama Sesi
   - Deskripsi
   - Tanggal & Waktu
   - Lokasi
   - Tipe (Offline/Online/Hybrid)
   - Maksimal Peserta

2. Pilih Peserta:
   - Search peserta by nama/username
   - Filter by bidang
   - Bulk selection (Pilih Semua, Clear All)
   - Quick select by bidang

3. Klik "Buat Sesi"
4. Data tersimpan ke database
5. Redirect ke daftar sesi

Edit Sesi (`/admin/sesi/[id]/edit`):
1. Load data sesi existing
2. Load peserta yang sudah dipilih
3. Edit informasi dan peserta
4. Klik "Simpan Perubahan"
5. Update database
```

### 3. 👥 Flow Peserta - Absensi

#### Akses Absensi (`/absen`)
```
1. Buka: https://ppgcgk-musyawarah.vercel.app/absen
2. Input username (email peserta)
3. Klik tombol search
4. Sistem cari peserta di database
5. Tampil data peserta dan sesi yang di-assign

Jika peserta ditemukan:
- Tampil nama dan bidang peserta
- Tampil daftar sesi wajib dihadiri
- Status absensi per sesi (Belum Absen/Hadir/dll)

Proses Absensi:
1. Klik "Klik untuk Absen" pada sesi
2. Form absensi muncul dengan detail sesi
3. Pilih Status Kehadiran:
   - ✅ Hadir
   - ⏰ Terlambat  
   - 📝 Izin
   - 🏥 Sakit
4. Input catatan (opsional)
5. Klik "Catat Kehadiran"
6. Data tersimpan ke database
7. Status berubah dan tombol absen hilang
```

## 🗄️ Struktur Database

### Tabel Utama
```sql
-- Tabel peserta
peserta (
  id UUID PRIMARY KEY,
  nama VARCHAR(255),
  email VARCHAR(255), -- digunakan sebagai username
  role VARCHAR(50), -- 'admin', 'peserta'
  jabatan VARCHAR(255),
  instansi VARCHAR(255),
  aktif BOOLEAN
)

-- Tabel sesi musyawarah
sesi_musyawarah (
  id UUID PRIMARY KEY,
  nama_sesi VARCHAR(255),
  deskripsi TEXT,
  tanggal DATE,
  waktu_mulai TIME,
  waktu_selesai TIME,
  timezone VARCHAR(10),
  lokasi VARCHAR(200),
  tipe VARCHAR(20), -- 'offline', 'online', 'hybrid'
  status VARCHAR(20), -- 'scheduled', 'active', 'completed'
  maksimal_peserta INTEGER,
  created_by UUID REFERENCES peserta(id)
)

-- Tabel relasi sesi-peserta
sesi_peserta (
  id UUID PRIMARY KEY,
  sesi_id UUID REFERENCES sesi_musyawarah(id),
  peserta_id UUID REFERENCES peserta(id),
  wajib_hadir BOOLEAN DEFAULT true,
  UNIQUE(sesi_id, peserta_id)
)

-- Tabel absensi
absensi (
  id UUID PRIMARY KEY,
  sesi_id UUID REFERENCES sesi_musyawarah(id),
  peserta_id UUID REFERENCES peserta(id),
  status_kehadiran VARCHAR(20), -- 'hadir', 'terlambat', 'izin', 'sakit'
  catatan TEXT,
  waktu_absen TIMESTAMP,
  ip_address INET,
  user_agent TEXT
)
```

## 📦 Instalasi & Setup

### 1. Clone Repository
```bash
git clone <repository-url>
cd ppgcgk-musyawarah-main
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# App Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
NODE_ENV=development
```

### 4. Setup Database Supabase
```sql
-- Buat tabel sesi_peserta jika belum ada
CREATE TABLE sesi_peserta (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sesi_id UUID NOT NULL REFERENCES sesi_musyawarah(id) ON DELETE CASCADE,
    peserta_id UUID NOT NULL REFERENCES peserta(id) ON DELETE CASCADE,
    wajib_hadir BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(sesi_id, peserta_id)
);

-- Index untuk performa
CREATE INDEX idx_sesi_peserta_sesi_id ON sesi_peserta(sesi_id);
CREATE INDEX idx_sesi_peserta_peserta_id ON sesi_peserta(peserta_id);
```

### 5. Jalankan Development
```bash
npm run dev
```

## 🚀 Deployment

### Vercel Deployment
1. Push code ke GitHub repository
2. Connect repository di Vercel dashboard
3. Set environment variables di Vercel
4. Deploy otomatis akan berjalan

### URL Production
- **Main**: https://ppgcgk-musyawarah.vercel.app/
- **Admin**: https://ppgcgk-musyawarah.vercel.app/admin/login
- **Absensi**: https://ppgcgk-musyawarah.vercel.app/absen

## 🎯 Status Pengembangan

### ✅ Fitur Selesai
- [x] Halaman utama dan navigasi
- [x] Sistem login admin
- [x] CRUD sesi musyawarah
- [x] Assign peserta ke sesi
- [x] Sistem absensi publik
- [x] Database relational design
- [x] Real-time status update
- [x] Mobile responsive design

### 🚧 Fitur Dalam Pengembangan
- [ ] Sistem notulensi digital
- [ ] Dashboard analytics
- [ ] Export laporan
- [ ] Sistem notifikasi
- [ ] Manajemen user admin

### 🎯 Roadmap Selanjutnya
- [ ] WhatsApp integration
- [ ] Mobile app (React Native)
- [ ] Advanced analytics
- [ ] Multi-language support
- [ ] Video conference integration

## 📞 Support

Untuk pertanyaan dan dukungan:
- Email: support@ppg-musyawarah.id
- Issues: GitHub Issues

---

**Sistem Musyawarah PPG** - Dikembangkan untuk Program Penggerak Pembina Generasi Indonesia 🇮🇩