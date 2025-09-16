import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient()
    const { id } = params

    console.log('Fetching session with ID:', id)
    
    const { data: session, error } = await supabase
      .from('sesi_musyawarah')
      .select('id, nama_sesi, deskripsi, tanggal, waktu_mulai, waktu_selesai, lokasi, tipe, status, maksimal_peserta')
      .eq('id', id)
      .single()
    
    // If deskripsi is truncated, try to get it separately
    if (session && (session as any).deskripsi === 's') {
      console.log('Deskripsi appears truncated, trying separate query...')
      const { data: deskripsiOnly } = await supabase
        .from('sesi_musyawarah')
        .select('deskripsi')
        .eq('id', id)
        .single()
      
      console.log('Separate deskripsi query result:', deskripsiOnly)
      
      if (deskripsiOnly && (deskripsiOnly as any).deskripsi !== 's') {
        (session as any).deskripsi = (deskripsiOnly as any).deskripsi
        console.log('Fixed deskripsi:', (session as any).deskripsi)
      }
    }

    console.log('Supabase query result:')
    console.log('- Error:', error)
    console.log('- Data:', session)
    console.log('- Deskripsi raw:', (session as any)?.deskripsi)
    console.log('- Deskripsi length:', (session as any)?.deskripsi?.length)
    console.log('- Deskripsi type:', typeof (session as any)?.deskripsi)

    if (error) {
      console.error('Database error:', error)
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
    
    console.log('Update data being sent:', updateData)
    console.log('Original deskripsi from request:', deskripsi)
    console.log('Deskripsi length:', deskripsi?.length)
    
    // Validate deskripsi is not truncated
    if (deskripsi && deskripsi.length === 1) {
      console.warn('WARNING: Deskripsi appears to be truncated to 1 character:', deskripsi)
    }

    const { data: session, error } = await (supabase as any)
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