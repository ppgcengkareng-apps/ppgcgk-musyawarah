import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient()
    const { id } = params

    // Get all participants assigned to this session with details
    const { data: sesiPeserta, error: sesiPesertaError } = await (supabase as any)
      .from('sesi_peserta')
      .select(`
        peserta_id,
        peserta!inner (
          id,
          nama,
          email,
          jabatan
        )
      `)
      .eq('sesi_id', id)

    if (sesiPesertaError) {
      console.error('Error fetching session participants:', sesiPesertaError)
      return NextResponse.json([])
    }

    // Get attendance records for this session
    const { data: absensiData, error: absensiError } = await (supabase as any)
      .from('absensi')
      .select('peserta_id, status_kehadiran, waktu_absen, catatan')
      .eq('sesi_id', id)

    console.log('Session ID:', id)
    console.log('Absensi Data:', absensiData)
    console.log('Absensi Error:', absensiError)

    if (absensiError) {
      console.error('Error fetching attendance:', absensiError)
    }

    // Combine participant data with attendance status
    const attendanceData = sesiPeserta?.map((sp: any) => {
      const attendance = absensiData?.find((a: any) => a.peserta_id === sp.peserta.id)
      
      return {
        peserta: sp.peserta,
        status_kehadiran: attendance?.status_kehadiran || null,
        waktu_absen: attendance?.waktu_absen || null,
        catatan: attendance?.catatan || null
      }
    }) || []

    return NextResponse.json(attendanceData)

  } catch (error) {
    console.error('Get session attendance API error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan sistem' },
      { status: 500 }
    )
  }
}