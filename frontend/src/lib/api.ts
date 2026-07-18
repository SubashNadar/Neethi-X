import axios, { type AxiosInstance } from 'axios'
import type {
  Booking,
  ChatMessage,
  ConsultType,
  LawyerDashboard,
  LawyerCard,
  LawyerDetail,
  MessageThread,
  PaymentMethod,
  PaymentOrder,
  RazorpayResult,
  Role,
  User,
  UserDashboard,
} from '../types'

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api'

const TOKEN_STORAGE_KEY = 'neethi_token'

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_STORAGE_KEY)
}

export function setStoredToken(token: string | null) {
  if (token) {
    localStorage.setItem(TOKEN_STORAGE_KEY, token)
  } else {
    localStorage.removeItem(TOKEN_STORAGE_KEY)
  }
}

const client: AxiosInstance = axios.create({ baseURL: BASE_URL })

client.interceptors.request.use((config) => {
  const token = getStoredToken()
  if (token) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export function getApiErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const detail = err.response?.data?.detail
    if (typeof detail === 'string') return detail
    if (detail && typeof detail === 'object') return JSON.stringify(detail)
    if (err.message) return err.message
  }
  if (err instanceof Error) return err.message
  return 'Something went wrong. Please try again.'
}

// ---- Auth ----

export async function requestOtp(phone: string): Promise<{ sent: true }> {
  const { data } = await client.post('/auth/otp/request', { phone })
  return data
}

export async function verifyOtp(
  phone: string,
  otp: string,
  role?: Role,
): Promise<{ token: string; user: User }> {
  const { data } = await client.post('/auth/otp/verify', { phone, otp, role })
  return data
}

export async function guestLogin(role: 'user' | 'lawyer'): Promise<{ token: string; user: User }> {
  const { data } = await client.post('/auth/guest', { role })
  return data
}

export async function getMe(): Promise<{ user: User }> {
  const { data } = await client.get('/auth/me')
  return data
}

export async function logout(): Promise<void> {
  await client.post('/auth/logout')
}

// ---- Chat ----

export async function sendChatMessage(
  message: string,
  conversationId?: string,
): Promise<{
  conversation_id: string
  id: string
  text: string
  points: string[]
  citation: string
  cta: boolean
}> {
  const { data } = await client.post('/chat/message', {
    message,
    conversation_id: conversationId,
  })
  return data
}

export async function getChatHistory(
  conversationId?: string,
): Promise<{ messages: ChatMessage[] }> {
  const { data } = await client.get('/chat/history', {
    params: conversationId ? { conversation_id: conversationId } : {},
  })
  return data
}

// ---- Lawyers ----

export async function getLawyers(category?: string): Promise<{ lawyers: LawyerCard[] }> {
  const { data } = await client.get('/lawyers', {
    params: category && category !== 'All' ? { category } : {},
  })
  return data
}

export async function getLawyer(id: string): Promise<LawyerDetail> {
  const { data } = await client.get(`/lawyers/${id}`)
  return data
}

// ---- Bookings ----

export async function createBooking(payload: {
  lawyer_id: string
  day_label: string
  slot_label: string
  consult_type: ConsultType
}): Promise<Booking> {
  const { data } = await client.post('/bookings', payload)
  return data
}

export async function getMyBookings(): Promise<{ bookings: Booking[] }> {
  const { data } = await client.get('/bookings/me')
  return data
}

export async function getBooking(id: string): Promise<Booking> {
  const { data } = await client.get(`/bookings/${id}`)
  return data
}

export async function respondToBooking(
  id: string,
  action: 'accept' | 'decline',
): Promise<Booking> {
  const { data } = await client.patch(`/bookings/${id}/respond`, { action })
  return data
}

// ---- Payments ----

export async function createPaymentOrder(
  bookingId: string,
  method: PaymentMethod,
): Promise<PaymentOrder> {
  const { data } = await client.post('/payments/order', {
    booking_id: bookingId,
    method,
  })
  return data
}

export async function confirmPayment(
  orderId: string,
  result: RazorpayResult,
): Promise<{ status: 'paid'; booking: Booking }> {
  const { data } = await client.post(`/payments/${orderId}/confirm`, result)
  return data
}

let razorpayScriptPromise: Promise<void> | null = null

export function loadRazorpayScript(): Promise<void> {
  if (window.Razorpay) return Promise.resolve()
  if (razorpayScriptPromise) return razorpayScriptPromise
  razorpayScriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load payment gateway script'))
    document.body.appendChild(script)
  })
  return razorpayScriptPromise
}

// ---- Dashboard ----

export async function getUserDashboard(): Promise<UserDashboard> {
  const { data } = await client.get('/dashboard/user')
  return data
}

export async function getLawyerDashboard(): Promise<LawyerDashboard> {
  const { data } = await client.get('/dashboard/lawyer')
  return data
}

// ---- Messages (lawyer inbox — see .claude/NEETHI_OPEN_QUESTIONS.md) ----

export async function getMessageThreads(): Promise<{ threads: MessageThread[] }> {
  const { data } = await client.get('/messages/threads')
  return data
}

export async function getMessageThread(id: string): Promise<MessageThread> {
  const { data } = await client.get(`/messages/threads/${id}`)
  return data
}

export async function replyToThread(
  id: string,
  text: string,
): Promise<{ message: MessageThread['messages'][number] }> {
  const { data } = await client.post(`/messages/threads/${id}/reply`, { text })
  return data
}

export async function markThreadRead(id: string): Promise<MessageThread> {
  const { data } = await client.patch(`/messages/threads/${id}/read`)
  return data
}

export default client
