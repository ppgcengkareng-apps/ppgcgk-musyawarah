import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sesiId = params.id
    const supabase = createServerClient()

    console.log('=== ABSENSI API DEBUG V2 ===')
    console.log('Fetching absensi for sesi:', sesiId)
    console.log('Timestamp:', new Date().toISOString())
    console.log('Force cache clear:', Math.random())
    
    // Test connection first
    const { data: testData, error: testError } = await supabase
      .from('absensi')
      .select('count')
      .eq('sesi_id', sesiId)
    
    console.log('Connection test result:', { testData, testError })
    
    // Get attendance data with explicit UUID casting
    const { data: absensiData, error: absensiError } = await supabase
      .from('absensi')
      .select('id, peserta_id, status_kehadiran, waktu_absen, catatan')
      .eq('sesi_id', sesiId)
      .order('waktu_absen', { ascending: true })
    
    // Force check for Arestu specifically
    const { data: arestuCheck } = await supabase
      .from('absensi')
      .select('*')
      .eq('peserta_id', '6d07b1f7-30b3-4d63-b710-42701c809b9a')
      .eq('sesi_id', sesiId)
    
    console.log('Arestu specific check:', arestuCheck)
    
    console.log('Raw absensi query result:')
    console.log('- Count:', absensiData?.length || 0)
    console.log('- Error:', absensiError)
    console.log('- Data:', JSON.stringify(absensiData, null, 2))
    
    if (absensiError) {
      console.error('Absensi query error:', absensiError)
      return NextResponse.json(
        { error: 'Gagal mengambil data kehadiran', details: absensiError },
        { status: 500 }
      )
    }

    // Get peserta data for each attendance record
    const absensiWithPeserta: any[] = []
    if (absensiData && absensiData.length > 0) {
      const pesertaIds = absensiData.map((a: any) => (a as any).peserta_id)
      console.log('Fetching peserta for IDs:', pesertaIds)
      
      const { data: pesertaData, error: pesertaError } = await supabase
        .from('peserta')
        .select('id, nama, email, jabatan, instansi')
        .in('id', pesertaIds)
      
      console.log('Peserta query result:')
      console.log('- Count:', pesertaData?.length || 0)
      console.log('- Error:', pesertaError)
      
      // Combine absensi with peserta data
      for (const absen of absensiData) {
        const peserta = pesertaData?.find((p: any) => p.id === (absen as any).peserta_id)
        absensiWithPeserta.push({
          ...(absen as any),
          peserta: peserta || null
        })
      }
    }

    console.log('Final result count:', absensiWithPeserta.length)
    console.log('=== END ABSENSI API DEBUG V2 ===')

    // Set cache headers to prevent caching
    const response = NextResponse.json(absensiWithPeserta)
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    return response

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan sistem', details: error },
      { status: 500 }
    )
  }
}