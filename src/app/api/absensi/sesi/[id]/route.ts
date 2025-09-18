import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sesiId = params.id
    const supabase = createServerClient()

    console.log('Fetching absensi for sesi:', sesiId)
    
    // Get attendance data with explicit casting
    const { data: absensiData, error: absensiError } = await (supabase as any)
      .from('absensi')
      .select('id, peserta_id, status_kehadiran, waktu_absen, catatan')
      .eq('sesi_id', sesiId)
      .order('waktu_absen', { ascending: true })
    
    console.log('Raw absensi data count:', absensiData?.length)
    console.log('Raw absensi data:', absensiData)
    
    if (absensiError) {
      console.error('Absensi error:', absensiError)
    }

    if (absensiError) {
      console.error('Error fetching attendance:', absensiError)
      return NextResponse.json(
        { error: 'Gagal mengambil data kehadiran' },
        { status: 500 }
      )
    }

    // Get peserta data for each attendance record
    const absensiWithPeserta = []
    if (absensiData && absensiData.length > 0) {
      const pesertaIds = absensiData.map((a: any) => a.peserta_id)
      
      const { data: pesertaData } = await (supabase as any)
        .from('peserta')
        .select('id, nama, email, jabatan, instansi')
        .in('id', pesertaIds)
      
      // Combine absensi with peserta data
      for (const absen of absensiData) {
        const peserta = pesertaData?.find((p: any) => p.id === absen.peserta_id)
        absensiWithPeserta.push({
          ...absen,
          peserta: peserta || null
        })
      }
    }

    // Set cache headers to prevent caching
    const response = NextResponse.json(absensiWithPeserta)
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
    return response

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan sistem' },
      { status: 500 }
    )
  }
}