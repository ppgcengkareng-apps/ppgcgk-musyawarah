import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import AdminNavigation from '@/components/admin/admin-navigation'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createServerClient()
  
  // Check if user is authenticated and has admin role
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    redirect('/admin/login')
  }

  // Get user role from peserta table
  const { data: user } = await supabase
    .from('peserta')
    .select('role, nama, email')
    .eq('id', session.user.id)
    .single()

  if (!user || !['admin', 'super_admin', 'sekretaris_ppg'].includes(user.role)) {
    redirect('/admin/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavigation user={user} />
      <main className="lg:pl-64">
        {children}
      </main>
    </div>
  )
}