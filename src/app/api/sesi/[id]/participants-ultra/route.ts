import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sesiId = params.id
    const supabase = createServerClient()

    console.log('Ultra simple participants query for session:', sesiId)

    // Step 1: Get participant IDs
    const { data: sesiPesertaData } = await (supabase as any)
      .from('sesi_peserta')
      .select('peserta_id')
      .eq('sesi_id', sesiId)

    if (!sesiPesertaData || sesiPesertaData.length === 0) {
      console.log('No participants found for session')
      return NextResponse.json([])
    }

    console.log('Found participant IDs:', sesiPesertaData.length)

    // Step 2: Get each participant individually to avoid batch issues
    const participants = []
    for (const sp of sesiPesertaData) {
      try {
        const { data: pesertaData } = await (supabase as any)
          .from('peserta')
          .select('id, nama, email, jabatan, instansi')
          .eq('id', sp.peserta_id)
          .single()

        if (pesertaData) {
          participants.push(pesertaData)
        }
      } catch (error) {
        console.log(`Failed to fetch participant ${sp.peserta_id}:`, error)
        // Add placeholder data
        participants.push({
          id: sp.peserta_id,
          nama: 'Data tidak tersedia',
          email: '',
          jabatan: '',
          instansi: ''
        })
      }
    }

    console.log('Final participants count:', participants.length)
    return NextResponse.json(participants)

  } catch (error) {
    console.error('Ultra simple API Error:', error)
    return NextResponse.json([])
  }
}