import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getApiErrorMessage, getBooking } from '../lib/api'
import { ErrorState, LoadingState } from '../components/states'
import type { Booking } from '../types'

export default function SuccessPage() {
  const { bookingId } = useParams()
  const navigate = useNavigate()
  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  function load() {
    if (!bookingId) return
    setLoading(true)
    setError(null)
    getBooking(bookingId)
      .then(setBooking)
      .catch((err) => setError(getApiErrorMessage(err)))
      .finally(() => setLoading(false))
  }

  useEffect(load, [bookingId])

  if (loading) return <LoadingState label="Confirming booking…" />
  if (error || !booking) return <ErrorState message={error ?? 'Booking not found.'} onRetry={load} />

  return (
    <div className="flex flex-1 items-center justify-center overflow-y-auto px-6 py-7">
      <div className="w-full max-w-[480px] text-center">
        <div className="mx-auto flex h-[76px] w-[76px] items-center justify-center rounded-full bg-success-text text-4xl text-white">
          ✓
        </div>
        <div className="mt-[18px] font-heading text-[28px] font-extrabold md:text-[30px]">
          Booking confirmed!
        </div>
        <div className="mt-1.5 text-sm text-muted">
          Payment of ₹{booking.fee} received · Booking ID {booking.ref}
        </div>
        <div className="mt-5 rounded-[20px] border border-line bg-surface p-5 text-left">
          <div className="flex justify-between text-sm">
            <span className="text-muted">Lawyer</span>
            <span className="font-semibold">{booking.lawyer.name}</span>
          </div>
          <div className="mt-2.5 flex justify-between text-sm">
            <span className="text-muted">When</span>
            <span className="font-semibold">
              {booking.day_label} · {booking.slot_label}
            </span>
          </div>
          <div className="mt-2.5 flex justify-between text-sm">
            <span className="text-muted">Join via</span>
            <span className="font-semibold text-primary">Video link (sent by SMS &amp; email)</span>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap justify-center gap-2.5">
          <button
            onClick={() => navigate('/dashboard')}
            className="rounded-full bg-primary px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-primary-hover"
          >
            View my consultations
          </button>
          <button
            onClick={() => navigate('/chat')}
            className="rounded-full border border-line bg-surface px-6 py-3 text-sm font-semibold text-ink"
          >
            Back to chat
          </button>
        </div>
      </div>
    </div>
  )
}
