-- Insert sample participants with varied roles
INSERT INTO peserta (nama, email, nomor_hp, jabatan, instansi, role, password_hash) VALUES
-- Super Admin & Admin
('Dr. Budi Setiawan, M.Pd', 'budi.setiawan@ppg.kemendikbud.go.id', '081234567001', 'Direktur PPG', 'Kemendikbud RI', 'super_admin', '$2b$10$example_hash_1'),
('Prof. Siti Nurhaliza, Ph.D', 'siti.nurhaliza@ppg.kemendikbud.go.id', '081234567002', 'Kepala Bidang PPG', 'Kemendikbud RI', 'admin', '$2b$10$example_hash_2'),
('Drs. Ahmad Wijaya, M.M', 'ahmad.wijaya@ppg.kemendikbud.go.id', '081234567003', 'Koordinator Regional', 'Kemendikbud RI', 'admin', '$2b$10$example_hash_3'),

-- Sekretaris PPG
('Dr. Maya Sari Dewi, M.Pd', 'maya.sari@ppg.kemendikbud.go.id', '081234567004', 'Sekretaris PPG Pusat', 'Kemendikbud RI', 'sekretaris_ppg', '$2b$10$example_hash_4'),
('Dra. Lisa Maharani, M.Pd', 'lisa.maharani@ppg.kemendikbud.go.id', '081234567005', 'Sekretaris PPG Regional', 'Kemendikbud RI', 'sekretaris_ppg', '$2b$10$example_hash_5'),

-- Sample Participants (first 10 of 100)
('Prof. Andi Rahman, M.A', 'andi.rahman@sman3mdn.sch.id', '081234567006', 'Kepala Sekolah', 'SMA Negeri 3 Medan', 'peserta', '$2b$10$example_hash_6'),
('Dr. Indra Gunawan, M.Ed', 'indra.gunawan@sman5yk.sch.id', '081234567007', 'Wakil Kepala Sekolah', 'SMA Negeri 5 Yogyakarta', 'peserta', '$2b$10$example_hash_7'),
('Prof. Ratna Dewi Sartika, Ph.D', 'ratna.dewi@ugm.ac.id', '081234567008', 'Guru Besar', 'Universitas Gadjah Mada', 'peserta', '$2b$10$example_hash_8'),
('Drs. Bambang Setiawan, M.Si', 'bambang.setiawan@sdn15mlg.sch.id', '081234567009', 'Kepala Sekolah', 'SD Negeri 15 Malang', 'peserta', '$2b$10$example_hash_9'),
('Dr. Fitri Handayani, M.Pd', 'fitri.handayani@smpn8dps.sch.id', '081234567010', 'Guru Senior', 'SMP Negeri 8 Denpasar', 'peserta', '$2b$10$example_hash_10'),
('Prof. Hendra Kusuma, M.A', 'hendra.kusuma@sman2mks.sch.id', '081234567011', 'Kepala Sekolah', 'SMA Negeri 2 Makassar', 'peserta', '$2b$10$example_hash_11'),
('Dra. Dewi Lestari, M.M', 'dewi.lestari@sdn7plg.sch.id', '081234567012', 'Wakil Kepala Sekolah', 'SD Negeri 7 Palembang', 'peserta', '$2b$10$example_hash_12'),
('Dr. Agus Priyanto, M.Pd', 'agus.priyanto@smpn12bpp.sch.id', '081234567013', 'Guru Senior', 'SMP Negeri 12 Balikpapan', 'peserta', '$2b$10$example_hash_13'),
('Prof. Nina Marlina, Ph.D', 'nina.marlina@sman4ptk.sch.id', '081234567014', 'Kepala Sekolah', 'SMA Negeri 4 Pontianak', 'peserta', '$2b$10$example_hash_14'),
('Drs. Rudi Hartono, M.Si', 'rudi.hartono@sdn20bjm.sch.id', '081234567015', 'Wakil Kepala Sekolah', 'SD Negeri 20 Banjarmasin', 'peserta', '$2b$10$example_hash_15');

