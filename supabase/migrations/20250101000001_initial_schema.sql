-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Participants table (updated for 100 capacity)
CREATE TABLE peserta (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nama VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    nomor_hp VARCHAR(20),
    jabatan VARCHAR(100),
    instansi VARCHAR(150),
    foto_url TEXT,
    role VARCHAR(20) DEFAULT 'peserta' CHECK (role IN ('peserta', 'sekretaris_ppg', 'admin', 'super_admin')),
    password_hash TEXT, -- For participant login
    email_verified BOOLEAN DEFAULT false,
    aktif BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admin users table (merged with peserta for unified auth)
CREATE TABLE admin_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    peserta_id UUID REFERENCES peserta(id) ON DELETE CASCADE,
    permissions JSONB DEFAULT '{}',
    created_by UUID REFERENCES peserta(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sessions table
CREATE TABLE sesi_musyawarah (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nama_sesi VARCHAR(150) NOT NULL,
    deskripsi TEXT,
    tanggal DATE NOT NULL,
    waktu_mulai TIME NOT NULL,
    waktu_selesai TIME NOT NULL,
    timezone VARCHAR(10) DEFAULT 'Asia/Jakarta',
    lokasi VARCHAR(200),
    tipe VARCHAR(20) DEFAULT 'offline' CHECK (tipe IN ('offline', 'online', 'hybrid')),
    maksimal_peserta INTEGER DEFAULT 100,
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'active', 'completed', 'cancelled')),
    batas_absen_mulai INTEGER DEFAULT -30,
    batas_absen_selesai INTEGER DEFAULT 30,
    link_pendek VARCHAR(100),
    created_by UUID NOT NULL REFERENCES peserta(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Attendance table
CREATE TABLE absensi (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    peserta_id UUID NOT NULL REFERENCES peserta(id) ON DELETE CASCADE,
    sesi_id UUID NOT NULL REFERENCES sesi_musyawarah(id) ON DELETE CASCADE,
    waktu_absen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status_kehadiran VARCHAR(20) DEFAULT 'hadir' CHECK (status_kehadiran IN ('hadir', 'terlambat', 'izin', 'sakit')),
    catatan TEXT,
    ip_address INET,
    user_agent TEXT,
    lokasi_koordinat POINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(peserta_id, sesi_id)
);

-- Meeting notes table
CREATE TABLE notulensi_sesi (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sesi_id UUID NOT NULL REFERENCES sesi_musyawarah(id) ON DELETE CASCADE,
    judul VARCHAR(200) NOT NULL,
    
    -- Standard template fields
    agenda TEXT NOT NULL,
    pembahasan TEXT NOT NULL,
    keputusan TEXT,
    tindak_lanjut TEXT,
    penanggung_jawab TEXT,
    target_waktu DATE,
    lampiran_urls TEXT[],
    
    -- Workflow fields
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'pending_approval', 'approved', 'rejected')),
    catatan_approval TEXT,
    version INTEGER DEFAULT 1,
    
    -- Audit fields
    dibuat_oleh UUID NOT NULL REFERENCES peserta(id),
    disetujui_oleh UUID REFERENCES peserta(id),
    tanggal_approval TIMESTAMP WITH TIME ZONE,
    ditolak_oleh UUID REFERENCES peserta(id),
    tanggal_penolakan TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comments on meeting notes
CREATE TABLE komentar_notulensi (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    notulensi_id UUID NOT NULL REFERENCES notulensi_sesi(id) ON DELETE CASCADE,
    peserta_id UUID NOT NULL REFERENCES peserta(id) ON DELETE CASCADE,
    komentar TEXT NOT NULL,
    parent_id UUID REFERENCES komentar_notulensi(id), -- For threaded comments
    mentions UUID[], -- Array of mentioned participant IDs
    edited_at TIMESTAMP WITH TIME ZONE,
    aktif BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Special access for meeting notes
CREATE TABLE akses_khusus_notulensi (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    notulensi_id UUID NOT NULL REFERENCES notulensi_sesi(id) ON DELETE CASCADE,
    peserta_id UUID NOT NULL REFERENCES peserta(id) ON DELETE CASCADE,
    diberikan_oleh UUID NOT NULL REFERENCES peserta(id),
    alasan TEXT,
    tanggal_diberikan TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    tanggal_kadaluarsa TIMESTAMP WITH TIME ZONE,
    aktif BOOLEAN DEFAULT true,
    UNIQUE(notulensi_id, peserta_id)
);

-- Notifications table
CREATE TABLE notifikasi (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    peserta_id UUID NOT NULL REFERENCES peserta(id) ON DELETE CASCADE,
    judul VARCHAR(200) NOT NULL,
    pesan TEXT NOT NULL,
    tipe VARCHAR(50) NOT NULL, -- 'attendance_reminder', 'notes_published', 'comment_reply', etc.
    data JSONB, -- Additional data for the notification
    dibaca BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activity logs
CREATE TABLE log_aktivitas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    peserta_id UUID REFERENCES peserta(id),
    aktivitas VARCHAR(100) NOT NULL,
    detail JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance (optimized for 100 participants)
CREATE INDEX idx_absensi_sesi_waktu ON absensi(sesi_id, waktu_absen);
CREATE INDEX idx_absensi_peserta_waktu ON absensi(peserta_id, waktu_absen DESC);
CREATE INDEX idx_peserta_email_aktif ON peserta(email, aktif);
CREATE INDEX idx_peserta_nama_search ON peserta USING gin(to_tsvector('indonesian', nama));
CREATE INDEX idx_sesi_tanggal_status ON sesi_musyawarah(tanggal, status);
CREATE INDEX idx_notulensi_status_sesi ON notulensi_sesi(status, sesi_id);
CREATE INDEX idx_komentar_notulensi_created ON komentar_notulensi(notulensi_id, created_at DESC);
CREATE INDEX idx_notifikasi_peserta_dibaca ON notifikasi(peserta_id, dibaca, created_at DESC);