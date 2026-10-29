import type { ConsultBrief } from '../types'

// The consult plan lives in this tab until it is sent with a booking. Storage can be blocked
// (private mode), so every access is guarded and the plan simply isn't kept in that case.
const KEY = 'nya_ai_consult_plan'

export function loadPlan(): ConsultBrief | null {
  try {
    const raw = sessionStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as ConsultBrief) : null
  } catch {
    return null
  }
}

export function savePlan(plan: ConsultBrief) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(plan))
  } catch {
    // ignore
  }
}

export function clearPlan() {
  try {
    sessionStorage.removeItem(KEY)
  } catch {
    // ignore
  }
}

export const CALL_MINUTES = 30

// Fixed 30-minute agenda, shown on the plan and followed in the call room.
export const AGENDA = [
  { from: 0, to: 5, label: 'Advocate reviews your brief' },
  { from: 5, to: 15, label: 'Facts and documents' },
  { from: 15, to: 25, label: 'Your options' },
  { from: 25, to: 30, label: 'Next steps and fees' },
]
