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
      maksimal_peserta
    } = body

    // Validate required fields
    if (!nama_sesi || !tanggal || !waktu_mulai || !waktu_selesai) {
      return NextResponse.json(
        { error: 'Data tidak lengkap' },
        { status: 400 }
      )
    }

    // Ultra-minimal insert - only absolutely required fields
    const { data: session, error: sessionError } = await (supabase as any)
      .from('sesi_musyawarah')
      .insert({
        nama_sesi: nama_sesi?.substring(0, 50) || 'Sesi Baru',
        tanggal: tanggal || new Date().toISOString().split('T')[0]
      })
      .select()
      .single()

    if (sessionError) {
      console.error('Create session error:', sessionError)
      return NextResponse.json(
        { error: 'Gagal membuat sesi: ' + sessionError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Sesi berhasil dibuat',
      data: session
    })

  } catch (error) {
    console.error('Create session API error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan sistem: ' + (error as Error).message },
      { status: 500 }
    )
  }
}