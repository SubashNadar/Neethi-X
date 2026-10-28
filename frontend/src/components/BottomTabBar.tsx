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
import { useAuth } from '../context/AuthContext'

interface Tab {
  label: string
  path: string
  match: string[]
  icon: LucideIcon
}

// Lawyer-role mobile tabs are a documented default (no source in the demo covers mobile+lawyer) —
// see .claude/NEETHI_OPEN_QUESTIONS.md.
const USER_TABS: Tab[] = [
  { label: 'Chat', path: '/chat', match: ['/chat'], icon: MessageSquareText },
  {
    label: 'Lawyers',
    path: '/lawyers',
    match: ['/lawyers', '/booking', '/pay', '/success'],
    icon: Scale,
  },
  { label: 'Bookings', path: '/bookings', match: ['/bookings'], icon: CalendarCheck },
  { label: 'Profile', path: '/account', match: ['/account'], icon: UserRound },
]

const LAWYER_TABS: Tab[] = [
  { label: 'Dashboard', path: '/portal', match: ['/portal'], icon: LayoutDashboard },
  { label: 'Messages', path: '/messages', match: ['/messages'], icon: MessagesSquare },
  { label: 'Profile', path: '/profile', match: ['/profile'], icon: UserRound },
]

export function BottomTabBar() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const tabs = user?.role === 'lawyer' ? LAWYER_TABS : USER_TABS

  return (
    <nav className="flex flex-none border-t border-line bg-surface px-1.5 pb-3.5 pt-2 md:hidden">
      {tabs.map((tab) => {
        const active = tab.match.some((m) => location.pathname.startsWith(m))
        return (
          <button
            key={tab.label}
            onClick={() => navigate(tab.path)}
            className="flex flex-1 flex-col items-center gap-1 border-none bg-transparent py-1.5"
          >
            <span
              className={`h-1 w-[26px] rounded-full ${active ? 'bg-primary' : 'bg-transparent'}`}
            />
            <tab.icon
              className={`size-5 ${active ? 'text-primary' : 'text-faint'}`}
              strokeWidth={active ? 2.4 : 2}
            />
            <span className={`text-[11px] ${active ? 'font-bold text-ink' : 'font-medium text-faint'}`}>
              {tab.label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
