import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowUp,
  BadgeCheck,
  BookOpen,
  Briefcase,
  Check,
  Copy,
  FileText,
  Home,
  type LucideIcon,
  Scale,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { getApiErrorMessage, sendChatMessage } from '../lib/api'
import type { ChatMessage } from '../types'

const QUICK_REPLIES: { text: string; topic: string; icon: LucideIcon }[] = [
  { text: 'What is theft under IPC?', topic: 'Criminal', icon: ShieldAlert },
  { text: 'My landlord won’t return my deposit', topic: 'Property', icon: Home },
  { text: 'How do I file an FIR?', topic: 'Police', icon: FileText },
  { text: 'Employer is holding my final salary', topic: 'Employment', icon: Briefcase },
]

const PRINCIPLES: { icon: LucideIcon; title: string; body: string }[] = [
  { icon: BookOpen, title: 'Grounded in Indian law', body: 'Answers draw on statutes and central acts.' },
  { icon: Scale, title: 'Cites its sources', body: 'Each answer names the section it relies on.' },
  { icon: ShieldCheck, title: 'Information, not advice', body: 'For your specific case, talk to a lawyer.' },
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
    <div className="relative mt-0.5 flex size-9 flex-none items-center justify-center rounded-xl bg-gradient-to-br from-navy-600 to-navy-900 font-heading text-sm font-extrabold text-white shadow-sm">
      N
      <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-bg bg-success-text" />
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
          size="xs"
          onClick={copy}
          aria-label="Copy answer"
          className="font-semibold text-muted hover:bg-bg hover:text-primary"
        >
          {copied ? <Check /> : <Copy />}
          {copied ? 'Copied' : 'Copy'}
        </Button>
      </TooltipTrigger>
      <TooltipContent sideOffset={4}>Copy the answer and its sources</TooltipContent>
    </Tooltip>
  )
}

function TypingIndicator() {
  return (
    <motion.div {...enter} exit={{ opacity: 0 }} className="flex items-start gap-3 self-start">
      <NeethiAvatar />
      <div className="flex w-fit items-center gap-1.5 rounded-2xl rounded-tl-md border border-line bg-surface px-5 py-4 shadow-card">
        <span className="h-[7px] w-[7px] animate-dotpulse rounded-full bg-primary [animation-delay:0s]" />
        <span className="h-[7px] w-[7px] animate-dotpulse rounded-full bg-primary [animation-delay:0.15s]" />
        <span className="h-[7px] w-[7px] animate-dotpulse rounded-full bg-primary [animation-delay:0.3s]" />
      </div>
    </motion.div>
  )
}

