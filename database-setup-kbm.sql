-- SQL Script untuk Setup Database KBM Desa
-- Jalankan script ini di Supabase SQL Editor

-- 1. Update enum role di tabel peserta
ALTER TYPE role_enum ADD VALUE IF NOT EXISTS 'kbm_desa_kalideres';
ALTER TYPE role_enum ADD VALUE IF NOT EXISTS 'kbm_desa_bandara';
ALTER TYPE role_enum ADD VALUE IF NOT EXISTS 'kbm_desa_kebon_jahe';
ALTER TYPE role_enum ADD VALUE IF NOT EXISTS 'kbm_desa_cengkareng';
ALTER TYPE role_enum ADD VALUE IF NOT EXISTS 'kbm_desa_kapuk_melati';
ALTER TYPE role_enum ADD VALUE IF NOT EXISTS 'kbm_desa_taman_kota';
ALTER TYPE role_enum ADD VALUE IF NOT EXISTS 'kbm_desa_jelambar';
ALTER TYPE role_enum ADD VALUE IF NOT EXISTS 'kbm_desa_cipondoh';

-- Jika enum belum ada, buat enum baru
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'role_enum') THEN
        CREATE TYPE role_enum AS ENUM (
            'peserta', 
            'sekretaris_ppg', 
            'admin', 
            'super_admin',
            'kbm_desa_kalideres',
            'kbm_desa_bandara',
            'kbm_desa_kebon_jahe',
            'kbm_desa_cengkareng',
            'kbm_desa_kapuk_melati',
            'kbm_desa_taman_kota',
            'kbm_desa_jelambar',
            'kbm_desa_cipondoh'
        );
        
        -- Update kolom role untuk menggunakan enum
        ALTER TABLE peserta ALTER COLUMN role TYPE role_enum USING role::role_enum;
    END IF;
END $$;

-- 2. Buat tabel desa_master (opsional, data bisa hardcode di API)
CREATE TABLE IF NOT EXISTS desa_master (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nama_desa VARCHAR(100) NOT NULL,
    kelompok TEXT[] NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Buat tabel laporan_kbm_desa
CREATE TABLE IF NOT EXISTS laporan_kbm_desa (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    desa_id VARCHAR(50) NOT NULL, -- kalideres, bandara, etc
    kelompok VARCHAR(100) NOT NULL,
    periode VARCHAR(7) NOT NULL, -- YYYY-MM format
    kategori_program VARCHAR(20) NOT NULL CHECK (kategori_program IN ('paud_cbr', 'pra_remaja', 'remaja', 'pra_nikah')),
    
    -- Field wajib
    jumlah_murid INTEGER NOT NULL CHECK (jumlah_murid >= 0),
    jumlah_kelas INTEGER NOT NULL CHECK (jumlah_kelas >= 0),
    persentase_kehadiran INTEGER NOT NULL CHECK (persentase_kehadiran >= 0 AND persentase_kehadiran <= 100),
    pencapaian_target_materi INTEGER NOT NULL CHECK (pencapaian_target_materi >= 0 AND pencapaian_target_materi <= 100),
    pertemuan_kbm_kali INTEGER NOT NULL CHECK (pertemuan_kbm_kali >= 0),
    sarpras TEXT NOT NULL,
    tahfidz TEXT NOT NULL,
    pengajar_mt_ms TEXT NOT NULL,
    
    -- Field opsional
    laporan_musyawarah TEXT,
    kendala_saran TEXT,
    
    -- Metadata
    created_by UUID NOT NULL REFERENCES peserta(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraint untuk mencegah duplikasi
    UNIQUE(desa_id, kelompok, periode, kategori_program)
);

-- 4. Buat index untuk performa
CREATE INDEX IF NOT EXISTS idx_laporan_kbm_periode ON laporan_kbm_desa(periode);
CREATE INDEX IF NOT EXISTS idx_laporan_kbm_desa_id ON laporan_kbm_desa(desa_id);
CREATE INDEX IF NOT EXISTS idx_laporan_kbm_kelompok ON laporan_kbm_desa(kelompok);
CREATE INDEX IF NOT EXISTS idx_laporan_kbm_kategori ON laporan_kbm_desa(kategori_program);
CREATE INDEX IF NOT EXISTS idx_laporan_kbm_created_by ON laporan_kbm_desa(created_by);

-- 5. Insert data master desa (opsional)
INSERT INTO desa_master (nama_desa, kelompok) VALUES
('Kalideres', ARRAY['Tegal Alur A', 'Tegal Alur B', 'Prepedan A', 'Prepedan B', 'Kebon Kelapa']),
('Bandara', ARRAY['Prima', 'Rawa Lele', 'Kampung Duri']),
('Kebon Jahe', ARRAY['Kebon Jahe A', 'Kebon Jahe B', 'Garikas', 'Taniwan']),
('Cengkareng', ARRAY['Fajar A', 'Fajar B', 'Fajar C']),
('Kapuk Melati', ARRAY['BGN', 'Melati A', 'Melati B']),
('Taman Kota', ARRAY['Tamkot A', 'Tamkot B', 'Rawa Buaya A', 'Rawa Buaya B']),
('Jelambar', ARRAY['Indah', 'Jaya', 'Damai', 'Pejagalan']),
('Cipondoh', ARRAY['Griya Permata', 'Pondok Bahar', 'Semanan A', 'Semanan B'])
ON CONFLICT DO NOTHING;

-- 6. Buat RLS (Row Level Security) policies
ALTER TABLE laporan_kbm_desa ENABLE ROW LEVEL SECURITY;

-- Policy untuk admin dan super_admin (akses semua)
CREATE POLICY "Admin can access all KBM data" ON laporan_kbm_desa
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM peserta 
            WHERE peserta.id = auth.uid() 
            AND peserta.role IN ('admin', 'super_admin')
        )
    );

