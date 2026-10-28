import { useLocation, useNavigate } from 'react-router-dom'
import {
  CalendarCheck,
  LayoutDashboard,
  type LucideIcon,
  MessageSquareText,
  MessagesSquare,
  Scale,
  UserRound,
} from 'lucide-react'
import { motion } from 'motion/react'
import { useAuth } from '../context/AuthContext'

interface NavItem {
  label: string
  path: string
  match: string[]
  icon: LucideIcon
}

export function useNavItems(unreadThreads: number): NavItem[] {
  const { user } = useAuth()
  if (user?.role === 'lawyer') {
    return [
      { label: 'Dashboard', path: '/portal', match: ['/portal'], icon: LayoutDashboard },
      {
        label: unreadThreads > 0 ? `Client Messages (${unreadThreads})` : 'Client Messages',
        path: '/messages',
        match: ['/messages'],
        icon: MessagesSquare,
      },
      { label: 'My Profile', path: '/profile', match: ['/profile'], icon: UserRound },
    ]
  }
  return [
    { label: 'Chat with Neethi', path: '/chat', match: ['/chat'], icon: MessageSquareText },
    {
      label: 'Find a Lawyer',
      path: '/lawyers',
      match: ['/lawyers', '/booking', '/pay', '/success'],
      icon: Scale,
    },
    { label: 'My Consultations', path: '/dashboard', match: ['/dashboard'], icon: CalendarCheck },
  ]
}

export function Sidebar({ unreadThreads }: { unreadThreads: number }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const navItems = useNavItems(unreadThreads)

  const isActive = (item: NavItem) => item.match.some((m) => location.pathname.startsWith(m))

  return (
    <aside className="hidden w-[236px] flex-none flex-col border-r border-line bg-surface p-3 md:flex">
      <nav className="flex flex-col gap-1">
        {navItems.map((item) => {
          const active = isActive(item)
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`relative flex items-center gap-2.5 rounded-2xl px-3.5 py-3 text-left text-sm transition-colors ${
                active ? 'font-bold text-ink' : 'font-medium text-body2 hover:bg-bg'
              }`}
            >
              {active && (
                <motion.span
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-2xl bg-soft"
                  transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                />
              )}
              <item.icon
                className={`relative size-[18px] flex-none ${active ? 'text-primary' : 'text-faint'}`}
                strokeWidth={active ? 2.4 : 2}
              />
              <span className="relative">{item.label}</span>
            </button>
          )
        })}
      </nav>
      <div className="flex-1" />
      {user?.role === 'user' && (
        <div className="mb-3 rounded-[18px] bg-soft p-4">
          <div className="font-heading text-[15px] font-bold text-ink">Neethi Plus</div>
          <div className="mt-1 text-xs leading-relaxed text-body2">
            Unlimited AI chats + 1 free consult every month.
          </div>
          <div className="mt-2.5 text-sm font-bold text-primary">₹299/month</div>
        </div>
      )}
      <div className="flex items-center gap-2.5 px-2 py-2.5">
        <div className="flex h-[34px] w-[34px] flex-none items-center justify-center rounded-full bg-success-text text-[13px] font-bold text-white">
          {user?.initials ?? '?'}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[13px] font-semibold text-ink">{user?.name ?? ''}</div>
          <button
            onClick={logout}
            className="border-none bg-transparent p-0 text-[11px] text-muted hover:underline"
          >
            Sign out
          </button>
        </div>
      </div>
    </aside>
  )
}
