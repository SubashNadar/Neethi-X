import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, Check, Copy, Scale, SendHorizontal, ShieldAlert, Sparkles } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
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

const enter = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.25, ease: 'easeOut' },
} as const

function NeethiAvatar() {
  return (
    <div className="mt-0.5 flex size-8 flex-none items-center justify-center rounded-xl bg-primary font-heading text-sm font-extrabold text-white shadow-sm">
      N
    </div>
  )
}

function CopyAnswer({ message }: { message: ChatMessage }) {
  const [copied, setCopied] = useState(false)
  async function copy() {
    const body = [message.text, ...message.points.map((p) => `• ${p}`), message.citation]
      .filter(Boolean)
      .join('\n')
    try {
      await navigator.clipboard.writeText(body)
      setCopied(true)
      toast.success('Answer copied')
      setTimeout(() => setCopied(false), 1500)
    } catch {
      toast.error('Could not copy')
    }
  }
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={copy}
          aria-label="Copy answer"
          className="text-faint hover:text-primary"
        >
          {copied ? <Check /> : <Copy />}
        </Button>
      </TooltipTrigger>
      <TooltipContent sideOffset={4}>Copy answer</TooltipContent>
    </Tooltip>
  )
}

function TypingIndicator() {
  return (
    <motion.div {...enter} exit={{ opacity: 0 }} className="flex items-start gap-2.5 self-start">
      <NeethiAvatar />
      <div className="flex w-fit items-center gap-1.5 rounded-[6px_20px_20px_20px] border border-line bg-surface px-5 py-4">
        <span className="h-[7px] w-[7px] animate-dotpulse rounded-full bg-primary [animation-delay:0s]" />
        <span className="h-[7px] w-[7px] animate-dotpulse rounded-full bg-primary [animation-delay:0.15s]" />
        <span className="h-[7px] w-[7px] animate-dotpulse rounded-full bg-primary [animation-delay:0.3s]" />
      </div>
    </motion.div>
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
        <div className="relative flex h-10 w-10 flex-none items-center justify-center rounded-2xl bg-gradient-to-br from-soft to-[#D9E5F2] font-heading text-lg font-extrabold text-primary ring-1 ring-inset ring-focus/60">
          N
        </div>
        <div className="flex-1">
          <div className="font-heading text-base font-bold">Neethi — AI Legal Assistant</div>
          <div className="text-xs text-muted">Grounded in the Indian Penal Code &amp; central acts</div>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-success-bg px-3 py-1.5 text-xs font-semibold text-success-text">
          <span className="relative flex h-[7px] w-[7px]">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success-text opacity-50" />
            <span className="relative inline-flex h-[7px] w-[7px] rounded-full bg-success-text" />
          </span>
          Online
        </div>
      </div>

      <div className="flex flex-none items-center gap-2 border-b border-warn-border bg-warn-bg px-5 py-2 text-xs text-warn-text md:px-7">
        <ShieldAlert className="size-3.5 flex-none" />
        <span>
        Neethi provides legal information, not legal advice. For advice specific to your case, consult a
        lawyer.
        </span>
      </div>

      <div
        ref={scrollRef}
        className="flex flex-1 flex-col gap-4 overflow-y-auto bg-[radial-gradient(circle_at_1px_1px,#E2E7EF_1px,transparent_0)] [background-size:22px_22px] px-5 py-6 md:px-7"
      >
        {messages.map((m) =>
          m.role === 'user' ? (
            <motion.div
              key={m.id}
              {...enter}
              className="max-w-[85%] self-end rounded-[20px_20px_6px_20px] bg-gradient-to-br from-primary to-[#2A4E7D] px-[18px] py-3 text-[15px] leading-[1.55] text-white shadow-sm md:max-w-[60%]"
            >
              {m.text}
            </motion.div>
          ) : (
            <motion.div
              key={m.id}
              {...enter}
              className="flex max-w-[94%] items-start gap-2.5 self-start md:max-w-[74%]"
            >
              <NeethiAvatar />
              <div className="flex min-w-0 flex-1 flex-col gap-2.5">
                <div className="group relative rounded-[6px_20px_20px_20px] border border-line bg-surface px-[18px] py-3.5 text-[15px] leading-[1.6] shadow-[0_1px_2px_rgba(27,36,48,0.04)]">
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
                  {(m.citation || m.id !== 'greeting') && (
                    <div className="mt-3 flex items-center gap-2">
                      {m.citation && (
                        <div className="inline-flex items-center gap-1.5 rounded-full border border-success-border bg-success-bg px-3 py-1.5 text-xs font-semibold text-success-text">
                          <BookOpen className="size-3.5" />
                          {m.citation}
                        </div>
                      )}
                      {m.id !== 'greeting' && (
                        <div className="ml-auto opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                          <CopyAnswer message={m} />
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {m.cta && (
                  <div className="flex items-center gap-3.5 rounded-[18px] border border-focus/40 bg-soft px-[18px] py-3.5">
                    <div className="hidden size-9 flex-none items-center justify-center rounded-full bg-surface text-primary sm:flex">
                      <Scale className="size-[18px]" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-bold">Need advice on your specific case?</div>
                      <div className="mt-0.5 text-xs text-body2">
                        Verified lawyers · first consult ₹500 (vs ₹5,000 typical)
                      </div>
                    </div>
                    <Button
                      onClick={() => navigate('/lawyers')}
                      className="h-auto px-[18px] py-2.5 text-[13px]"
                    >
                      Talk to a lawyer
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          ),
        )}
        <AnimatePresence>{typing && <TypingIndicator />}</AnimatePresence>
        {error && (
          <div className="self-start rounded-[18px] bg-warn-bg px-4 py-3 text-[13px] font-medium text-warn-text">
            {error}
          </div>
        )}
      </div>

      {!userSent && (
        <div className="flex flex-none flex-wrap gap-2 px-5 pb-3 md:px-7">
          {QUICK_REPLIES.map((q, i) => (
            <motion.button
              key={q}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i, duration: 0.2 }}
              onClick={() => send(q)}
              className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-4 py-2.5 text-[13px] font-medium text-body3 transition-colors hover:border-focus hover:bg-soft"
            >
              <Sparkles className="size-3.5 text-primary" />
              {q}
            </motion.button>
          ))}
        </div>
      )}

      <div className="flex flex-none gap-2.5 border-t border-line bg-surface px-5 py-4 md:px-7">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask any legal question — theft, rent, divorce, FIR, salary…"
          className="flex-1 rounded-full border border-line bg-bg/60 px-5 py-3.5 text-[15px] transition-colors focus:bg-surface"
        />
        <Button
          onClick={() => send(input)}
          disabled={typing}
          className="h-auto px-6 py-3.5 text-[15px] disabled:opacity-60"
        >
          <span className="hidden sm:inline">Send</span>
          <SendHorizontal className="size-[18px]" />
        </Button>
      </div>
    </div>
  )
}
