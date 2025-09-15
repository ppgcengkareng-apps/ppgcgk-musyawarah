'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import AdminNavigation from '@/components/admin/admin-navigation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const pathname = usePathname()
  
  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session) {
        const { data: profile } = await supabase
          .from('peserta')
          .select('nama, role, email')
          .eq('id', session.user.id)
          .single()
        
        if (profile && ['super_admin', 'admin', 'sekretaris_ppg'].includes(profile.role)) {
          setUser(profile)
        }
      }
      setLoading(false)
    }
    
    getUser()
  }, [])
  
  // Show login page without navigation
  if (pathname === '/admin/login' || loading) {
    return children
  }
  
  // Show navigation if user is authenticated
  if (user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminNavigation user={user} />
        <main className="lg:pl-64 pt-16 lg:pt-0">
          <div className="p-0">
            {children}
          </div>
        </main>
      </div>
    )
  }
  
  // Show children without navigation if not authenticated
  return children
}