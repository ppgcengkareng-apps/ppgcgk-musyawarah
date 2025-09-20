import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sesiId = params.id
    const supabase = createServerClient()

    console.log('Raw individual query for session:', sesiId)

    // Get attendance records one by one to avoid all limitations
    const attendanceList = []
    
    // First get all attendance IDs
    const { data: attendanceIds } = await (supabase as any)
      .from('absensi')
      .select('id, peserta_id, status_kehadiran, waktu_absen, catatan')
      .eq('sesi_id', sesiId)

    console.log('Found attendance records:', attendanceIds?.length || 0)

    if (attendanceIds && attendanceIds.length > 0) {
      for (const attendance of attendanceIds) {
        // Get participant data for each attendance
        const { data: participant } = await (supabase as any)
          .from('peserta')
          .select('id, nama, email, jabatan, instansi')
          .eq('id', attendance.peserta_id)
          .single()

        attendanceList.push({
          id: attendance.id,
          peserta_id: attendance.peserta_id,
          status_kehadiran: attendance.status_kehadiran,
          waktu_absen: attendance.waktu_absen,
          catatan: attendance.catatan,
          peserta: participant || {
            id: attendance.peserta_id,
            nama: 'Data tidak tersedia',
            email: '',
            jabatan: '',
            instansi: ''
          }
        })
      }
    }

    console.log('Final attendance list:', attendanceList.length)
    return NextResponse.json(attendanceList)

  } catch (error) {
    console.error('Raw API Error:', error)
    return NextResponse.json([])
  }
}