function AiAnswer({ m, onLawyer }: { m: ChatMessage; onLawyer: () => void }) {
  return (
    <motion.div {...enter} className="flex w-full items-start gap-3">
      <NeethiAvatar />
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div className="overflow-hidden rounded-2xl rounded-tl-md border border-line bg-surface shadow-card">
          <div className="flex items-center gap-2 border-b border-line/70 px-5 py-2.5">
            <span className="text-[13px] font-bold text-ink">Neethi</span>
            <span className="rounded-full bg-soft px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wide text-primary">
              Legal information
            </span>
            <div className="ml-auto">{m.id !== 'greeting' && <CopyAnswer message={m} />}</div>
          </div>
          <div className="px-5 py-4 text-[15px] leading-[1.65] text-ink">
            {m.text}
            {m.points.length > 0 && (
              <ol className="mt-4 flex flex-col gap-3">
                {m.points.map((p, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="mt-px flex size-6 flex-none items-center justify-center rounded-full bg-brass-soft font-heading text-xs font-bold text-brass-dark">
                      {i + 1}
                    </span>
                    <span className="text-[14.5px] leading-[1.6] text-body3">{p}</span>
                  </li>
                ))}
              </ol>
            )}
          </div>
          {m.citation && (
            <div className="flex flex-wrap items-center gap-2 border-t border-line/70 bg-bg/60 px-5 py-3">
              <span className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-faint">Sources</span>
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-success-border bg-success-bg px-2.5 py-1 text-xs font-semibold text-success-text">
                <BookOpen className="size-3.5" />
                {m.citation.replace(/^Sources:\s*/, '')}
              </span>
            </div>
          )}
        </div>
        {m.cta && (
          <div className="relative flex flex-col gap-3 overflow-hidden rounded-2xl bg-gradient-to-br from-navy-800 to-navy-950 px-5 py-4 text-white shadow-card sm:flex-row sm:items-center">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-brass/20 blur-2xl"
            />
            <div className="relative hidden size-10 flex-none items-center justify-center rounded-xl bg-white/10 text-brass-light sm:flex">
              <Scale className="size-5" />
            </div>
            <div className="relative flex-1">
              <div className="text-sm font-bold">Need advice on your specific case?</div>
              <div className="mt-0.5 text-xs text-white/65">
                Verified lawyers · first consult ₹500 (vs ₹5,000 typical)
              </div>
            </div>
            <Button
              onClick={onLawyer}
              className="relative h-auto bg-gradient-to-b from-brass-light to-brass px-5 py-2.5 text-[13px] text-navy-950 hover:from-brass-light hover:to-brass-light"
            >
              Talk to a lawyer
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  )
}

function SidePanel({ onLawyer }: { onLawyer: () => void }) {
  return (
    <aside className="hidden w-[300px] flex-none flex-col gap-4 overflow-y-auto border-l border-line bg-surface/70 p-5 xl:flex">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-navy-800 to-navy-950 p-5 text-white">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-brass/25 blur-2xl"
        />
        <BadgeCheck className="relative size-6 text-brass-light" />
        <div className="relative mt-3 font-display text-xl font-semibold leading-snug">
          Talk to a verified lawyer
        </div>
        <div className="relative mt-1.5 text-[13px] leading-relaxed text-white/65">
          First consult ₹500 · Bar Council verified
        </div>
        <Button
          onClick={onLawyer}
          className="relative mt-4 h-auto w-full bg-white py-2.5 text-[13px] text-navy-900 hover:bg-white/90"
        >
          Find a lawyer
        </Button>
      </div>
      <div className="rounded-2xl border border-line bg-surface p-5">
        <div className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-faint">How Neethi answers</div>
        <div className="mt-4 flex flex-col gap-4">
          {PRINCIPLES.map((p) => (
            <div key={p.title} className="flex gap-3">
              <div className="flex size-8 flex-none items-center justify-center rounded-lg bg-soft text-primary">
                <p.icon className="size-4" />
              </div>
              <div>
                <div className="text-[13px] font-bold text-ink">{p.title}</div>
                <div className="mt-0.5 text-xs leading-relaxed text-muted">{p.body}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
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
    if (!userSent) return
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, typing, userSent])

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

  const firstAnswerIndex = messages.findIndex((m) => m.id !== 'greeting')

  return (
    <div className="flex min-h-0 flex-1">
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <div className="flex flex-none items-center gap-3 border-b border-line bg-surface/80 px-5 py-3.5 backdrop-blur md:px-8">
          <div className="flex-1">
            <div className="font-heading text-[17px] font-bold">Neethi — AI Legal Assistant</div>
            <div className="text-xs text-muted">Grounded in the Indian Penal Code &amp; central acts</div>
          </div>
          <div className="flex items-center gap-1.5 rounded-full border border-success-border bg-success-bg px-3 py-1.5 text-xs font-semibold text-success-text">
            <span className="relative flex h-[7px] w-[7px]">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success-text opacity-50" />
              <span className="relative inline-flex h-[7px] w-[7px] rounded-full bg-success-text" />
            </span>
            Online
          </div>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto">
          <div className="mx-auto flex w-full max-w-[820px] flex-col gap-6 px-5 py-8 md:px-8">
            {!userSent ? (
              <motion.div {...enter} className="flex flex-col items-center pt-2 text-center md:pt-8">
                <div className="relative">
                  <div aria-hidden className="absolute inset-0 -z-10 scale-150 rounded-full bg-brass/20 blur-2xl" />
                  <div className="flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-navy-600 to-navy-950 font-heading text-[28px] font-extrabold text-white shadow-lift ring-1 ring-inset ring-white/15">
                    N
                  </div>
                </div>
                <h1 className="mt-6 font-display text-[30px] font-semibold leading-tight tracking-[-0.01em] text-ink md:text-[38px]">
                  Namaste! I'm Neethi.
                </h1>
                <p className="mt-3 max-w-[560px] text-[15px] leading-[1.65] text-body2">
                  {GREETING.text.replace(/^Namaste! I'm Neethi, your/, 'Your')}
                </p>
                <div className="mt-8 grid w-full grid-cols-1 gap-3 text-left sm:grid-cols-2">
                  {QUICK_REPLIES.map((q, i) => (
                    <motion.button
                      key={q.text}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.06 * i, duration: 0.25 }}
                      whileHover={{ y: -2 }}
                      onClick={() => send(q.text)}
                      className="group flex items-start gap-3 rounded-2xl border border-line bg-surface p-4 text-left shadow-card transition-colors hover:border-focus"
                    >
                      <div className="flex size-9 flex-none items-center justify-center rounded-xl bg-soft text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                        <q.icon className="size-[18px]" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-brass-dark">
                          {q.topic}
                        </div>
                        <div className="mt-1 text-sm font-semibold text-ink">{q.text}</div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            ) : (
              messages.map((m, i) =>
                m.role === 'user' ? (
                  <motion.div
                    key={m.id}
                    {...enter}
                    className="max-w-[85%] self-end rounded-2xl rounded-tr-md bg-gradient-to-br from-navy-700 to-navy-900 px-5 py-3 text-[15px] leading-[1.55] text-white shadow-card md:max-w-[70%]"
                  >
                    {m.text}
                  </motion.div>
                ) : m.id === 'greeting' && i < firstAnswerIndex ? null : (
                  <AiAnswer key={m.id} m={m} onLawyer={() => navigate('/lawyers')} />
                ),
              )
            )}
            <AnimatePresence>{typing && <TypingIndicator />}</AnimatePresence>
            {error && (
              <div className="self-start rounded-xl border border-warn-border bg-warn-bg px-4 py-3 text-[13px] font-medium text-warn-text">
                {error}
              </div>
            )}
          </div>
        </div>

        <div className="flex-none bg-gradient-to-t from-bg via-bg to-bg/0 px-4 pb-4 pt-2 md:px-8 md:pb-5">
          <div className="mx-auto w-full max-w-[820px]">
            <div className="flex items-center gap-2 rounded-[22px] border border-line bg-surface p-2 pl-5 shadow-composer transition-shadow focus-within:border-focus focus-within:shadow-lift">
              <Sparkles className="size-[18px] flex-none text-brass" />
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask any legal question — theft, rent, divorce, FIR, salary…"
                className="min-w-0 flex-1 bg-transparent py-2.5 text-[15px] placeholder:text-faint focus:outline-none"
              />
              <Button
                onClick={() => send(input)}
                disabled={typing || !input.trim()}
                size="icon-lg"
                aria-label="Send"
                className="flex-none bg-gradient-to-b from-navy-600 to-navy-800 disabled:opacity-40"
              >
                <ArrowUp className="size-5" />
              </Button>
            </div>
            <div className="mt-2 flex items-center justify-center gap-1.5 text-center text-[11.5px] text-muted">
              <ShieldAlert className="size-3.5 flex-none text-warn-text" />
              Neethi provides legal information, not legal advice. For advice specific to your case, consult a
              lawyer.
            </div>
          </div>
        </div>
      </div>
      <SidePanel onLawyer={() => navigate('/lawyers')} />
    </div>
  )
}
