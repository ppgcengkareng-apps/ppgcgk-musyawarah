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

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const body = await request.json()
    
    // Get first admin user as creator
    const { data: adminUser } = await supabase
      .from('peserta')
      .select('id')
      .eq('role', 'admin')
      .limit(1)
      .single()

    const createdBy = (adminUser as any)?.id || '00000000-0000-0000-0000-000000000000'

    const { data, error } = await (supabase as any)
      .from('notulensi_sesi')
      .insert({
        sesi_id: body.sesi_id,
        judul: body.judul,
        agenda: body.isi_notulensi || '',
        pembahasan: body.isi_notulensi || '',
        keputusan: body.kesimpulan,
        tindak_lanjut: body.tindak_lanjut,
        status: 'draft',
        version: 1,
        dibuat_oleh: createdBy
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Gagal membuat notulensi' },
        { status: 500 }
      )
    }

    return NextResponse.json(data)

  } catch (error) {
    console.error('Create meeting note error:', error)
    return NextResponse.json(
      { error: `Server error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
}