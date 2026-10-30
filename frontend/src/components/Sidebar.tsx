import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  CalendarCheck,
  Crown,
  LayoutDashboard,
  LogOut,
  type LucideIcon,
  MessageSquareText,
  MessagesSquare,
  Scale,
  UserRound,
} from 'lucide-react'
import { motion } from 'motion/react'
import { useAuth } from '../context/AuthContext'
import { BrandLockup } from './Logo'

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
      { label: 'Dashboard', path: '/portal', match: ['/portal', '/call'], icon: LayoutDashboard },
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
    { label: 'Chat with Nya-AI', path: '/chat', match: ['/chat'], icon: MessageSquareText },
    {
      label: 'Find a Lawyer',
      path: '/lawyers',
      match: ['/lawyers', '/plan', '/booking', '/pay', '/success'],
      icon: Scale,
    },
    { label: 'My Consultations', path: '/dashboard', match: ['/dashboard', '/bookings', '/call'], icon: CalendarCheck },
  ]
}

export function Sidebar({ unreadThreads }: { unreadThreads: number }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const navItems = useNavItems(unreadThreads)

  const isActive = (item: NavItem) =>
    item.match.some((m) => location.pathname === m || location.pathname.startsWith(m + '/'))

  return (
    <aside className="relative hidden w-[248px] flex-none flex-col overflow-hidden border-r border-line bg-surface/70 p-4 text-ink backdrop-blur md:flex">
      <div className="relative px-1.5 pb-6 pt-1.5">
        <BrandLockup />
      </div>
      <div className="relative px-3 pb-2 font-mono text-[10.5px] uppercase tracking-[0.14em] text-brass-dark">
        {user?.role === 'lawyer' ? 'Practice' : 'Workspace'}
      </div>
      <nav className="relative flex flex-col gap-1">
        {navItems.map((item) => {
          const active = isActive(item)
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-sm transition-colors ${
                active ? 'font-semibold text-ink' : 'font-medium text-body2 hover:bg-soft hover:text-ink'
              }`}
            >
              {active && (
                <motion.span
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-xl bg-primary-tint shadow-[inset_0_0_0_1px_rgba(30,107,92,0.18)]"
                  transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                >
                  <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-brass" />
                </motion.span>
              )}
              <item.icon
                className={`relative size-[18px] flex-none ${active ? 'text-primary' : 'text-faint'}`}
                strokeWidth={active ? 2.3 : 1.9}
              />
              <span className="relative">{item.label}</span>
            </button>
          )
        })}
      </nav>
      <div className="flex-1" />
      {user?.role === 'user' && (
        <div className="relative mb-4 overflow-hidden rounded-2xl border border-brass-glow/50 bg-gradient-to-br from-brass-soft to-surface p-4">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-brass-glow/40 blur-2xl"
          />
          <div className="relative flex items-center gap-2">
            <Crown className="size-4 text-brass" />
            <div className="font-heading text-[15px] font-bold">Nya-AI Plus</div>
          </div>
          <div className="relative mt-1.5 text-xs leading-relaxed text-muted">
            Unlimited AI chats + 1 free consult every month.
          </div>
          <div className="relative mt-3 text-sm font-bold text-brass-dark">₹299/month</div>
        </div>
      )}
      <nav aria-label="Information pages" className="relative mb-3 flex flex-wrap gap-x-3 gap-y-1 px-1 font-mono text-[10.5px] tracking-[0.1em] text-faint">
        <Link to="/help" className="hover:text-primary">HELP</Link>
        <Link to="/contact" className="hover:text-primary">CONTACT</Link>
        <Link to="/legal" className="hover:text-primary">LEGAL</Link>
        <Link to="/about" className="hover:text-primary">ABOUT</Link>
      </nav>
      <div className="relative flex items-center gap-3 rounded-xl border border-line bg-surface px-3 py-2.5">
        <div className="flex h-[34px] w-[34px] flex-none items-center justify-center rounded-full bg-gradient-to-br from-brass to-brass-dark text-[13px] font-bold text-white">
          {user?.initials ?? '?'}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[13px] font-semibold">{user?.name ?? ''}</div>
          <div className="text-[11px] capitalize text-muted">{user?.role === 'lawyer' ? 'Advocate' : 'Member'}</div>
        </div>
        <button
          onClick={logout}
          aria-label="Sign out"
          title="Sign out"
          className="rounded-lg p-1.5 text-faint transition-colors hover:bg-soft hover:text-ink"
        >
          <LogOut className="size-4" />
        </button>
      </div>
    </aside>
  )
}
