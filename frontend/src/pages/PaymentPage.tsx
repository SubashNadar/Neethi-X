import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  confirmPayment,
  createPaymentOrder,
  getApiErrorMessage,
  getBooking,
  loadRazorpayScript,
} from '../lib/api'
import { ErrorState, LoadingState } from '../components/states'
import type { Booking, PaymentMethod } from '../types'

const METHODS: { id: PaymentMethod; name: string; desc: string }[] = [
  { id: 'upi', name: 'UPI', desc: 'GPay, PhonePe, Paytm — instant' },
  { id: 'card', name: 'Card', desc: 'Credit or debit, all networks' },
  { id: 'netbanking', name: 'Netbanking', desc: 'All major Indian banks' },
]

export default function PaymentPage() {
  const { bookingId } = useParams()
  const navigate = useNavigate()

  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [method, setMethod] = useState<PaymentMethod>('upi')
  const [paying, setPaying] = useState(false)
  const [payError, setPayError] = useState<string | null>(null)

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

  async function handlePay() {
    if (!booking) return
    setPaying(true)
    setPayError(null)
    try {
      const order = await createPaymentOrder(booking.id, method)
      await loadRazorpayScript()
      const rzp = new window.Razorpay({
        key: order.razorpay_key_id,
        amount: order.amount,
        currency: order.currency,
        order_id: order.razorpay_order_id,
        name: 'Nya-AI',
        description: `${booking.consult_type} consult · ${booking.lawyer.name}`,
        prefill: {
          name: order.prefill.name ?? undefined,
          contact: order.prefill.contact ?? undefined,
          email: order.prefill.email ?? undefined,
        },
        method,
        handler: async (response) => {
          try {
            await confirmPayment(order.order_id, response)
            navigate(`/success/${booking.id}`)
          } catch (err) {
            setPayError(getApiErrorMessage(err))
            setPaying(false)
          }
        },
        modal: {
          ondismiss: () => setPaying(false), // user closed the modal — not an error, just reset
        },
      })
      rzp.on('payment.failed', (response) => {
        setPayError(response.error?.description ?? 'Payment failed. Please try again.')
        setPaying(false)
      })
      rzp.open()
    } catch (err) {
      setPayError(getApiErrorMessage(err))
      setPaying(false)
    }
  }

  if (loading) return <LoadingState label="Loading order…" />
  if (error || !booking) return <ErrorState message={error ?? 'Booking not found.'} onRetry={load} />

  const whenStr = `${booking.day_label} · ${booking.slot_label}`

  return (
    <div className="flex flex-1 justify-center overflow-y-auto px-5 py-7 md:px-8">
      <div className="flex w-full max-w-[820px] flex-col gap-5 md:flex-row md:items-start">
        <div className="flex-1 rounded-[20px] border border-line bg-surface p-[22px]">
          <div className="font-heading text-lg font-bold">Order</div>
          <div className="mt-3.5 text-sm font-semibold">
            {booking.consult_type} consult · {booking.lawyer.name}
          </div>
          <div className="mt-1 text-[13px] text-muted">{whenStr} · 30 minutes</div>
          <div className="my-4 h-px bg-line" />
          <div className="flex justify-between text-[17px] font-extrabold">
            <span>To pay</span>
            <span>₹{booking.fee}</span>
          </div>
          <div className="mt-3.5 rounded-2xl bg-success-bg p-3.5 text-xs leading-relaxed text-success-dark">
            100% refund if the lawyer doesn't join. Money is held safely until your consult completes.
          </div>
        </div>

        <div className="flex-1 rounded-[20px] border border-line bg-surface p-[22px]">
          <div className="flex items-center justify-between">
            <div className="font-heading text-lg font-bold">Pay securely</div>
            <div className="rounded-full bg-bg px-2.5 py-1 text-[11px] font-bold text-muted">
              Razorpay · secure
            </div>
          </div>
          <div className="mt-4 flex flex-col gap-2">
            {METHODS.map((m) => (
              <button
                key={m.id}
                onClick={() => setMethod(m.id)}
                className={`flex items-center gap-3 rounded-2xl border px-4 py-3.5 text-left ${
                  method === m.id ? 'border-focus bg-soft' : 'border-line bg-surface'
                }`}
              >
                <span
                  className={`h-4 w-4 flex-none rounded-full border-2 ${
                    method === m.id ? 'border-primary bg-primary' : 'border-line bg-transparent'
                  }`}
                />
                <div className="flex-1">
                  <div className="text-sm font-bold text-ink">{m.name}</div>
                  <div className="text-xs text-muted">{m.desc}</div>
                </div>
              </button>
            ))}
          </div>

          {!paying ? (
            <button
              onClick={handlePay}
              className="key mt-4 w-full rounded-full bg-primary py-3.5 text-[15px] font-bold text-primary-foreground transition-colors hover:bg-primary-hover"
            >
              Pay ₹{booking.fee}
            </button>
          ) : (
            <div className="mt-4 flex items-center justify-center gap-2.5 rounded-full bg-bg p-3.5">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-focus border-t-primary" />
              <span className="text-sm font-semibold text-body2">Processing payment…</span>
            </div>
          )}
          {payError && <div className="mt-2 text-[12px] font-medium text-warn-text">{payError}</div>}
        </div>
      </div>
    </div>
  )
}
