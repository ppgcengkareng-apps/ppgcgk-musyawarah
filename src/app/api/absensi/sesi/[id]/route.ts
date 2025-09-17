import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient()
    const { id } = params

    // Get all participants assigned to this session
    const { data: sesiPeserta, error: sesiPesertaError } = await (supabase as any)
      .from('sesi_peserta')
      .select('peserta_id')
      .eq('sesi_id', id)
    
    if (sesiPesertaError || !sesiPeserta) {
      console.error('Error fetching session participants:', sesiPesertaError)
      return NextResponse.json([])
    }

    // Get participant details
    const pesertaIds = sesiPeserta.map((sp: any) => sp.peserta_id)
    const { data: pesertaData, error: pesertaError } = await (supabase as any)
      .from('peserta')
      .select('id, nama, email, jabatan')
      .in('id', pesertaIds)

    if (sesiPesertaError) {
      console.error('Error fetching session participants:', sesiPesertaError)
      return NextResponse.json(
        { error: 'Gagal memuat data peserta' },
        { status: 500 }
      )
    }

    // Get attendance records for this session
    const { data: absensiData, error: absensiError } = await (supabase as any)
      .from('absensi')
      .select('peserta_id, status_kehadiran, waktu_absen, catatan')
      .eq('sesi_id', id)

    if (absensiError) {
      console.error('Error fetching attendance:', absensiError)
    }

    // Combine participant data with attendance status
    const attendanceData = pesertaData?.map((peserta: any) => {
      const attendance = absensiData?.find((a: any) => a.peserta_id === peserta.id)
      
      return {
        peserta: peserta,
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