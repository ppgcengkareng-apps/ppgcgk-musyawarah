'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import AdminNavigation from '@/components/admin/admin-navigation'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const pathname = usePathname()
  
  useEffect(() => {
    // Check localStorage for user data
    const userData = localStorage.getItem('admin_user')
    if (userData) {
      setUser(JSON.parse(userData))
    }
    setLoading(false)
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