-- Sample sessions
INSERT INTO sesi_musyawarah (nama_sesi, deskripsi, tanggal, waktu_mulai, waktu_selesai, lokasi, created_by) VALUES
('Pembukaan PPG Angkatan 2025', 'Sambutan, pengenalan program, dan sosialisasi kurikulum PPG terbaru', '2025-01-20', '08:00:00', '10:30:00', 'Auditorium Kemendikbud', (SELECT id FROM peserta WHERE email = 'budi.setiawan@ppg.kemendikbud.go.id')),
('Workshop Kurikulum Merdeka', 'Implementasi kurikulum merdeka dalam program PPG dan strategi pembelajaran', '2025-01-20', '13:00:00', '15:30:00', 'Ruang Seminar Lt.3', (SELECT id FROM peserta WHERE email = 'siti.nurhaliza@ppg.kemendikbud.go.id')),
('Diskusi Evaluasi Program', 'Evaluasi program PPG periode sebelumnya dan rencana perbaikan', '2025-01-21', '09:00:00', '11:30:00', 'Ruang Rapat Direksi', (SELECT id FROM peserta WHERE email = 'ahmad.wijaya@ppg.kemendikbud.go.id'));

-- Sample meeting notes
INSERT INTO notulensi_sesi (sesi_id, judul, agenda, pembahasan, keputusan, tindak_lanjut, dibuat_oleh, status) VALUES
((SELECT id FROM sesi_musyawarah WHERE nama_sesi = 'Pembukaan PPG Angkatan 2025'), 
 'Notulensi Pembukaan PPG Angkatan 2025',
 '<h3>Agenda Pembahasan:</h3><ol><li>Sambutan Direktur PPG</li><li>Pengenalan Program PPG 2025</li><li>Sosialisasi Kurikulum Terbaru</li><li>Tanya Jawab</li></ol>',
 '<h3>Pembahasan:</h3><p>Direktur PPG menyampaikan sambutan dan overview program PPG 2025. Program ini menargetkan pelatihan 5000 guru dengan kurikulum yang disesuaikan dengan Kurikulum Merdeka.</p>',
 '<h3>Keputusan:</h3><ol><li>Program PPG 2025 resmi dibuka dengan target 5000 guru</li><li>Kurikulum disesuaikan dengan Kurikulum Merdeka</li></ol>',
 '<h3>Tindak Lanjut:</h3><ul><li>Sosialisasi ke seluruh LPTK - PIC: Tim Sosialisasi</li><li>Persiapan sistem pendaftaran - PIC: Tim IT</li></ul>',
 (SELECT id FROM peserta WHERE email = 'maya.sari@ppg.kemendikbud.go.id'),
 'approved');

-- Sample attendance
INSERT INTO absensi (peserta_id, sesi_id, status_kehadiran, catatan) VALUES
((SELECT id FROM peserta WHERE email = 'andi.rahman@sman3mdn.sch.id'), (SELECT id FROM sesi_musyawarah WHERE nama_sesi = 'Pembukaan PPG Angkatan 2025'), 'hadir', 'Hadir tepat waktu'),
((SELECT id FROM peserta WHERE email = 'indra.gunawan@sman5yk.sch.id'), (SELECT id FROM sesi_musyawarah WHERE nama_sesi = 'Pembukaan PPG Angkatan 2025'), 'hadir', 'Hadir tepat waktu'),
((SELECT id FROM peserta WHERE email = 'ratna.dewi@ugm.ac.id'), (SELECT id FROM sesi_musyawarah WHERE nama_sesi = 'Pembukaan PPG Angkatan 2025'), 'terlambat', 'Terlambat 15 menit karena macet'),
((SELECT id FROM peserta WHERE email = 'bambang.setiawan@sdn15mlg.sch.id'), (SELECT id FROM sesi_musyawarah WHERE nama_sesi = 'Pembukaan PPG Angkatan 2025'), 'hadir', 'Hadir tepat waktu'),
((SELECT id FROM peserta WHERE email = 'fitri.handayani@smpn8dps.sch.id'), (SELECT id FROM sesi_musyawarah WHERE nama_sesi = 'Pembukaan PPG Angkatan 2025'), 'hadir', 'Hadir tepat waktu');