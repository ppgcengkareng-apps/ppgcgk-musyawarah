import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient()
    const { id } = params

    const { data: session, error } = await supabase
      .from('sesi_musyawarah')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Sesi tidak ditemukan' },
        { status: 404 }
      )
    }

    return NextResponse.json(session)

  } catch (error) {
    console.error('Get session error:', error)
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
    
    const { 
      nama_sesi, 
      deskripsi, 
      tanggal, 
      waktu_mulai, 
      waktu_selesai, 
      lokasi, 
      tipe, 
      maksimal_peserta 
    } = body

    const updateData = {
      nama_sesi,
      deskripsi: deskripsi || null,
      tanggal,
      waktu_mulai: waktu_mulai.substring(0, 8),
      waktu_selesai: waktu_selesai.substring(0, 8),
      lokasi: lokasi || null,
      tipe: tipe || 'offline',
      maksimal_peserta: parseInt(maksimal_peserta) || 100,
      updated_at: new Date().toISOString()
    }

    const { data: session, error } = await supabase
      .from('sesi_musyawarah')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      // Sanitize error message to prevent log injection
      const sanitizedError = error.message?.replace(/[\r\n]/g, ' ') || 'Unknown error'
      console.error('Supabase error:', sanitizedError)
      return NextResponse.json(
        { error: `Database error: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json(session)

  } catch (error) {
    console.error('Update session error:', error)
    return NextResponse.json(
      { error: `Server error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
}