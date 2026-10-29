import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { createBooking, getApiErrorMessage, getLawyer } from '../lib/api'
import { ErrorState, LoadingState } from '../components/states'
import type { ConsultType, LawyerDetail } from '../types'

const SLOTS = ['10:00 AM', '11:30 AM', '2:00 PM', '4:30 PM', '6:00 PM', '7:30 PM']
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function buildDayLabels(): string[] {
  const now = new Date()
  const days: string[] = []
  for (let i = 0; i < 5; i++) {
    const d = new Date(now.getTime() + i * 86400000)
    days.push((i === 0 ? 'Today' : WEEKDAYS[d.getDay()]) + ' ' + d.getDate() + ' ' + MONTHS[d.getMonth()])
  }
  return days
}

export default function BookingPage() {
  const { lawyerId } = useParams()
  const navigate = useNavigate()
  const days = useMemo(buildDayLabels, [])

  const [lawyer, setLawyer] = useState<LawyerDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selDay, setSelDay] = useState(0)
  const [selSlot, setSelSlot] = useState<number | null>(null)
  const [consultType, setConsultType] = useState<ConsultType>('Video')
  const [booking, setBooking] = useState(false)
  const [bookError, setBookError] = useState<string | null>(null)

  function load() {
    if (!lawyerId) return
    setLoading(true)
    setError(null)
    getLawyer(lawyerId)
      .then(setLawyer)
      .catch((err) => setError(getApiErrorMessage(err)))
      .finally(() => setLoading(false))
  }

  useEffect(load, [lawyerId])

  async function proceedToPay() {
    if (selSlot === null || !lawyer) return
    setBooking(true)
    setBookError(null)
    try {
      const b = await createBooking({
        lawyer_id: lawyer.id,
        day_label: days[selDay],
        slot_label: SLOTS[selSlot],
        consult_type: consultType,
      })
      navigate(`/pay/${b.id}`)
    } catch (err) {
      setBookError(getApiErrorMessage(err))
    } finally {
      setBooking(false)
    }
  }

  if (loading) return <LoadingState label="Loading lawyer…" />
  if (error || !lawyer) return <ErrorState message={error ?? 'Lawyer not found.'} onRetry={load} />

  const canPay = selSlot !== null

  return (
    <div className="flex-1 overflow-y-auto px-5 py-7 md:px-8">
      <button
        onClick={() => navigate('/lawyers')}
        className="border-none bg-transparent p-0 text-[13px] font-semibold text-primary"
      >
        ← Back to lawyers
      </button>

      <div className="mt-4 flex max-w-[980px] flex-col gap-6 lg:flex-row lg:items-start">
        <div className="flex-[1.4]">
          <div className="flex items-center gap-3.5 rounded-[20px] border border-line bg-surface p-5">
            <div
              className="flex h-[52px] w-[52px] flex-none items-center justify-center rounded-full text-[17px] font-bold text-white"
              style={{ background: lawyer.avatar_color }}
            >
              {lawyer.initials}
            </div>
            <div>
              <div className="text-[17px] font-bold">{lawyer.name}</div>
              <div className="text-[13px] text-muted">
                {lawyer.spec} · ★ {lawyer.rating}
              </div>
            </div>
          </div>

          <div className="mt-6 font-heading text-lg font-bold">Pick a day</div>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {days.map((d, i) => (
              <button
                key={d}
                onClick={() => setSelDay(i)}
                className={`rounded-2xl border px-4 py-2.5 text-[13px] font-semibold ${
                  selDay === i ? 'border-primary bg-primary text-primary-foreground' : 'border-line bg-surface text-body3'
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          <div className="mt-6 font-heading text-lg font-bold">Pick a time</div>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {SLOTS.map((s, i) => (
              <button
                key={s}
                onClick={() => setSelSlot(i)}
                className={`rounded-2xl border px-4 py-2.5 text-[13px] font-semibold ${
                  selSlot === i ? 'border-primary bg-primary text-primary-foreground' : 'border-line bg-surface text-body3'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <div className="mt-6 font-heading text-lg font-bold">Consultation type</div>
          <div className="mt-2.5 flex gap-2">
            {(['Video', 'Phone'] as ConsultType[]).map((t) => (
              <button
                key={t}
                onClick={() => setConsultType(t)}
                className={`rounded-2xl border px-5 py-2.5 text-[13px] font-semibold ${
                  consultType === t ? 'border-primary bg-primary text-primary-foreground' : 'border-line bg-surface text-body3'
                }`}
              >
                {t} call
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 rounded-[20px] border border-line bg-surface p-[22px]">
          <div className="font-heading text-lg font-bold">Summary</div>
          <div className="mt-4 flex justify-between text-sm">
            <span className="text-muted">Lawyer</span>
            <span className="font-semibold">{lawyer.name}</span>
          </div>
          <div className="mt-2.5 flex justify-between text-sm">
            <span className="text-muted">When</span>
            <span className="font-semibold">
              {canPay ? `${days[selDay]} · ${SLOTS[selSlot!]}` : 'Pick a day & time'}
            </span>
          </div>
          <div className="mt-2.5 flex justify-between text-sm">
            <span className="text-muted">Type</span>
            <span className="font-semibold">{consultType} · 30 min</span>
          </div>
          <div className="my-4 h-px bg-line" />
          <div className="flex justify-between text-sm">
            <span className="text-muted">Consultation fee</span>
            <span className="font-semibold">₹500</span>
          </div>
          <div className="mt-2 flex justify-between text-[13px] text-muted">
            <span>Lawyer receives (70%)</span>
            <span>₹350</span>
          </div>
          <div className="mt-2 flex justify-between text-[13px] text-muted">
            <span>Platform &amp; GST</span>
            <span>included</span>
          </div>
          <div className="my-4 h-px bg-line" />
          <div className="flex justify-between text-[17px] font-extrabold">
            <span>Total</span>
            <span>₹500</span>
          </div>
          <button
            onClick={proceedToPay}
            disabled={!canPay || booking}
            className={`mt-[18px] w-full rounded-full py-3.5 text-[15px] font-bold text-primary-foreground transition-colors ${
              canPay ? 'cursor-pointer bg-primary hover:bg-primary-hover' : 'cursor-not-allowed bg-faint'
            }`}
          >
            {booking ? 'Booking…' : canPay ? 'Proceed to pay ₹500' : 'Pick a time slot first'}
          </button>
          {bookError && <div className="mt-2 text-[12px] font-medium text-warn-text">{bookError}</div>}
          <div className="mt-2.5 text-center text-[11px] text-faint">
            Free cancellation up to 2 hours before
          </div>
        </div>
      </div>
    </div>
  )
}
