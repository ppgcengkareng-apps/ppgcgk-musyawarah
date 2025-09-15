-- Row Level Security Policies
ALTER TABLE peserta ENABLE ROW LEVEL SECURITY;
ALTER TABLE sesi_musyawarah ENABLE ROW LEVEL SECURITY;
ALTER TABLE absensi ENABLE ROW LEVEL SECURITY;
ALTER TABLE notulensi_sesi ENABLE ROW LEVEL SECURITY;
ALTER TABLE komentar_notulensi ENABLE ROW LEVEL SECURITY;
ALTER TABLE akses_khusus_notulensi ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifikasi ENABLE ROW LEVEL SECURITY;

-- Admin/Sekretaris access policies
CREATE POLICY "admin_sekretaris_full_access_peserta" ON peserta FOR ALL USING (
    EXISTS (SELECT 1 FROM peserta WHERE id = auth.uid() AND role IN ('admin', 'super_admin', 'sekretaris_ppg'))
);

CREATE POLICY "admin_sekretaris_full_access_sesi" ON sesi_musyawarah FOR ALL USING (
    EXISTS (SELECT 1 FROM peserta WHERE id = auth.uid() AND role IN ('admin', 'super_admin', 'sekretaris_ppg'))
);

-- Participant self-access policies
CREATE POLICY "peserta_self_access" ON peserta FOR SELECT USING (id = auth.uid());
CREATE POLICY "peserta_self_update" ON peserta FOR UPDATE USING (id = auth.uid());

-- Public read access for active participants (for attendance form)
CREATE POLICY "public_peserta_read" ON peserta FOR SELECT USING (aktif = true);

-- Meeting notes access policies
CREATE POLICY "notulensi_creator_access" ON notulensi_sesi FOR ALL USING (
    dibuat_oleh = auth.uid() OR 
    EXISTS (SELECT 1 FROM peserta WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);

CREATE POLICY "notulensi_participant_read" ON notulensi_sesi FOR SELECT USING (
    status = 'approved' AND (
        -- Attended the session
        EXISTS (SELECT 1 FROM absensi WHERE sesi_id = notulensi_sesi.sesi_id AND peserta_id = auth.uid()) OR
        -- Has special access
        EXISTS (SELECT 1 FROM akses_khusus_notulensi WHERE notulensi_id = notulensi_sesi.id AND peserta_id = auth.uid() AND aktif = true)
    )
);

-- Comment access policies
CREATE POLICY "komentar_participant_access" ON komentar_notulensi FOR ALL USING (
    peserta_id = auth.uid() OR
    EXISTS (SELECT 1 FROM peserta WHERE id = auth.uid() AND role IN ('admin', 'super_admin')) OR
    EXISTS (
        SELECT 1 FROM notulensi_sesi n 
        WHERE n.id = komentar_notulensi.notulensi_id 
        AND (
            EXISTS (SELECT 1 FROM absensi WHERE sesi_id = n.sesi_id AND peserta_id = auth.uid()) OR
            EXISTS (SELECT 1 FROM akses_khusus_notulensi WHERE notulensi_id = n.id AND peserta_id = auth.uid() AND aktif = true)
        )
    )
);

-- Attendance policies
CREATE POLICY "absensi_participant_insert" ON absensi FOR INSERT WITH CHECK (peserta_id = auth.uid());
CREATE POLICY "absensi_admin_full" ON absensi FOR ALL USING (
    EXISTS (SELECT 1 FROM peserta WHERE id = auth.uid() AND role IN ('admin', 'super_admin', 'sekretaris_ppg'))
);
CREATE POLICY "absensi_participant_read" ON absensi FOR SELECT USING (peserta_id = auth.uid());

-- Notification policies
CREATE POLICY "notifikasi_self_access" ON notifikasi FOR ALL USING (peserta_id = auth.uid());