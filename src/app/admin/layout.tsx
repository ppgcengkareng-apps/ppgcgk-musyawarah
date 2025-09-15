import AdminNavigation from '@/components/admin/admin-navigation'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = { nama: 'Super Admin', role: 'super_admin', email: 'suppcon' }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavigation user={user} />
      <main className="lg:pl-64">
        {children}
      </main>
    </div>
  )
}