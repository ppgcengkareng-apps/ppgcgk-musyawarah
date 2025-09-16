'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Calendar, Clock, MapPin, Users } from 'lucide-react'
import Link from 'next/link'

export default function EditSession() {
  const router = useRouter()
  const params = useParams()
  const sessionId = params.id as string
  
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [sessionData, setSessionData] = useState<any>(null)
  const [formData, setFormData] = useState({
    nama_sesi: '',
    deskripsi: '',
    tanggal: '',
    waktu_mulai: '',
    waktu_selesai: '',
    lokasi: '',
    tipe: 'offline',
    maksimal_peserta: 100
  })

  useEffect(() => {
    if (sessionId) {
      fetchSession()
    }
  }, [sessionId])

  useEffect(() => {
    if (sessionData) {
      console.log('Setting form data from sessionData:', sessionData)
      console.log('Deskripsi value:', sessionData.deskripsi)
      console.log('Deskripsi type:', typeof sessionData.deskripsi)
      console.log('Deskripsi length:', sessionData.deskripsi?.length)
      
      setFormData({
        nama_sesi: sessionData.nama_sesi || '',
        deskripsi: sessionData.deskripsi || '',
        tanggal: sessionData.tanggal || '',
        waktu_mulai: sessionData.waktu_mulai || '',
        waktu_selesai: sessionData.waktu_selesai || '',
        lokasi: sessionData.lokasi || '',
        tipe: sessionData.tipe || 'offline',
        maksimal_peserta: sessionData.maksimal_peserta || 100
      })
    }
  }, [sessionData])

  const fetchSession = async () => {
    try {
      const response = await fetch(`/api/sesi/${sessionId}`)
      if (response.ok) {
        const data = await response.json()
        console.log('Session data received:', data) // Debug log
        setSessionData(data)
      } else {
        console.error('Failed to fetch session:', response.status)
      }
    } catch (error) {
      console.error('Error fetching session:', error)
    } finally {
      setIsLoadingData(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch(`/api/sesi/${sessionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        alert('Sesi berhasil diperbarui!')
        router.push('/admin/sesi')
      } else {
        const data = await response.json()
        alert(data.error || 'Gagal memperbarui sesi')
      }
    } catch (error) {
      alert('Terjadi kesalahan sistem')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  if (isLoadingData) {
    return (
      <div className="p-6">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data sesi...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <Link href="/admin/sesi" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Kembali ke Daftar Sesi
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Edit Sesi</h1>
        <p className="text-gray-600 mt-2">
          Perbarui informasi sesi musyawarah PPG
        </p>
      </div>

      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Informasi Sesi</CardTitle>
            <CardDescription>
              Perbarui detail sesi musyawarah
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Sesi *
                  </label>
                  <Input
                    name="nama_sesi"
                    value={formData.nama_sesi}
                    onChange={handleChange}
                    placeholder="Contoh: Musyawarah PPG Daerah, Musy KBM Desa, dll"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deskripsi
                  </label>
                  <textarea
                    name="deskripsi"
                    value={formData.deskripsi}
                    onChange={handleChange}
                    placeholder="Deskripsi singkat tentang sesi ini..."
                    className="w-full p-3 border border-gray-300 rounded-md resize-none"
                    rows={3}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Tanggal *
                  </label>
                  <Input
                    type="date"
                    name="tanggal"
                    value={formData.tanggal}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Waktu Mulai *
                  </label>
                  <Input
                    type="time"
                    name="waktu_mulai"
                    value={formData.waktu_mulai}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Waktu Selesai *
                  </label>
                  <Input
                    type="time"
                    name="waktu_selesai"
                    value={formData.waktu_selesai}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    Lokasi
                  </label>
                  <Input
                    name="lokasi"
                    value={formData.lokasi}
                    onChange={handleChange}
                    placeholder="Contoh: Ruang GSG Daerah, GSG Desa, dll"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipe Sesi
                  </label>
                  <select
                    name="tipe"
                    value={formData.tipe}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-md"
                  >
                    <option value="offline">Offline</option>
                    <option value="online">Online</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Users className="w-4 h-4 inline mr-1" />
                  Maksimal Peserta
                </label>
                <Input
                  type="number"
                  name="maksimal_peserta"
                  value={formData.maksimal_peserta}
                  onChange={handleChange}
                  min="1"
                  max="100"
                />
              </div>

              <div className="flex space-x-4 pt-4">
                <Button type="submit" disabled={isLoading} className="flex-1">
                  {isLoading ? 'Memperbarui...' : 'Perbarui Sesi'}
                </Button>
                <Link href="/admin/sesi" className="flex-1">
                  <Button type="button" variant="outline" className="w-full">
                    Batal
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}