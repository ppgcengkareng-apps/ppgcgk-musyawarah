import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sesiId = params.id
    const supabase = createServerClient()

    console.log('Ultra simple attendance query for session:', sesiId)

    // Step 1: Get attendance IDs first
    const { data: absensiIds } = await (supabase as any)
      .from('absensi')
      .select('id')
      .eq('sesi_id', sesiId)

    console.log('Found attendance IDs:', absensiIds?.length || 0)

    if (!absensiIds || absensiIds.length === 0) {
      return NextResponse.json([])
    }

    // Step 2: Get each attendance record individually
    const attendanceRecords = []
    for (const record of absensiIds) {
      try {
        const { data: absensiData } = await (supabase as any)
          .from('absensi')
          .select('id, peserta_id, status_kehadiran, waktu_absen, catatan')
          .eq('id', record.id)
          .single()

        if (absensiData) {
          // Get participant data
          const { data: pesertaData } = await (supabase as any)
            .from('peserta')
            .select('id, nama, email, jabatan, instansi')
            .eq('id', absensiData.peserta_id)
            .single()

          attendanceRecords.push({
            ...absensiData,
            peserta: pesertaData || {
              id: absensiData.peserta_id,
              nama: 'Unknown',
              email: '',
              jabatan: '',
              instansi: ''
            }
          })
        }
      } catch (error) {
        console.log(`Failed to fetch attendance ${record.id}:`, error)
      }
    }

    console.log('Final attendance records:', attendanceRecords.length)
    return NextResponse.json(attendanceRecords)

  } catch (error) {
    console.error('Ultra attendance API Error:', error)
    return NextResponse.json([])
  }
}