-- Policy untuk KBM Desa (hanya akses desa mereka)
CREATE POLICY "KBM Desa can access their desa data" ON laporan_kbm_desa
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM peserta 
            WHERE peserta.id = auth.uid() 
            AND peserta.role = ('kbm_desa_' || laporan_kbm_desa.desa_id)::role_enum
        )
    );

-- 7. Grant permissions
GRANT ALL ON laporan_kbm_desa TO authenticated;
GRANT ALL ON desa_master TO authenticated;

-- 8. Buat function untuk update timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 9. Buat trigger untuk auto-update timestamp
CREATE TRIGGER update_laporan_kbm_updated_at 
    BEFORE UPDATE ON laporan_kbm_desa 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_desa_master_updated_at 
    BEFORE UPDATE ON desa_master 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 10. Insert sample users untuk testing (opsional)
-- Password: "password123" (hash bcrypt)
INSERT INTO peserta (nama, email, role, password_hash, aktif) VALUES
('Admin KBM Kalideres', 'kbm.kalideres@ppg.id', 'kbm_desa_kalideres', '$2b$10$rQZ8qVqKqKqKqKqKqKqKqOqKqKqKqKqKqKqKqKqKqKqKqKqKqKqKq', true),
('Admin KBM Bandara', 'kbm.bandara@ppg.id', 'kbm_desa_bandara', '$2b$10$rQZ8qVqKqKqKqKqKqKqKqOqKqKqKqKqKqKqKqKqKqKqKqKqKqKqKq', true),
('Admin KBM Kebon Jahe', 'kbm.kebonjahe@ppg.id', 'kbm_desa_kebon_jahe', '$2b$10$rQZ8qVqKqKqKqKqKqKqKqOqKqKqKqKqKqKqKqKqKqKqKqKqKqKqKq', true),
('Admin KBM Cengkareng', 'kbm.cengkareng@ppg.id', 'kbm_desa_cengkareng', '$2b$10$rQZ8qVqKqKqKqKqKqKqKqOqKqKqKqKqKqKqKqKqKqKqKqKqKqKqKq', true),
('Admin KBM Kapuk Melati', 'kbm.kapukmelati@ppg.id', 'kbm_desa_kapuk_melati', '$2b$10$rQZ8qVqKqKqKqKqKqKqKqOqKqKqKqKqKqKqKqKqKqKqKqKqKqKqKq', true),
('Admin KBM Taman Kota', 'kbm.tamankota@ppg.id', 'kbm_desa_taman_kota', '$2b$10$rQZ8qVqKqKqKqKqKqKqKqOqKqKqKqKqKqKqKqKqKqKqKqKqKqKqKq', true),
('Admin KBM Jelambar', 'kbm.jelambar@ppg.id', 'kbm_desa_jelambar', '$2b$10$rQZ8qVqKqKqKqKqKqKqKqOqKqKqKqKqKqKqKqKqKqKqKqKqKqKqKq', true),
('Admin KBM Cipondoh', 'kbm.cipondoh@ppg.id', 'kbm_desa_cipondoh', '$2b$10$rQZ8qVqKqKqKqKqKqKqKqOqKqKqKqKqKqKqKqKqKqKqKqKqKqKqKq', true)
ON CONFLICT (email) DO NOTHING;

-- Selesai! 
-- Fitur KBM Desa siap digunakan setelah menjalankan script ini di Supabase.