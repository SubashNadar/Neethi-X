import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BrandLockup } from '../components/Logo'
import { useAuth } from '../context/AuthContext'
import { getApiErrorMessage } from '../lib/api'
import type { Role } from '../types'

const BADGES = ['Free AI answers', 'Consults from ₹500', '24×7, on your phone']

export default function LoginPage() {
  const navigate = useNavigate()
  const { requestOtp, verifyOtp, guestLogin } = useAuth()

  const [role, setRole] = useState<Role>('user')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loginSub = role === 'lawyer' ? 'Sign in to your lawyer portal' : 'Sign in with your mobile number'
  const guestLabel = role === 'lawyer' ? 'Explore as demo lawyer →' : 'Explore as guest →'

  function afterLogin(userRole: Role) {
    navigate(userRole === 'lawyer' ? '/portal' : '/chat', { replace: true })
  }

  async function handleSendOtp() {
    if (!phone.trim()) {
      setError('Enter a mobile number first.')
      return
    }
    setError(null)
    setLoading(true)
    try {
      await requestOtp(phone.trim())
      setOtpSent(true)
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  async function handleVerifyOtp() {
    if (!/^\d{4}$/.test(otp.trim())) {
      setError('Enter the 4-digit OTP.')
      return
    }
    setError(null)
    setLoading(true)
    try {
      const user = await verifyOtp(phone.trim(), otp.trim(), role)
      afterLogin(user.role)
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  async function handleGuestLogin() {
    setError(null)
    setLoading(true)
    try {
      const user = await guestLogin(role)
      afterLogin(user.role)
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-[100dvh] flex-col bg-bg font-body text-ink">
      <header className="flex h-16 flex-none items-center gap-3.5 border-b border-line bg-surface px-4 md:px-6">
        <BrandLockup />
      </header>

      <div className="flex flex-1 items-center justify-center p-6">
        <div className="flex w-full max-w-[980px] flex-col items-center gap-10 lg:flex-row lg:items-center lg:gap-14">
          <div className="max-w-[440px] flex-1">
            <h1 className="font-heading text-[34px] font-extrabold leading-[1.08] tracking-[-0.5px] md:text-[44px]">
              Legal help, finally within reach.
            </h1>
            <p className="mt-4 text-[17px] leading-[1.6] text-body2">
              90% of Indians can't afford a lawyer. Ask Neethi anything about your rights — free,
              instant, 24×7. Talk to a verified lawyer only when you need one, from ₹500.
            </p>
            <div className="mt-5 flex flex-wrap gap-2.5">
              {BADGES.map((b) => (
                <div
                  key={b}
                  className="rounded-full border border-line bg-surface px-3.5 py-2 text-[13px] font-semibold"
                >
                  {b}
                </div>
              ))}
            </div>
          </div>

          <div className="w-full max-w-[360px] flex-none rounded-3xl border border-line bg-surface p-7 shadow-login">
            <div className="font-heading text-[22px] font-bold">Get started</div>
            <div className="mt-3 flex gap-1 rounded-full bg-[#EBEEF3] p-1">
              <button
                onClick={() => setRole('user')}
                className={`flex-1 rounded-full px-2.5 py-2 text-[13px] font-semibold transition-colors ${
                  role === 'user' ? 'bg-primary text-white' : 'bg-transparent text-body2'
                }`}
              >
                I need legal help
              </button>
              <button
                onClick={() => setRole('lawyer')}
                className={`flex-1 rounded-full px-2.5 py-2 text-[13px] font-semibold transition-colors ${
                  role === 'lawyer' ? 'bg-primary text-white' : 'bg-transparent text-body2'
                }`}
              >
                I'm a lawyer
              </button>
            </div>
            <div className="mt-3 text-[13px] text-muted">{loginSub}</div>

            <div className="mt-[18px] text-[13px] font-semibold">Mobile number</div>
            <div className="mt-1.5 flex gap-2">
              <div className="flex items-center rounded-xl border border-line bg-bg px-3 py-2.5 text-sm font-semibold">
                +91
              </div>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                placeholder="98765 43210"
                inputMode="numeric"
                className="flex-1 rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm"
              />
            </div>

            {otpSent ? (
              <>
                <div className="mt-3.5 text-[13px] font-semibold">
                  Enter OTP <span className="font-medium text-muted">(demo: 1234)</span>
                </div>
                <input
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="• • • •"
                  inputMode="numeric"
                  className="mt-1.5 w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-lg tracking-[8px]"
                />
                <button
                  onClick={handleVerifyOtp}
                  disabled={loading}
                  className="mt-3.5 w-full rounded-full bg-primary py-3.5 text-[15px] font-bold text-white transition-colors hover:bg-primary-hover disabled:opacity-60"
                >
                  {loading ? 'Verifying…' : 'Continue'}
                </button>
              </>
            ) : (
              <button
                onClick={handleSendOtp}
                disabled={loading}
                className="mt-4 w-full rounded-full bg-primary py-3.5 text-[15px] font-bold text-white transition-colors hover:bg-primary-hover disabled:opacity-60"
              >
                {loading ? 'Sending…' : 'Get OTP'}
              </button>
            )}

            {error && <div className="mt-3 text-[12px] font-medium text-warn-text">{error}</div>}

            <div className="my-4 flex items-center gap-2.5">
              <div className="h-px flex-1 bg-line" />
              <div className="text-xs text-muted">or</div>
              <div className="h-px flex-1 bg-line" />
            </div>
            <button
              onClick={handleGuestLogin}
              disabled={loading}
              className="w-full rounded-full border border-line bg-surface py-3 text-sm font-semibold text-ink transition-colors hover:bg-bg disabled:opacity-60"
            >
              {guestLabel}
            </button>
            <div className="mt-3.5 text-[11px] leading-relaxed text-faint">
              By continuing you agree to our Terms. Neethi gives legal information, not legal advice.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
