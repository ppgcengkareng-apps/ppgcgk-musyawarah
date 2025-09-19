import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sesiId = params.id
    const supabase = createServerClient()

    // Get attendance data
    const { data: absensiData, error: absensiError } = await (supabase as any)
      .from('absensi')
      .select('id, peserta_id, status_kehadiran, waktu_absen, catatan')
      .eq('sesi_id', sesiId)
      .order('waktu_absen', { ascending: true })

    console.log('Raw absensi data:', absensiData)
    console.log('Absensi count:', absensiData?.length)

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
      
      const { data: pesertaData, error: pesertaError } = await (supabase as any)
        .from('peserta')
        .select('id, nama, email, jabatan, instansi')
        .in('id', pesertaIds)
      
      console.log('Peserta IDs to fetch:', pesertaIds)
      console.log('Peserta data fetched:', pesertaData)
      
      if (pesertaError) {
        console.error('Error fetching peserta data:', pesertaError)
      }
      
      // Combine absensi with peserta data
      for (const absen of absensiData) {
        const peserta = pesertaData?.find((p: any) => p.id === absen.peserta_id)
        console.log(`Matching peserta for ${absen.peserta_id}:`, peserta)
        absensiWithPeserta.push({
          ...absen,
          peserta: peserta || null
        })
      }
      
      console.log('Final absensi with peserta:', absensiWithPeserta)
    }

    return NextResponse.json(absensiWithPeserta)

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan sistem' },
      { status: 500 }
    )
  }
}