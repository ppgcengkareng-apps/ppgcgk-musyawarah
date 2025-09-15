import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()

    const { data: participants, error } = await supabase
      .from('peserta')
      .select('id, nama, email, jabatan, instansi, role')
      .eq('aktif', true)
      .order('nama')

    if (error) {
      return NextResponse.json(
        { error: 'Gagal memuat data peserta' },
        { status: 500 }
      )
    }

    return NextResponse.json(participants || [])

  } catch (error) {
    console.error('Get participants error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan sistem' },
      { status: 500 }
    )
  }
}