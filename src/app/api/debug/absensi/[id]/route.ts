import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sesiId = params.id
    const supabase = createServerClient()

    // 1. Check raw absensi data
    const { data: rawAbsensi, error: rawError } = await (supabase as any)
      .from('absensi')
      .select('*')
      .eq('sesi_id', sesiId)

    // 2. Check absensi with peserta join
    const { data: absensiWithPeserta, error: joinError } = await (supabase as any)
      .from('absensi')
      .select(`
        id, 
        peserta_id, 
        status_kehadiran, 
        waktu_absen, 
        catatan,
        peserta:peserta_id (
          id,
          nama,
          email,
          jabatan,
          instansi
        )
      `)
      .eq('sesi_id', sesiId)

    // 3. Check sesi_peserta
    const { data: sesiPeserta, error: sesiPesertaError } = await (supabase as any)
      .from('sesi_peserta')
      .select(`
        peserta_id,
        peserta:peserta_id (
          id,
          nama,
          email,
          jabatan,
          instansi
        )
      `)
      .eq('sesi_id', sesiId)

    // 4. Check sesi info
    const { data: sesiInfo, error: sesiError } = await (supabase as any)
      .from('sesi_musyawarah')
      .select('*')
      .eq('id', sesiId)
      .single()

    return NextResponse.json({
      sesi_id: sesiId,
      sesi_info: sesiInfo,
      raw_absensi: {
        data: rawAbsensi,
        count: rawAbsensi?.length || 0,
        error: rawError
      },
      absensi_with_peserta: {
        data: absensiWithPeserta,
        count: absensiWithPeserta?.length || 0,
        error: joinError
      },
      sesi_peserta: {
        data: sesiPeserta,
        count: sesiPeserta?.length || 0,
        error: sesiPesertaError
      },
      summary: {
        total_peserta_terdaftar: sesiPeserta?.length || 0,
        total_sudah_absen: rawAbsensi?.length || 0,
        belum_absen: (sesiPeserta?.length || 0) - (rawAbsensi?.length || 0)
      }
    })

  } catch (error) {
    console.error('Debug API Error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan sistem', details: error },
      { status: 500 }
    )
  }
}