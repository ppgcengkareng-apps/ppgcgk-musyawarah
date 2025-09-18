import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'overview'

    switch (type) {
      case 'overview':
        return await getOverviewStats(supabase)
      case 'kehadiran':
        return await getAttendanceReport(supabase)
      case 'peserta':
        return await getParticipantReport(supabase)
      case 'sesi':
        return await getSessionReport(supabase)
      case 'notulensi':
        return await getNotesReport(supabase)
      case 'aktivitas':
        return await getActivityReport(supabase)
      default:
        return await getOverviewStats(supabase)
    }
  } catch (error) {
    console.error('Laporan API error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan sistem' },
      { status: 500 }
    )
  }
}

async function getOverviewStats(supabase: any) {
  const [pesertaResult, sesiResult, absensiResult, notulensiResult] = await Promise.all([
    supabase.from('peserta').select('id', { count: 'exact' }),
    supabase.from('sesi_musyawarah').select('id', { count: 'exact' }),
    supabase.from('absensi').select('id', { count: 'exact' }),
    supabase.from('notulensi_sesi').select('id, status', { count: 'exact' })
  ])

  const totalParticipants = pesertaResult.count || 0
  const totalSessions = sesiResult.count || 0
  const totalAttendance = absensiResult.count || 0
  const totalNotes = notulensiResult.count || 0
  
  const approvedNotes = notulensiResult.data?.filter((n: any) => n.status === 'approved').length || 0
  const attendanceRate = totalSessions > 0 ? Math.round((totalAttendance / (totalSessions * totalParticipants)) * 100) : 0
  const approvalRate = totalNotes > 0 ? Math.round((approvedNotes / totalNotes) * 100) : 0

  return NextResponse.json({
    totalParticipants,
    totalSessions,
    totalAttendance,
    totalNotes,
    attendanceRate,
    approvalRate
  })
}

async function getAttendanceReport(supabase: any) {
  // Get attendance data
  const { data: absensiData, error: absensiError } = await (supabase as any)
    .from('absensi')
    .select('id, peserta_id, sesi_id, status_kehadiran, waktu_absen, catatan')
    .order('waktu_absen', { ascending: false })

  if (absensiError) throw absensiError

  // Get related data
  const reportData = []
  if (absensiData && absensiData.length > 0) {
    const pesertaIds = [...new Set(absensiData.map((a: any) => a.peserta_id))]
    const sesiIds = [...new Set(absensiData.map((a: any) => a.sesi_id))]
    
    const [pesertaResult, sesiResult] = await Promise.all([
      (supabase as any).from('peserta').select('id, nama, email').in('id', pesertaIds),
      (supabase as any).from('sesi_musyawarah').select('id, nama_sesi, tanggal').in('id', sesiIds)
    ])
    
    // Combine data
    for (const absen of absensiData) {
      const peserta = pesertaResult.data?.find((p: any) => p.id === absen.peserta_id)
      const sesi = sesiResult.data?.find((s: any) => s.id === absen.sesi_id)
      
      reportData.push({
        'Nama Peserta': peserta?.nama || '-',
        'Email': peserta?.email || '-',
        'Nama Sesi': sesi?.nama_sesi || '-',
        'Tanggal': sesi?.tanggal ? new Date(sesi.tanggal).toLocaleDateString('id-ID') : '-',
        'Status Kehadiran': absen.status_kehadiran || '-',
        'Waktu Absen': absen.waktu_absen ? new Date(absen.waktu_absen).toLocaleString('id-ID') : '-',
        'Catatan': absen.catatan || '-'
      })
    }
  }

  return NextResponse.json(reportData)
}

async function getParticipantReport(supabase: any) {
  const { data, error } = await (supabase as any)
    .from('peserta')
    .select('id, nama, email, nomor_hp, jabatan, instansi, role, aktif, created_at')
    .order('nama')

  if (error) throw error
  
  const reportData = data?.map((p: any) => ({
    'Nama': p.nama || '-',
    'Email': p.email || '-',
    'Nomor HP': p.nomor_hp || '-',
    'Jabatan': p.jabatan || '-',
    'Instansi': p.instansi || '-',
    'Role': p.role || '-',
    'Status': p.aktif ? 'Aktif' : 'Tidak Aktif',
    'Tanggal Daftar': p.created_at ? new Date(p.created_at).toLocaleDateString('id-ID') : '-'
  })) || []
  
  return NextResponse.json(reportData)
}

