import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { email, password, type } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email dan password harus diisi' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    // Get user from peserta table
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

    // Check if user has appropriate role for login type
    if (type === 'admin' && !['admin', 'super_admin', 'sekretaris_ppg'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Akses ditolak. Anda bukan admin.' },
        { status: 403 }
      )
    }

    // For demo purposes, accept 'password123' for all users
    // In production, use proper password hashing
    const isValidPassword = password === 'password123' || 
      (user.password_hash && await bcrypt.compare(password, user.password_hash))

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Email atau password salah' },
        { status: 401 }
      )
    }

    // Create session using Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: `${user.id}@ppg.local`, // Use user ID as email for Supabase auth
      password: 'dummy-password' // Dummy password since we handle auth ourselves
    })

    if (authError) {
      // If user doesn't exist in auth, create them
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: `${user.id}@ppg.local`,
        password: 'dummy-password',
        options: {
          data: {
            user_id: user.id,
            nama: user.nama,
            role: user.role
          }
        }
      })

      if (signUpError) {
        return NextResponse.json(
          { error: 'Gagal membuat sesi' },
          { status: 500 }
        )
      }
    }

    // Update last login
    await supabase
      .from('peserta')
      .update({ last_login: new Date().toISOString() })
      .eq('id', user.id)

    // Log activity
    await supabase
      .from('log_aktivitas')
      .insert({
        peserta_id: user.id,
        aktivitas: 'login',
        detail: { type, ip: request.ip },
        ip_address: request.ip,
        user_agent: request.headers.get('user-agent')
      })

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