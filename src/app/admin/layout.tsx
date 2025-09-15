import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import AdminNavigation from '@/components/admin/admin-navigation'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createServerClient()
  
  // Check authentication
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    redirect('/')
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('peserta')
    .select('nama, role, email')
    .eq('id', session.user.id)
    .single()

  if (!profile || !['super_admin', 'admin', 'sekretaris_ppg'].includes(profile.role)) {
    redirect('/')
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavigation user={profile} />
      <main className="lg:pl-64 pt-16 lg:pt-0">
        <div className="p-0">
          {children}
        </div>
      </main>
    </div>
  )
}