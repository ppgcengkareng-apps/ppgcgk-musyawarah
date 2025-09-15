import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email dan password harus diisi' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    // Get user from Supabase database
    const { data: user, error: userError } = await supabase
      .from('peserta')
      .select('id, nama, email, role, password_hash, aktif')
      .eq('email', email)
      .eq('aktif', true)
      .single()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Email atau password salah' },
        { status: 401 }
      )
    }

    // Simple password comparison - no hashing
    if (password !== user.password_hash) {
      return NextResponse.json(
        { error: 'Email atau password salah' },
        { status: 401 }
      )
    }

    // Check admin role
    if (!['admin', 'super_admin', 'sekretaris_ppg'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Akses ditolak. Anda bukan admin.' },
        { status: 403 }
      )
    }

    // Update last login
    await supabase
      .from('peserta')
      .update({ last_login: new Date().toISOString() })
      .eq('id', user.id)

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        nama: user.nama,
        email: user.email,
        role: user.role
      }
    })

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan sistem' },
      { status: 500 }
    )
  }
}