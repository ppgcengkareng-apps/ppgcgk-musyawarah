'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, User, Mail, Phone, Briefcase, Building } from 'lucide-react'
import Link from 'next/link'

export default function TambahPeserta() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    nama: '',
    email: '',
    nomor_hp: '',
    jabatan: '',
    instansi: '',
    role: 'peserta'
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/peserta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        alert('Peserta berhasil ditambahkan!')
        router.push('/admin/peserta')
      } else {
        const data = await response.json()
        alert(data.error || 'Gagal menambah peserta')
      }
    } catch (error) {
      alert('Terjadi kesalahan sistem')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <Link href="/admin/peserta" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Kembali ke Daftar Peserta
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Tambah Peserta Baru</h1>
        <p className="text-gray-600 mt-2">
          Tambahkan peserta baru ke sistem musyawarah PPG
        </p>
      </div>

      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Informasi Peserta</CardTitle>
            <CardDescription>
              Isi data lengkap peserta yang akan ditambahkan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="w-4 h-4 inline mr-1" />
                    Nama Lengkap *
                  </label>
                  <Input
                    name="nama"
                    value={formData.nama}
                    onChange={handleChange}
                    placeholder="Contoh: Dr. Ahmad Wijaya, M.Pd"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="w-4 h-4 inline mr-1" />
                    Email
                  </label>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="ahmad.wijaya@sman1jakarta.sch.id"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="w-4 h-4 inline mr-1" />
                    Nomor HP
                  </label>
                  <Input
                    name="nomor_hp"
                    value={formData.nomor_hp}
                    onChange={handleChange}
                    placeholder="081234567890"
                  />
                </div>
              </div>

              {/* Professional Info */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Briefcase className="w-4 h-4 inline mr-1" />
                    Dapuan
                  </label>
                  <Input
                    name="jabatan"
                    value={formData.jabatan}
                    onChange={handleChange}
                    placeholder="Contoh: Kepala Sekolah, Guru Senior, Wakil Kepala"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Building className="w-4 h-4 inline mr-1" />
                    Bidang
                  </label>
                  <Input
                    name="instansi"
                    value={formData.instansi}
                    onChange={handleChange}
                    placeholder="Contoh: SMA Negeri 1 Jakarta"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role/Peran *
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="peserta">Peserta</option>
                    <option value="sekretaris_ppg">Sekretaris PPG</option>
                    <option value="admin">Admin</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </div>
              </div>

              {/* Info */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-blue-800 mb-2">Informasi Login</h4>
                <p className="text-sm text-blue-700">
                  Password default untuk peserta baru adalah: <strong>password123</strong>
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Peserta dapat login menggunakan email dan password default ini.
                </p>
              </div>

              {/* Submit */}
              <div className="flex space-x-4 pt-4">
                <Button type="submit" disabled={isLoading} className="flex-1">
                  {isLoading ? 'Menambahkan...' : 'Tambah Peserta'}
                </Button>
                <Link href="/admin/peserta" className="flex-1">
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