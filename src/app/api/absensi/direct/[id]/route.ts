import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sesiId = params.id
    const supabase = createServerClient()

    console.log('Direct attendance query for session:', sesiId)

    // Get ALL attendance records without any filters or limits
    const { data: allAttendance } = await (supabase as any)
      .from('absensi')
      .select('*')
      .eq('sesi_id', sesiId)

    if (!allAttendance || allAttendance.length === 0) {
      console.log('No attendance records found')
      return NextResponse.json([])
    }

    console.log('Found attendance records:', allAttendance.length)

    // Get all unique participant IDs
    const participantIds = Array.from(new Set(allAttendance.map((a: any) => a.peserta_id)))
    
    // Get all participants in one query
    const { data: participants } = await (supabase as any)
      .from('peserta')
      .select('*')
      .in('id', participantIds)

    console.log('Found participants:', participants?.length || 0)

    // Combine data
    const result = allAttendance.map((attendance: any) => ({
      id: attendance.id,
      peserta_id: attendance.peserta_id,
      status_kehadiran: attendance.status_kehadiran,
      waktu_absen: attendance.waktu_absen,
      catatan: attendance.catatan,
      peserta: participants?.find((p: any) => p.id === attendance.peserta_id) || {
        id: attendance.peserta_id,
        nama: 'Data tidak tersedia',
        email: '',
        jabatan: '',
        instansi: ''
      }
    }))

    console.log('Final result count:', result.length)
    return NextResponse.json(result)

  } catch (error) {
    console.error('Direct API Error:', error)
    return NextResponse.json([])
  }
}