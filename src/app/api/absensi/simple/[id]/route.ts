import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sesiId = params.id
    const supabase = createServerClient()

    console.log('Simple attendance query for session:', sesiId)

    // Get raw attendance data first
    const { data: rawAbsensi, error: rawError } = await (supabase as any)
      .from('absensi')
      .select('*')
      .eq('sesi_id', sesiId)
      .order('waktu_absen', { ascending: true })

    console.log('Raw attendance count:', rawAbsensi?.length || 0)

    if (rawError) {
      console.error('Raw attendance error:', rawError)
      return NextResponse.json({ error: 'Failed to fetch attendance' }, { status: 500 })
    }

    if (!rawAbsensi || rawAbsensi.length === 0) {
      return NextResponse.json([])
    }

    // Get participant details separately
    const pesertaIds = rawAbsensi.map((a: any) => a.peserta_id)
    const { data: pesertaData, error: pesertaError } = await (supabase as any)
      .from('peserta')
      .select('id, nama, email, jabatan, instansi')
      .in('id', pesertaIds)

    console.log('Participants found:', pesertaData?.length || 0)

    if (pesertaError) {
      console.error('Participants error:', pesertaError)
    }

    // Combine data
    const combinedData = rawAbsensi.map((absen: any) => ({
      id: absen.id,
      peserta_id: absen.peserta_id,
      status_kehadiran: absen.status_kehadiran,
      waktu_absen: absen.waktu_absen,
      catatan: absen.catatan,
      peserta: pesertaData?.find((p: any) => p.id === absen.peserta_id) || {
        id: absen.peserta_id,
        nama: 'Unknown',
        email: '',
        jabatan: '',
        instansi: ''
      }
    }))

    console.log('Final combined data:', combinedData.length)
    return NextResponse.json(combinedData)

  } catch (error) {
    console.error('Simple API Error:', error)
    return NextResponse.json({ error: 'System error' }, { status: 500 })
  }
}