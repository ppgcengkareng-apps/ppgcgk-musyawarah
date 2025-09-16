import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()

    const { data: sessions, error } = await (supabase as any)
      .from('sesi_musyawarah')
      .select('*')
      .order('tanggal', { ascending: false })

    if (error) {
      console.error('Get sessions error:', error)
      return NextResponse.json(
        { error: 'Gagal memuat data sesi' },
        { status: 500 }
      )
    }

    return NextResponse.json(sessions || [])

  } catch (error) {
    console.error('Get sessions API error:', error)
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
    
    const { 
      nama_sesi, 
      deskripsi, 
      tanggal, 
      waktu_mulai, 
      waktu_selesai, 
      lokasi, 
      tipe, 
      maksimal_peserta,
      peserta_ids 
    } = body

    // Validate required fields
    if (!nama_sesi || !tanggal || !waktu_mulai || !waktu_selesai) {
      return NextResponse.json(
        { error: 'Data tidak lengkap' },
        { status: 400 }
      )
    }

    if (!peserta_ids || peserta_ids.length === 0) {
      return NextResponse.json(
        { error: 'Pilih minimal 1 peserta yang wajib hadir' },
        { status: 400 }
      )
    }

    // Create session
    const { data: session, error: sessionError } = await (supabase as any)
      .from('sesi_musyawarah')
      .insert({
        nama_sesi,
        deskripsi: deskripsi || null,
        tanggal,
        waktu_mulai,
        waktu_selesai,
        lokasi: lokasi || null,
        tipe: tipe || 'offline',
        maksimal_peserta: maksimal_peserta || 100,
        status: 'scheduled',
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (sessionError) {
      console.error('Create session error:', sessionError)
      return NextResponse.json(
        { error: 'Gagal membuat sesi' },
        { status: 500 }
      )
    }

    // Create session-participant relationships
    try {
      const sesiPesertaData = peserta_ids.map((peserta_id: string) => ({
        sesi_id: session.id,
        peserta_id,
        wajib_hadir: true,
        created_at: new Date().toISOString()
      }))

      const { error: relationError } = await (supabase as any)
        .from('sesi_peserta')
        .insert(sesiPesertaData)

      if (relationError) {
        console.error('Create session-participant relation error:', relationError)
        
        // If sesi_peserta table doesn't exist, continue without it for now
        if (relationError.code === '42P01') {
          console.warn('sesi_peserta table does not exist, skipping participant relations')
        } else {
          // Rollback: delete the created session
          await (supabase as any)
            .from('sesi_musyawarah')
            .delete()
            .eq('id', session.id)
          
          return NextResponse.json(
            { error: 'Gagal menyimpan data peserta: ' + relationError.message },
            { status: 500 }
          )
        }
      }
    } catch (relationError) {
      console.error('Session-participant relation error:', relationError)
      // Continue without participant relations for now
    }

    return NextResponse.json({
      message: 'Sesi berhasil dibuat',
      data: session
    })

  } catch (error) {
    console.error('Create session API error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan sistem' },
      { status: 500 }
    )
  }
}