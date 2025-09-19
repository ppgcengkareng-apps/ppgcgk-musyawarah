'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MapPin, Users, Calendar, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

interface Desa {
  id: string
  nama_desa: string
  kelompok: string[]
}

export default function LaporanKBMDesaPage() {
  const [user, setUser] = useState<any>(null)
  const [desaList, setDesaList] = useState<Desa[]>([])
  const [selectedPeriode, setSelectedPeriode] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const userData = localStorage.getItem('admin_user')
    if (userData) {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)
      fetchDesaData(parsedUser.role)
    }
    
    // Set default periode ke bulan ini
    const now = new Date()
    const currentPeriode = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    setSelectedPeriode(currentPeriode)
  }, [])

  const fetchDesaData = async (userRole: string) => {
    try {
      const response = await fetch(`/api/kbm-desa/master?role=${userRole}`)
      const result = await response.json()
      
      if (result.success) {
        setDesaList(result.data)
      } else {
        toast.error('Gagal mengambil data desa')
      }
    } catch (error) {
      toast.error('Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  const generatePeriodeOptions = () => {
    const options = []
    const currentYear = new Date().getFullYear()
    
    for (let year = 2025; year <= 2100; year++) {
      for (let month = 1; month <= 12; month++) {
        const value = `${year}-${String(month).padStart(2, '0')}`
        const label = `${getMonthName(month)} ${year}`
        options.push({ value, label })
      }
    }
    
    return options
  }

  const getMonthName = (month: number) => {
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ]
    return months[month - 1]
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Laporan KBM Desa</h1>
        <p className="text-gray-600">Kelola laporan Kegiatan Belajar Mengajar per desa dan kelompok</p>
      </div>

      {/* Periode Selector */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Pilih Periode
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Select value={selectedPeriode} onValueChange={setSelectedPeriode}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Pilih periode" />
              </SelectTrigger>
              <SelectContent>
                {generatePeriodeOptions().map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="text-sm text-gray-500">
              Periode yang dipilih: <span className="font-medium">{selectedPeriode ? getMonthName(parseInt(selectedPeriode.split('-')[1])) + ' ' + selectedPeriode.split('-')[0] : 'Belum dipilih'}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Desa Cards */}
      {selectedPeriode && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {desaList.map((desa) => (
            <Card key={desa.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  Desa {desa.nama_desa}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="w-4 h-4" />
                    {desa.kelompok.length} Kelompok
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    <div className="font-medium mb-1">Kelompok:</div>
                    <div className="space-y-1">
                      {desa.kelompok.slice(0, 3).map((kelompok, idx) => (
                        <div key={idx} className="truncate">• {kelompok}</div>
                      ))}
                      {desa.kelompok.length > 3 && (
                        <div className="text-blue-600">+{desa.kelompok.length - 3} lainnya</div>
                      )}
                    </div>
                  </div>

                  <Link href={`/admin/kbm-desa/${desa.id}?periode=${selectedPeriode}`}>
                    <Button className="w-full mt-4" size="sm">
                      Kelola Laporan
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {desaList.length === 0 && !loading && (
        <Card>
          <CardContent className="text-center py-12">
            <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak Ada Akses Desa</h3>
            <p className="text-gray-600">Anda tidak memiliki akses ke desa manapun. Hubungi administrator.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}