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

    const { data: participant, error } = await (supabase as any)
      .from('peserta')
      .insert({
        nama,
        email,
        nomor_hp,
        jabatan,
        instansi,
        role: role || 'peserta',
        password_hash: process.env.DEFAULT_PASSWORD || 'password123',
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

export async function PUT(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const id = url.searchParams.get('id')
    const { nama, jabatan, instansi, role, password } = await request.json()
    
    if (!id) {
      return NextResponse.json({ error: 'ID peserta diperlukan' }, { status: 400 })
    }

    const supabase = createServerClient()

    // Prepare update data
    const updateData: any = { nama, jabatan, instansi, role }
    
    // Only update password if provided
    if (password && password.trim() !== '') {
      updateData.password_hash = password
    }

    const { data, error } = await supabase
      .from('peserta')
      .update(updateData)
      .eq('id', id)
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    return NextResponse.json({ error: 'Terjadi kesalahan sistem' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const id = url.searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'ID peserta diperlukan' }, { status: 400 })
    }

    const supabase = createServerClient()

    const { error } = await supabase
      .from('peserta')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Terjadi kesalahan sistem' }, { status: 500 })
  }
}