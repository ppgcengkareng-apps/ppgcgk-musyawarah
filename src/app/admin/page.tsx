import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, Calendar, FileText, CheckSquare, TrendingUp, Clock } from 'lucide-react'
import Link from 'next/link'

export default function AdminDashboard() {
  const stats = {
    totalParticipants: 15,
    totalSessions: 3,
    activeSessions: 1,
    pendingNotes: 2,
    recentSessions: [],
    recentAttendance: []
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Admin</h1>
        <p className="text-gray-600 mt-2">
          Selamat datang di sistem manajemen musyawarah PPG
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Peserta</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalParticipants}</div>
            <p className="text-xs text-muted-foreground">
              Peserta aktif terdaftar
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sesi</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSessions}</div>
            <p className="text-xs text-muted-foreground">
              Sesi musyawarah dibuat
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sesi Aktif</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeSessions}</div>
            <p className="text-xs text-muted-foreground">
              Sesi sedang berlangsung
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Notulensi Pending</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingNotes}</div>
            <p className="text-xs text-muted-foreground">
              Menunggu persetujuan
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Aksi Cepat</CardTitle>
            <CardDescription>
              Tindakan yang sering dilakukan
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/admin/sesi/buat">
              <Button className="w-full justify-start">
                <Calendar className="w-4 h-4 mr-2" />
                Buat Sesi Baru
              </Button>
            </Link>
            <Link href="/admin/peserta/tambah">
              <Button variant="outline" className="w-full justify-start">
                <Users className="w-4 h-4 mr-2" />
                Tambah Peserta
              </Button>
            </Link>
            <Link href="/admin/notulensi/approval">
              <Button variant="outline" className="w-full justify-start">
                <FileText className="w-4 h-4 mr-2" />
                Review Notulensi
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sesi Terbaru</CardTitle>
            <CardDescription>
              5 sesi musyawarah terbaru
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    Pembukaan PPG Angkatan 2025
                  </p>
                  <p className="text-xs text-gray-500">
                    20/01/2025 • 08:00
                  </p>
                </div>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Aktif
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    Workshop Kurikulum Merdeka
                  </p>
                  <p className="text-xs text-gray-500">
                    20/01/2025 • 13:00
                  </p>
                </div>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Terjadwal
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Absensi Terbaru</CardTitle>
            <CardDescription>
              5 absensi terbaru
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    Prof. Andi Rahman
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    Pembukaan PPG Angkatan 2025
                  </p>
                </div>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Hadir
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    Dr. Indra Gunawan
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    Pembukaan PPG Angkatan 2025
                  </p>
                </div>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  Terlambat
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle>Status Sistem</CardTitle>
          <CardDescription>
            Informasi status sistem musyawarah PPG
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div>
                <p className="text-sm font-medium">Database</p>
                <p className="text-xs text-gray-500">Terhubung</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div>
                <p className="text-sm font-medium">Real-time</p>
                <p className="text-xs text-gray-500">Aktif</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div>
                <p className="text-sm font-medium">Notifikasi</p>
                <p className="text-xs text-gray-500">Berjalan</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}