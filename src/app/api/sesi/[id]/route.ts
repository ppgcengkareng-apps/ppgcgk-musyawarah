import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient()
    const { id } = params

    if (!id) {
      return NextResponse.json(
        { error: 'ID sesi tidak valid' },
        { status: 400 }
      )
    }

    // Check if session exists
    const { data: existingSession, error: checkError } = await (supabase as any)
      .from('sesi_musyawarah')
      .select('id, nama_sesi')
      .eq('id', id)
      .single()

    if (checkError || !existingSession) {
      return NextResponse.json(
        { error: 'Sesi tidak ditemukan' },
        { status: 404 }
      )
    }

    // Delete related records first (cascade delete)
    // Delete sesi_peserta records
    await (supabase as any)
      .from('sesi_peserta')
      .delete()
      .eq('sesi_id', id)

    // Delete absensi records
    await (supabase as any)
      .from('absensi')
      .delete()
      .eq('sesi_id', id)

    // Delete notulensi records
    await (supabase as any)
      .from('notulensi_sesi')
      .delete()
      .eq('sesi_id', id)

    // Finally delete the session
    const { error: deleteError } = await (supabase as any)
      .from('sesi_musyawarah')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Delete session error:', deleteError)
      return NextResponse.json(
        { error: 'Gagal menghapus sesi' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Sesi berhasil dihapus',
      deletedSession: existingSession
    })

  } catch (error) {
    console.error('Delete session API error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan sistem' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient()
    const { id } = params

    const { data, error } = await (supabase as any)
      .from('sesi_musyawarah')
      .select(`
        *,
        sesi_peserta (
          peserta_id,
          peserta:peserta_id (
            id,
            nama,
            username,
            bidang
          )
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Sesi tidak ditemukan' },
        { status: 404 }
      )
    }

    return NextResponse.json(data)

  } catch (error) {
    console.error('Get session API error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan sistem' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient()
    const { id } = params
    const body = await request.json()

    const { data, error } = await (supabase as any)
      .from('sesi_musyawarah')
      .update({
        nama_sesi: body.nama_sesi,
        deskripsi: body.deskripsi,
        tanggal: body.tanggal,
        waktu_mulai: body.waktu_mulai,
        waktu_selesai: body.waktu_selesai,
        lokasi: body.lokasi,
        tipe: body.tipe,
        maksimal_peserta: body.maksimal_peserta,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Gagal mengupdate sesi' },
        { status: 500 }
      )
    }

    return NextResponse.json(data)

  } catch (error) {
    console.error('Update session API error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan sistem' },
      { status: 500 }
    )
  }
}