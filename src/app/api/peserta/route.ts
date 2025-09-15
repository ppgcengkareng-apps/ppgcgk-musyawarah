import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()

    const { data: participants, error } = await supabase
      .from('peserta')
      .select('id, nama, email, nomor_hp, jabatan, instansi, role, aktif, created_at')
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nama, email, nomor_hp, jabatan, instansi, role } = body

    if (!nama || !email) {
      return NextResponse.json(
        { error: 'Nama dan email harus diisi' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    const { data: participant, error } = await supabase
      .from('peserta')
      .insert({
        nama,
        email,
        nomor_hp,
        jabatan,
        instansi,
        role: role || 'peserta',
        password_hash: 'password123',
        aktif: true
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Gagal menambah peserta' },
        { status: 500 }
      )
    }

    return NextResponse.json(participant)

  } catch (error) {
    console.error('Create participant error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan sistem' },
      { status: 500 }
    )
  }
}