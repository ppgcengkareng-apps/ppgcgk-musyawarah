import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sesiId = params.id
    const supabase = createServerClient()

    // Get peserta assigned to this sesi
    const { data, error } = await (supabase as any)
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

    if (error) {
      console.error('Error fetching peserta:', error)
      return NextResponse.json(
        { error: 'Gagal mengambil data peserta' },
        { status: 500 }
      )
    }

    // Extract peserta data from the nested structure
    const pesertaList = data?.map((item: any) => item.peserta).filter(Boolean) || []

    return NextResponse.json(pesertaList)

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan sistem' },
      { status: 500 }
    )
  }
}