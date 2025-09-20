import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sesiId = params.id
    const supabase = createServerClient()

    console.log('Fetching participants for session:', sesiId)

    // Get participant IDs first (avoid JOIN)
    const { data: sesiPesertaData, error: sesiError } = await (supabase as any)
      .from('sesi_peserta')
      .select('peserta_id')
      .eq('sesi_id', sesiId)

    if (sesiError) {
      console.error('Error fetching session participants:', sesiError)
      return NextResponse.json(
        { error: 'Gagal mengambil data peserta' },
        { status: 500 }
      )
    }

    if (!sesiPesertaData || sesiPesertaData.length === 0) {
      return NextResponse.json([])
    }

    // Get participant details separately
    const pesertaIds = sesiPesertaData.map((sp: any) => sp.peserta_id)
    const { data: pesertaData, error: pesertaError } = await (supabase as any)
      .from('peserta')
      .select('id, nama, email, jabatan, instansi')
      .in('id', pesertaIds)

    if (pesertaError) {
      console.error('Error fetching participant details:', pesertaError)
      return NextResponse.json(
        { error: 'Gagal mengambil detail peserta' },
        { status: 500 }
      )
    }

    console.log('Participants found:', pesertaData?.length || 0)
    return NextResponse.json(pesertaData || [])

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan sistem' },
      { status: 500 }
    )
  }
}