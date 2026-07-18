import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getApiErrorMessage, sendChatMessage } from '../lib/api'
import type { ChatMessage } from '../types'

const QUICK_REPLIES = [
  'What is theft under IPC?',
  'My landlord won’t return my deposit',
  'How do I file an FIR?',
  'Employer is holding my final salary',
]

const GREETING: ChatMessage = {
  id: 'greeting',
  role: 'ai',
  text: "Namaste! I'm Neethi, your free AI legal assistant. Ask me anything — theft, rent disputes, FIRs, divorce, salary issues — and I'll explain your rights in plain language, grounded in Indian law.",
  points: [],
  citation: '',
  cta: false,
  created_at: new Date().toISOString(),
}

function TypingIndicator() {
  return (
    <div className="flex w-fit items-center gap-1.5 self-start rounded-[6px_20px_20px_20px] border border-line bg-surface px-5 py-4">
      <span className="h-[7px] w-[7px] animate-dotpulse rounded-full bg-primary [animation-delay:0s]" />
      <span className="h-[7px] w-[7px] animate-dotpulse rounded-full bg-primary [animation-delay:0.15s]" />
      <span className="h-[7px] w-[7px] animate-dotpulse rounded-full bg-primary [animation-delay:0.3s]" />
    </div>
  )
}

export default function ChatPage() {
  const navigate = useNavigate()
  const [messages, setMessages] = useState<ChatMessage[]>([GREETING])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [userSent, setUserSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [conversationId, setConversationId] = useState<string | undefined>(undefined)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight })
  }, [messages, typing])

  async function send(text: string) {
    const msg = text.trim()
    if (!msg || typing) return
    setError(null)
    setUserSent(true)
    setMessages((prev) => [
      ...prev,
      {
        id: `local-${Date.now()}`,
        role: 'user',
        text: msg,
        points: [],
        citation: '',
        cta: false,
        created_at: new Date().toISOString(),
      },
    ])
    setInput('')
    setTyping(true)
    try {
      const res = await sendChatMessage(msg, conversationId)
      setConversationId(res.conversation_id)
      setMessages((prev) => [
        ...prev,
        {
          id: res.id,
          role: 'ai',
          text: res.text,
          points: res.points,
          citation: res.citation,
          cta: res.cta,
          created_at: new Date().toISOString(),
        },
      ])
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setTyping(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') send(input)
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex flex-none items-center gap-3 border-b border-line bg-surface px-5 py-4 md:px-7">
        <div className="flex h-10 w-10 flex-none items-center justify-center rounded-2xl bg-soft font-heading text-lg font-extrabold text-primary">
          N
        </div>
        <div className="flex-1">
          <div className="font-heading text-base font-bold">Neethi — AI Legal Assistant</div>
          <div className="text-xs text-muted">Grounded in the Indian Penal Code &amp; central acts</div>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-success-bg px-3 py-1.5 text-xs font-semibold text-success-text">
          <span className="h-[7px] w-[7px] rounded-full bg-success-text" />
          Online
        </div>
      </div>

      <div className="flex-none border-b border-warn-border bg-warn-bg px-5 py-2 text-xs text-warn-text md:px-7">
        Neethi provides legal information, not legal advice. For advice specific to your case, consult a
        lawyer.
      </div>

      <div ref={scrollRef} className="flex flex-1 flex-col gap-4 overflow-y-auto px-5 py-6 md:px-7">
        {messages.map((m) =>
          m.role === 'user' ? (
            <div
              key={m.id}
              className="max-w-[85%] self-end rounded-[20px_20px_6px_20px] bg-primary px-[18px] py-3 text-[15px] leading-[1.55] text-white md:max-w-[60%]"
            >
              {m.text}
            </div>
          ) : (
            <div key={m.id} className="flex max-w-[90%] flex-col gap-2.5 self-start md:max-w-[70%]">
              <div className="rounded-[6px_20px_20px_20px] border border-line bg-surface px-[18px] py-3.5 text-[15px] leading-[1.6]">
                {m.text}
                {m.points.length > 0 && (
                  <div className="mt-3 flex flex-col gap-2">
                    {m.points.map((p, i) => (
                      <div key={i} className="flex items-start gap-2.5">
                        <span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-primary" />
                        <span className="text-sm leading-[1.55] text-body3">{p}</span>
                      </div>
                    ))}
                  </div>
                )}
                {m.citation && (
                  <div className="mt-3 inline-block rounded-full bg-success-bg px-3 py-1.5 text-xs font-semibold text-success-text">
                    {m.citation}
                  </div>
                )}
              </div>
              {m.cta && (
                <div className="flex items-center gap-3.5 rounded-[18px] bg-soft px-[18px] py-3.5">
                  <div className="flex-1">
                    <div className="text-sm font-bold">Need advice on your specific case?</div>
                    <div className="mt-0.5 text-xs text-body2">
                      Verified lawyers · first consult ₹500 (vs ₹5,000 typical)
                    </div>
                  </div>
                  <button
                    onClick={() => navigate('/lawyers')}
                    className="whitespace-nowrap rounded-full bg-primary px-[18px] py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-primary-hover"
                  >
                    Talk to a lawyer
                  </button>
                </div>
              )}
            </div>
          ),
        )}
        {typing && <TypingIndicator />}
        {error && (
          <div className="self-start rounded-[18px] bg-warn-bg px-4 py-3 text-[13px] font-medium text-warn-text">
            {error}
          </div>
        )}
      </div>

      {!userSent && (
        <div className="flex flex-none flex-wrap gap-2 px-5 pb-3 md:px-7">
          {QUICK_REPLIES.map((q) => (
            <button
              key={q}
              onClick={() => send(q)}
              className="rounded-full border border-line bg-surface px-4 py-2.5 text-[13px] font-medium text-body3 transition-colors hover:border-focus hover:bg-soft"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-none gap-2.5 border-t border-line bg-surface px-5 py-4 md:px-7">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask any legal question — theft, rent, divorce, FIR, salary…"
          className="flex-1 rounded-full border border-line bg-surface px-5 py-3.5 text-[15px]"
        />
        <button
          onClick={() => send(input)}
          disabled={typing}
          className="rounded-full bg-primary px-6 py-3.5 text-[15px] font-bold text-white transition-colors hover:bg-primary-hover disabled:opacity-60"
        >
          Send
        </button>
      </div>
    </div>
  )
}
