import { useEffect, useState } from 'react'
import { BadgeCheck, Clock3, Languages, Star } from 'lucide-react'
import { motion } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import { getApiErrorMessage, getLawyers } from '../lib/api'
import { ErrorState, LoadingState } from '../components/states'
import type { LawyerCard } from '../types'

const FILTERS = ['All', 'Criminal', 'Property', 'Family', 'Employment']

export default function LawyersPage() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState('All')
  const [lawyers, setLawyers] = useState<LawyerCard[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  function load() {
    setLoading(true)
    setError(null)
    getLawyers(filter)
      .then((res) => setLawyers(res.lawyers))
      .catch((err) => setError(getApiErrorMessage(err)))
      .finally(() => setLoading(false))
  }

  useEffect(load, [filter])

  return (
    <div className="flex-1 overflow-y-auto px-5 py-7 md:px-8">
      <h1 className="font-heading text-2xl font-extrabold md:text-[28px]">
        Verified lawyers, honest prices
      </h1>
      <div className="mt-1 text-sm text-muted">
        First consultation ₹500 · Your lawyer keeps 70% · Bar Council verified
      </div>

      <div className="mt-[18px] flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full border px-4 py-2 text-[13px] font-semibold transition-colors ${
              filter === f
                ? 'border-primary bg-primary text-white'
                : 'border-line bg-surface text-body3'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading && <LoadingState label="Finding lawyers…" />}
      {!loading && error && <ErrorState message={error} onRetry={load} />}
      {!loading && !error && lawyers && lawyers.length === 0 && (
        <div className="mt-6 rounded-2xl border border-line bg-surface p-6 text-sm text-muted">
          No lawyers found in this category.
        </div>
      )}
      {!loading && !error && lawyers && lawyers.length > 0 && (
        <div className="mt-5 grid grid-cols-1 gap-4 [grid-template-columns:repeat(auto-fill,minmax(300px,1fr))] md:[grid-template-columns:repeat(auto-fill,minmax(340px,1fr))]">
          {lawyers.map((lw, i) => (
            <motion.div
              key={lw.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i, duration: 0.25, ease: 'easeOut' }}
              whileHover={{ y: -3 }}
              className="flex flex-col gap-3 rounded-[20px] border border-line bg-surface p-5 transition-shadow hover:border-focus/60 hover:shadow-soft"
            >
              <div className="flex items-center gap-3.5">
                <div
                  className="flex h-[52px] w-[52px] flex-none items-center justify-center rounded-full text-[17px] font-bold text-white ring-4 ring-bg"
                  style={{ background: lw.avatar_color }}
                >
                  {lw.initials}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <div className="text-base font-bold">{lw.name}</div>
                    <div className="inline-flex items-center gap-1 rounded-full bg-success-bg px-2.5 py-0.5 text-[11px] font-bold text-success-text">
                      <BadgeCheck className="size-3.5" />
                      Verified
                    </div>
                  </div>
                  <div className="mt-0.5 text-[13px] text-muted">
                    {lw.spec} · {lw.exp} yrs
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-body2">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-bg px-2.5 py-1.5">
                  <Star className="size-3.5 fill-warn-text text-warn-text" />
                  {lw.rating} ({lw.reviews})
                </div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-bg px-2.5 py-1.5">
                  <Languages className="size-3.5 text-muted" />
                  {lw.langs.join(' · ')}
                </div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-bg px-2.5 py-1.5">
                  <Clock3 className="size-3.5 text-muted" />
                  Next: {lw.next_slot}
                </div>
              </div>
              <div className="mt-0.5 flex items-center gap-3">
                <div className="flex-1">
                  <div className="text-lg font-extrabold text-ink">
                    ₹500{' '}
                    <span className="text-xs font-medium text-faint line-through">₹5,000</span>
                  </div>
                  <div className="text-[11px] text-muted">first video consult · 30 min</div>
                </div>
                <button
                  onClick={() => navigate(`/booking/${lw.id}`)}
                  className="rounded-full bg-primary px-[22px] py-2.5 text-sm font-bold text-white transition-colors hover:bg-primary-hover"
                >
                  Book
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
