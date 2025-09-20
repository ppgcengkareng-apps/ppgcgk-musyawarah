import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sesiId = params.id
    const supabase = createServerClient()

    console.log('Debug raw attendance for session:', sesiId)

    // Get ALL attendance records for this session
    const { data: allAbsensi, error } = await (supabase as any)
      .from('absensi')
      .select('*')
      .eq('sesi_id', sesiId)

    console.log('All attendance records:', allAbsensi?.length || 0)
    console.log('Error:', error)

    return NextResponse.json({
      session_id: sesiId,
      total_records: allAbsensi?.length || 0,
      records: allAbsensi || [],
      error: error
    })

  } catch (error) {
    console.error('Debug API Error:', error)
    return NextResponse.json({ error: 'System error' }, { status: 500 })
  }
}