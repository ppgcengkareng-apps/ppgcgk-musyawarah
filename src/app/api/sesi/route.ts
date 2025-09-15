import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()

    const { data: sessions, error } = await supabase
      .from('sesi_musyawarah')
      .select('*')
      .order('tanggal', { ascending: false })

    if (error) {
      return NextResponse.json(
        { error: 'Gagal memuat data sesi' },
        { status: 500 }
      )
    }

    return NextResponse.json(sessions || [])

  } catch (error) {
    console.error('Get sessions error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan sistem' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('Request body:', body)
    
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

    if (!nama_sesi || !tanggal || !waktu_mulai || !waktu_selesai) {
      return NextResponse.json(
        { error: 'Data sesi tidak lengkap' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    // Get any existing user as creator
    const { data: existingUser } = await supabase
      .from('peserta')
      .select('id')
      .limit(1)
      .single()

    let createdBy = (existingUser as any)?.id

    // If no user exists, create a default admin user
    if (!createdBy) {
      const { data: newUser } = await (supabase as any)
        .from('peserta')
        .insert({
          nama: 'Admin System',
          email: 'admin@system.com',
          role: 'admin',
          aktif: true
        })
        .select('id')
        .single()
      
      createdBy = (newUser as any)?.id || '00000000-0000-0000-0000-000000000000'
    }

    const insertData = {
      nama_sesi,
      deskripsi: deskripsi || null,
      tanggal,
      waktu_mulai: waktu_mulai.substring(0, 8),
      waktu_selesai: waktu_selesai.substring(0, 8),
      lokasi: lokasi || null,
      tipe: tipe || 'offline',
      maksimal_peserta: parseInt(maksimal_peserta) || 100,
      status: 'scheduled',
      created_by: createdBy,
      timezone: 'WIB',
      batas_absen_mulai: 30,
      batas_absen_selesai: 15
    }

    // Sanitize log data to prevent log injection
    const sanitizedData = {
      ...insertData,
      nama_sesi: insertData.nama_sesi?.replace(/[\r\n]/g, ' '),
      deskripsi: insertData.deskripsi?.replace(/[\r\n]/g, ' ')
    }
    console.log('Insert data:', sanitizedData)

    const { data: session, error } = await (supabase as any)
      .from('sesi_musyawarah')
      .insert(insertData)
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: `Database error: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json(session)

  } catch (error) {
    console.error('Create session error:', error)
    return NextResponse.json(
      { error: `Server error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
}