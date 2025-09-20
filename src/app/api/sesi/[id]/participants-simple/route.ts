import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sesiId = params.id
    const supabase = createServerClient()

    console.log('Simple participants query for session:', sesiId)

    // Get participant IDs first
    const { data: sesiPesertaData, error: sesiError } = await (supabase as any)
      .from('sesi_peserta')
      .select('peserta_id')
      .eq('sesi_id', sesiId)

    console.log('Session participants found:', sesiPesertaData?.length || 0)

    if (sesiError) {
      console.error('Session participants error:', sesiError)
      return NextResponse.json({ error: 'Failed to fetch session participants' }, { status: 500 })
    }

    if (!sesiPesertaData || sesiPesertaData.length === 0) {
      return NextResponse.json([])
    }

    // Get participant details in batches to avoid query limits
    const pesertaIds = sesiPesertaData.map((sp: any) => sp.peserta_id)
    const batchSize = 20
    let allPesertaData = []

    for (let i = 0; i < pesertaIds.length; i += batchSize) {
      const batch = pesertaIds.slice(i, i + batchSize)
      const { data: batchData, error: batchError } = await (supabase as any)
        .from('peserta')
        .select('id, nama, email, jabatan, instansi')
        .in('id', batch)

      if (batchError) {
        console.error(`Batch ${i} error:`, batchError)
        continue
      }

      if (batchData) {
        allPesertaData.push(...batchData)
      }
    }

    console.log('Total participant details found:', allPesertaData.length)
    return NextResponse.json(allPesertaData)

  } catch (error) {
    console.error('Simple participants API Error:', error)
    return NextResponse.json({ error: 'System error' }, { status: 500 })
  }
}