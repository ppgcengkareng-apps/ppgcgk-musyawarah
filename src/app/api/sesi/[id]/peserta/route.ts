import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sesiId = params.id
    const supabase = createServerClient()

    console.log('Fetching peserta for sesi:', sesiId)

    // Get peserta IDs assigned to this sesi
    const { data: sesiPesertaData, error: sesiError } = await (supabase as any)
      .from('sesi_peserta')
      .select('peserta_id')
      .eq('sesi_id', sesiId)

    console.log('Sesi peserta data:', sesiPesertaData)

    if (sesiError) {
      console.error('Error fetching sesi_peserta:', sesiError)
      return NextResponse.json(
        { error: 'Gagal mengambil data peserta' },
        { status: 500 }
      )
    }

    // Get peserta details using JOIN for better reliability
    const { data: pesertaList, error: pesertaError } = await (supabase as any)
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
    
    console.log('Raw peserta list:', pesertaList)
    
    // Transform the data
    let finalPesertaList = []
    if (pesertaList && !pesertaError) {
      finalPesertaList = pesertaList
        .map((item: any) => item.peserta)
        .filter((p: any) => p && p.id)
    }
    
    console.log('Final peserta list:', finalPesertaList)

    console.log('Final peserta list:', finalPesertaList)
    
    // Set cache headers to prevent caching
    const response = NextResponse.json(finalPesertaList)
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