async function getSessionReport(supabase: any) {
  const { data, error } = await (supabase as any)
    .from('sesi_musyawarah')
    .select('id, nama_sesi, tanggal, waktu_mulai, waktu_selesai, lokasi, tipe, status, maksimal_peserta, created_at')
    .order('tanggal', { ascending: false })

  if (error) throw error
  
  const reportData = data?.map((s: any) => ({
    'Nama Sesi': s.nama_sesi || '-',
    'Tanggal': s.tanggal ? new Date(s.tanggal).toLocaleDateString('id-ID') : '-',
    'Waktu Mulai': s.waktu_mulai || '-',
    'Waktu Selesai': s.waktu_selesai || '-',
    'Lokasi': s.lokasi || '-',
    'Tipe': s.tipe || '-',
    'Status': s.status || '-',
    'Maksimal Peserta': s.maksimal_peserta || '-',
    'Tanggal Dibuat': s.created_at ? new Date(s.created_at).toLocaleDateString('id-ID') : '-'
  })) || []
  
  return NextResponse.json(reportData)
}

async function getNotesReport(supabase: any) {
  // Get notulensi data
  const { data: notulensiData, error: notulensiError } = await (supabase as any)
    .from('notulensi_sesi')
    .select('id, sesi_id, dibuat_oleh, judul, status, version, created_at, updated_at')
    .order('created_at', { ascending: false })

  if (notulensiError) throw notulensiError

  // Get related data
  const reportData = []
  if (notulensiData && notulensiData.length > 0) {
    const sesiIds = [...new Set(notulensiData.map((n: any) => n.sesi_id))]
    const pembuatIds = [...new Set(notulensiData.map((n: any) => n.dibuat_oleh))]
    
    const [sesiResult, pembuatResult] = await Promise.all([
      (supabase as any).from('sesi_musyawarah').select('id, nama_sesi, tanggal').in('id', sesiIds),
      (supabase as any).from('peserta').select('id, nama').in('id', pembuatIds)
    ])
    
    // Combine data
    for (const notulensi of notulensiData) {
      const sesi = sesiResult.data?.find((s: any) => s.id === notulensi.sesi_id)
      const pembuat = pembuatResult.data?.find((p: any) => p.id === notulensi.dibuat_oleh)
      
      reportData.push({
        'Judul': notulensi.judul || '-',
        'Nama Sesi': sesi?.nama_sesi || '-',
        'Tanggal Sesi': sesi?.tanggal ? new Date(sesi.tanggal).toLocaleDateString('id-ID') : '-',
        'Dibuat Oleh': pembuat?.nama || '-',
        'Status': notulensi.status || '-',
        'Versi': notulensi.version || '-',
        'Tanggal Dibuat': notulensi.created_at ? new Date(notulensi.created_at).toLocaleDateString('id-ID') : '-',
        'Terakhir Update': notulensi.updated_at ? new Date(notulensi.updated_at).toLocaleDateString('id-ID') : '-'
      })
    }
  }

  return NextResponse.json(reportData)
}

async function getActivityReport(supabase: any) {
  const { data, error } = await (supabase as any)
    .from('peserta')
    .select('id, nama, email, role, last_login, created_at')
    .not('last_login', 'is', null)
    .order('last_login', { ascending: false })
    .limit(100)

  if (error) throw error
  
  const reportData = data?.map((p: any) => ({
    'Nama': p.nama || '-',
    'Email': p.email || '-',
    'Role': p.role || '-',
    'Login Terakhir': p.last_login ? new Date(p.last_login).toLocaleString('id-ID') : '-',
    'Tanggal Daftar': p.created_at ? new Date(p.created_at).toLocaleDateString('id-ID') : '-'
  })) || []
  
  return NextResponse.json(reportData)
}