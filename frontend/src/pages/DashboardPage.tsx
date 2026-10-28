import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CalendarCheck, MessageSquareText, PiggyBank } from 'lucide-react'
import { getApiErrorMessage, getUserDashboard } from '../lib/api'
import { ErrorState, LoadingState } from '../components/states'
import { useAuth } from '../context/AuthContext'
import type { UserDashboard } from '../types'

export default function DashboardPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [data, setData] = useState<UserDashboard | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  function load() {
    setLoading(true)
    setError(null)
    getUserDashboard()
      .then(setData)
      .catch((err) => setError(getApiErrorMessage(err)))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  // Demo behavior (template.html: userFirst = s.phone ? 'friend' : 'Guest') — the login flow never
  // collects a real name, so this is always "friend" for phone/OTP users and "Guest" for guest login,
  // not derived from user.name.
  const firstName = user?.phone ? 'friend' : 'Guest'

  if (loading) return <LoadingState label="Loading your dashboard…" />
  if (error || !data) return <ErrorState message={error ?? 'Could not load dashboard.'} onRetry={load} />

  return (
    <div className="flex-1 overflow-y-auto px-5 py-7 md:px-8">
      <h1 className="font-heading text-2xl font-extrabold md:text-[28px]">Namaste, {firstName}</h1>
      <div className="mt-1 text-sm text-muted">Your legal matters, all in one place</div>

      <div className="mt-5 grid max-w-[760px] grid-cols-1 gap-3.5 sm:grid-cols-3">
        <div className="rounded-[18px] border border-line bg-surface p-[18px] transition-shadow hover:shadow-soft">
          <div className="mb-2.5 flex size-9 items-center justify-center rounded-xl bg-soft text-primary">
            <MessageSquareText className="size-[18px]" />
          </div>
          <div className="font-heading text-[26px] font-extrabold">{data.questions_answered}</div>
          <div className="mt-0.5 text-xs text-muted">questions answered free</div>
        </div>
        <div className="rounded-[18px] border border-line bg-surface p-[18px] transition-shadow hover:shadow-soft">
          <div className="mb-2.5 flex size-9 items-center justify-center rounded-xl bg-soft text-primary">
            <CalendarCheck className="size-[18px]" />
          </div>
          <div className="font-heading text-[26px] font-extrabold">{data.consults_booked}</div>
          <div className="mt-0.5 text-xs text-muted">lawyer consults booked</div>
        </div>
        <div className="rounded-[18px] border border-line bg-surface p-[18px] transition-shadow hover:shadow-soft">
          <div className="mb-2.5 flex size-9 items-center justify-center rounded-xl bg-success-bg text-success-text">
            <PiggyBank className="size-[18px]" />
          </div>
          <div className="font-heading text-[26px] font-extrabold text-success-text">
            ₹{data.saved_amount.toLocaleString('en-IN')}
          </div>
          <div className="mt-0.5 text-xs text-muted">saved vs typical lawyer fees</div>
        </div>
      </div>

      <div className="mt-7 font-heading text-lg font-bold">Upcoming consultation</div>
      {data.upcoming ? (
        <div className="mt-3 flex max-w-[640px] items-center gap-4 rounded-[20px] border border-line bg-surface p-5">
          <div
            className="flex h-[52px] w-[52px] flex-none items-center justify-center rounded-full text-[17px] font-bold text-white"
            style={{ background: data.upcoming.lawyer.avatar_color }}
          >
            {data.upcoming.lawyer.initials}
          </div>
          <div className="flex-1">
            <div className="text-[15px] font-bold">{data.upcoming.lawyer.name}</div>
            <div className="mt-0.5 text-[13px] text-muted">
              {data.upcoming.day_label} · {data.upcoming.slot_label} · {data.upcoming.consult_type} · 30 min
            </div>
          </div>
          <button className="rounded-full bg-success-text px-5 py-2.5 text-[13px] font-bold text-white">
            Join call
          </button>
        </div>
      ) : (
        <div className="mt-3 flex max-w-[640px] items-center gap-4 rounded-[20px] bg-soft p-5">
          <div className="flex-1">
            <div className="text-sm font-bold">No consultations yet</div>
            <div className="mt-0.5 text-[13px] text-body2">
              Ask Neethi first — it's free. Book a lawyer only if you need one.
            </div>
          </div>
          <button
            onClick={() => navigate('/chat')}
            className="whitespace-nowrap rounded-full bg-primary px-5 py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-primary-hover"
          >
            Ask Neethi
          </button>
        </div>
      )}

      <div className="mt-7 font-heading text-lg font-bold">Recent questions</div>
      <div className="mt-3 flex max-w-[640px] flex-col gap-2">
        {data.recent_questions.map((rq, i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-2xl border border-line bg-surface px-[18px] py-3.5"
          >
            <div className="flex-1 text-sm font-medium">{rq.q}</div>
            <div className="whitespace-nowrap text-xs text-faint">{rq.when}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
