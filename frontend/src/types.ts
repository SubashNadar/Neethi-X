export type Role = 'user' | 'lawyer'

export interface User {
  id: string
  role: Role
  name: string
  initials: string
  phone: string | null
}

export interface ChatMessage {
  id: string
  role: 'user' | 'ai'
  text: string
  points: string[]
  citation: string
  cta: boolean
  created_at: string
}

export interface LawyerCard {
  id: string
  name: string
  initials: string
  avatar_color: string
  spec: string
  category: string
  exp: number
  langs: string[]
  rating: number
  reviews: number
  next_slot: string
}

export interface LawyerDetail extends LawyerCard {
  bio: string
  bar_council_id: string
  price: number
  price_struck: number
}

export type ConsultType = 'Video' | 'Phone'

export type BookingStatus =
  | 'pending_payment'
  | 'paid'
  | 'accepted'
  | 'declined'
  | 'completed'

export interface Booking {
  id: string
  ref: string
  lawyer: LawyerCard
  user_id: string
  client_name: string | null
  client_initials: string | null
  topic: string | null
  day_label: string
  slot_label: string
  consult_type: ConsultType
  fee: number
  lawyer_share: number
  status: BookingStatus
  created_at: string
}

export type PaymentMethod = 'upi' | 'card' | 'netbanking'

export interface PaymentOrder {
  order_id: string
  razorpay_order_id: string
  razorpay_key_id: string
  amount: number
  currency: string
  status: 'created'
  prefill: { name: string | null; contact: string | null; email: string | null }
}

export interface RazorpayResult {
  razorpay_payment_id: string
  razorpay_order_id: string
  razorpay_signature: string
}

export interface UserDashboard {
  questions_answered: number
  consults_booked: number
  saved_amount: number
  upcoming: Booking | null
  recent_questions: { q: string; when: string }[]
}

export interface LawyerDashboard {
  earnings_month: number
  consultations: number
  rating: number
  reviews: number
  share_pct: number
  requests: Booking[]
}

export interface Message {
  id: string
  sender: 'client' | 'lawyer'
  text: string
  created_at: string
}

export interface MessageThread {
  id: string
  client_name: string
  client_initials: string
  topic: string
  unread: boolean
  messages: Message[]
}

export interface ApiErrorShape {
  detail?: string | Record<string, unknown>
}

export type SupportTopic = 'booking' | 'answer' | 'privacy' | 'advocate' | 'other'

export interface SupportIn {
  name: string
  contact: string
  topic: SupportTopic
  text: string
}

export interface SupportOut {
  ref: string
  created_at: string
}
