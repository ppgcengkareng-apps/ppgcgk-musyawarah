import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()

    const { data: meetingNotes, error } = await supabase
      .from('notulensi_sesi')
      .select(`
        id,
        judul,
        status,
        version,
        created_at,
        updated_at,
        sesi:sesi_id(nama_sesi, tanggal, waktu_mulai),
        dibuat_oleh:dibuat_oleh(nama),
        disetujui_oleh:disetujui_oleh(nama)
      `)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json(
        { error: 'Gagal memuat data notulensi' },
        { status: 500 }
      )
    }

    return NextResponse.json(meetingNotes || [])

  } catch (error) {
    console.error('Get meeting notes error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan sistem' },
      { status: 500 }
    )
  }
}