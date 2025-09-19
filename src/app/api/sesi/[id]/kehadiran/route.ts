import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sesiId = params.id
    const supabase = createServerClient()

    // Get all assigned peserta
    const { data: allPesertaData, error: pesertaError } = await supabase
      .from('sesi_peserta')
      .select(`
        peserta:peserta_id (
          id,
          nama,
          email,
          jabatan,
          instansi
        )
      `)
      .eq('sesi_id', sesiId)

    if (pesertaError) {
      console.error('Error fetching peserta:', pesertaError)
      return NextResponse.json({ error: 'Gagal mengambil data peserta' }, { status: 500 })
    }

    // Get absensi data
    const { data: absensiData, error: absensiError } = await supabase
      .from('absensi')
      .select('peserta_id, status_kehadiran, waktu_absen, catatan')
      .eq('sesi_id', sesiId)

    if (absensiError) {
      console.error('Error fetching absensi:', absensiError)
    }

    // Combine data: all peserta with their attendance status
    const result = allPesertaData
      .map((item: any) => item.peserta)
      .filter((peserta: any) => peserta && peserta.id)
      .map((peserta: any) => {
        const absensi = absensiData?.find((a: any) => a.peserta_id === peserta.id) as any
        return {
          peserta,
          absensi: absensi || null,
          status_kehadiran: absensi?.status_kehadiran || 'ghoib',
          waktu_absen: absensi?.waktu_absen || null,
          catatan: absensi?.catatan || null
        }
      })

    const response = NextResponse.json(result)
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
    return response

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan sistem' }, { status: 500 })
  }
}