import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { BrandLockup } from './Logo'
import { Sidebar } from './Sidebar'
import { BottomTabBar } from './BottomTabBar'
import { useAuth } from '../context/AuthContext'
import { getMessageThreads } from '../lib/api'

export function AppShell() {
  const { user } = useAuth()
  const [unreadThreads, setUnreadThreads] = useState(0)

  useEffect(() => {
    if (user?.role !== 'lawyer') return
    let cancelled = false
    getMessageThreads()
      .then(({ threads }) => {
        if (!cancelled) setUnreadThreads(threads.filter((t) => t.unread).length)
      })
      .catch(() => {
        if (!cancelled) setUnreadThreads(0)
      })
    return () => {
      cancelled = true
    }
  }, [user?.role])

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-bg font-body text-ink">
      <header className="flex h-16 flex-none items-center gap-3.5 border-b border-line bg-surface px-4 md:px-6">
        <BrandLockup />
      </header>
      <div className="flex min-h-0 flex-1">
        <Sidebar unreadThreads={unreadThreads} />
        <main className="flex min-w-0 flex-1 flex-col">
          <Outlet />
        </main>
      </div>
      <BottomTabBar />
    </div>
  )
}
