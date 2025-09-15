import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient()

    const { data: session, error } = await supabase
      .from('sesi_musyawarah')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error || !session) {
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