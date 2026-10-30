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

interface Tab {
  label: string
  path: string
  match: string[]
  icon: LucideIcon
}

// Lawyer-role mobile tabs are a documented default (no source in the demo covers mobile+lawyer) —
// see docs/DECISIONS.md.
const USER_TABS: Tab[] = [
  { label: 'Chat', path: '/chat', match: ['/chat'], icon: MessageSquareText },
  {
    label: 'Lawyers',
    path: '/lawyers',
    match: ['/lawyers', '/plan', '/booking', '/pay', '/success'],
    icon: Scale,
  },
  { label: 'Bookings', path: '/bookings', match: ['/bookings', '/call'], icon: CalendarCheck },
  { label: 'Profile', path: '/account', match: ['/account'], icon: UserRound },
]

const LAWYER_TABS: Tab[] = [
  { label: 'Dashboard', path: '/portal', match: ['/portal', '/call'], icon: LayoutDashboard },
  { label: 'Messages', path: '/messages', match: ['/messages'], icon: MessagesSquare },
  { label: 'Profile', path: '/profile', match: ['/profile'], icon: UserRound },
]

export function BottomTabBar() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const tabs = user?.role === 'lawyer' ? LAWYER_TABS : USER_TABS

  return (
    <nav className="flex-none px-3 pb-3 pt-1.5 md:hidden">
      <div className="flex rounded-2xl border border-line bg-surface/95 p-1.5 shadow-lift backdrop-blur">
        {tabs.map((tab) => {
          const active = tab.match.some((m) => location.pathname === m || location.pathname.startsWith(m + '/'))
          return (
            <button
              key={tab.label}
              onClick={() => navigate(tab.path)}
              className="relative flex flex-1 flex-col items-center gap-0.5 rounded-xl border-none bg-transparent py-1.5"
            >
              {active && (
                <motion.span
                  layoutId="tab-active"
                  className="absolute inset-0 rounded-xl bg-primary-tint"
                  transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                />
              )}
              <tab.icon
                className={`relative size-5 ${active ? 'text-primary' : 'text-faint'}`}
                strokeWidth={active ? 2.4 : 2}
              />
              <span className={`relative text-[11px] ${active ? 'font-bold text-ink' : 'font-medium text-faint'}`}>
                {tab.label}
              </span>
              {active && <span className="absolute right-[calc(50%-16px)] top-1 size-1.5 rounded-full bg-brass" />}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
