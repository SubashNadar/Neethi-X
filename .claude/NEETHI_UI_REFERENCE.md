# Neethi UI Reference

Transcribed from [`Neethi-X Demo.html`](../Neethi-X%20Demo.html) (repo root) — a packed interactive-artifact
export (the real markup/JSX lives inside a base64/gzip bundle, not as plain HTML). This document is the
source of truth the agents and the hand-built `backend/`/`frontend/` apps are built against.

**Do not trust this document blindly for anything load-bearing you can't find quoted verbatim below.** It is a
faithful transcription, not a substitute for the source — but no decode tooling for the raw bundle is checked
into this repo, so this document is the practical source of truth in day-to-day use. If something you need
isn't covered here, don't hand-decode the bundle and guess at the result — log it in
`.claude/NEETHI_OPEN_QUESTIONS.md` per the no-assumption protocol in `.claude/NEETHI_BUILD_GUARDRAILS.md`.

## Naming

- **Neethi-X** — the product/brand wordmark, shown in the top bar (`Neethi-X` next to the tagline). This
  matches the repo name.
- **Neethi** — the AI assistant's *persona name*, used everywhere the product speaks in first person or is
  addressed directly: the chat header ("Neethi — AI Legal Assistant"), the greeting ("I'm Neethi..."), the
  disclaimer banner, nav item "Chat with Neethi", dashboard empty-state "Ask Neethi", subscription card "Neethi
  Plus", mobile chat header ("Neethi").
- Logo mark: white square, `#1F3A5F` tile, navy/white serif "N" (Georgia in the loading-state SVG; Bricolage
  Grotesque 800 in the live UI).
- Use **Neethi-X** for the product/company name (page titles, package names, footers) and **Neethi** whenever
  the copy is the assistant speaking or being addressed. Don't collapse the two into one name — the demo
  deliberately uses both.

## Design tokens

| Token | Value | Usage |
|---|---|---|
| `--color-primary` (A) | `#1F3A5F` | Brand navy — primary buttons, active nav, user chat bubbles, headings accents |
| `--color-primary-hover` | `#15263C` | Hover state for primary buttons/links |
| `--color-soft` (SOFT) | `#EAF1F8` | Pale blue highlight — selected sidebar row, AI CTA chip, avatar backgrounds |
| `--color-line` (LINE) | `#E2E7EF` | Borders, dividers |
| `--color-ink` (INK) | `#1B2430` | Primary text |
| `--color-muted` (MUT) | `#667085` | Secondary/meta text |
| `--color-bg` | `#F3F5F9` | App background |
| `--color-surface` | `#FFFFFF` | Cards, header, inputs |
| `--color-success` | `#2F6B57` text / `#E4F0EA` bg / `#245C48` dark text / `#C4E0D2` border | Verified badges, "Online", accept actions, lawyer-side chat bubbles |
| `--color-warn` | `#8A6A2E` text / `#FBF6EC` bg / `#F0E4CE` border | Disclaimer banner |
| `--color-focus` | `#A9C2E0` | Input focus outline (`outline: 2px solid #A9C2E0`), hover border on chips |
| Faint text | `#98A2B3` | Placeholder-weight captions (e.g. strikethrough price, footnotes) |
| Body text (secondary) | `#4B5563` / `#374151` | Paragraph copy inside cards |
| Scrollbar thumb | `#D5DCE6` | `::-webkit-scrollbar-thumb`, 8px, rounded |

Shape language: pill buttons (`border-radius: 999px`), 12–24px rounded cards, no drop shadows except a soft
warm-tinted shadow on hover (`box-shadow: 0 8px 24px rgba(120,90,50,0.10)`) and on the login card
(`0 12px 40px rgba(120,90,50,0.08)`).

**Animation keyframes** (exact, reuse verbatim):
```css
@keyframes dotpulse { 0%,80%,100% { opacity:.25; transform:translateY(0); } 40% { opacity:1; transform:translateY(-3px); } }
@keyframes spin { to { transform: rotate(360deg); } }
```
`dotpulse` drives the 3-dot typing indicator (staggered `0s / .15s / .3s` delays). `spin` drives the payment
processing spinner (`0.8s linear infinite`, navy top-border on a `#A9C2E0` ring).

**Fonts** (Google Fonts):
- **Bricolage Grotesque** (weights 500/600/700/800) — headings, logo mark, stat numbers.
- **Figtree** (weight 400/500/600/700) — body text, inputs, buttons.

## Screens

### 1. Login (`screen: login`)
Two-column, centered on the page. Left = value prop:
- Headline (44px, Bricolage 800): **"Legal help, finally within reach."**
- Subhead: *"90% of Indians can't afford a lawyer. Ask Neethi anything about your rights — free, instant,
  24×7. Talk to a verified lawyer only when you need one, from ₹500."*
- Three pill badges: "Free AI answers" / "Consults from ₹500" / "24×7, on your phone".

Right = auth card ("Get started" heading):
- Role switch pill-tabs: **"I need legal help"** / **"I'm a lawyer"** (drives `role: 'user' | 'lawyer'`,
  which changes copy throughout the rest of the app — see per-role nav below).
- Subheading changes with role: "Sign in with your mobile number" (user) / "Sign in to your lawyer portal"
  (lawyer).
- Mobile number: `+91` prefix chip + input, placeholder `98765 43210` → **"Get OTP"**.
- After requesting: OTP input, label `Enter OTP (demo: 1234)`, placeholder `• • • •`, 8px letter-spacing →
  **"Continue"**. (Build note: the demo hardcodes `1234`; treat *any* 4-digit string as valid in the real
  backend rather than hardcoding one magic value — see guardrails doc.)
- "or" divider → guest button, label **"Explore as guest →"** (user role) / **"Explore as demo lawyer →"**
  (lawyer role).
- Footnote (11px, faint): "By continuing you agree to our Terms. Neethi gives legal information, not legal
  advice."

The **"Interactive demo"** pill and the **Desktop/Mobile** toggle in the top bar are artifact-only chrome for
previewing the mockup — they are not part of the real product; don't build them.

### 2. Chat (`screen: chat`) — home screen after login, role = user
- Screen header: 40px rounded-square "N" mark + **"Neethi — AI Legal Assistant"** + "Grounded in the Indian
  Penal Code & central acts" + green **"● Online"** pill, right-aligned.
- Disclaimer banner (warn tokens, pinned under header): *"Neethi provides legal information, not legal advice.
  For advice specific to your case, consult a lawyer."*
- Greeting message on load (`cta: false` — the only AI message without the lawyer CTA):
  > "Namaste! I'm Neethi, your free AI legal assistant. Ask me anything — theft, rent disputes, FIRs, divorce,
  > salary issues — and I'll explain your rights in plain language, grounded in Indian law."
- Message bubbles: user = navy filled, right-aligned, `20px 20px 6px 20px` radius, max-width 60%. AI = white
  bordered, left-aligned, `6px 20px 20px 20px` radius, max-width 70%, can include a bullet-point list (small
  navy dot + text) and a citation pill (green, e.g. `Sources: IPC §378, §379, §380`).
- **Every AI answer after the greeting sets `cta: true`, unconditionally** — the inline lawyer-CTA card is not
  gated by topic/keyword. Card copy: *"Need advice on your specific case?"* / *"Verified lawyers · first
  consult ₹500 (vs ₹5,000 typical)"* → **"Talk to a lawyer"** button (navigates to Lawyers screen). Do not
  make this conditional in the rebuild unless deliberately improving on the demo (see guardrails doc — that
  would count as a documented, flagged decision, not a silent one).
- Typing indicator: 3 pulsing dots (`dotpulse`), shown for `aiDelayMs` (demo default 900ms) before the answer
  appears.
- Quick-reply chips (shown only before the user's first message — `showChips = !userSent`), exactly these 4:
  1. "What is theft under IPC?"
  2. "My landlord won't return my deposit"
  3. "How do I file an FIR?"
  4. "Employer is holding my final salary"
- Composer: rounded input, placeholder *"Ask any legal question — theft, rent, divorce, FIR, salary…"* + navy
  pill **"Send"** button (Enter key also sends).

#### Rule-engine responses (verbatim — use as the free-tier/no-API-key fallback copy)

Matched by `message.toLowerCase().includes(keyword)`, first match wins, in this order:

1. **theft / stole / stolen**
   Lead: "Theft is defined under Section 378 of the Indian Penal Code and punished under Section 379. In plain
   language:"
   Points: "Dishonestly taking movable property out of someone's possession, without consent — that's theft." ·
   "Punishment: up to 3 years imprisonment, or a fine, or both." · "Theft in a dwelling house (Sec 380) carries
   up to 7 years."
   Citation: `Sources: IPC §378, §379, §380`

2. **deposit / landlord / rent**
   Lead: "Withheld security deposits are one of India's most common disputes. Your options:"
   Points: "Send a written demand (email/WhatsApp counts) citing the deposit clause in your rent agreement." ·
   "Under the Model Tenancy Act 2021, deposits must be returned within one month of vacating." · "If ignored,
   file in consumer or civil court — small claims usually resolve in 3–6 months."
   Citation: `Sources: Model Tenancy Act 2021`

3. **fir / police / complaint**
   Lead: "Filing an FIR is free, and the police are duty-bound to register it. Steps:"
   Points: "Go to the police station with jurisdiction over where the incident happened." · "State the facts
   orally or in writing — under CrPC Section 154 a cognizable offence must be registered." · "Collect your
   free FIR copy. If refused, escalate to the Superintendent of Police or file online (most states allow it)."
   Citation: `Sources: CrPC §154`

4. **divorce / marriage**
   Lead: "For divorce, the route depends on your marriage law. The most common path:"
   Points: "Mutual consent divorce (Sec 13B, Hindu Marriage Act) needs 1 year of separation and takes 6–18
   months." · "Contested divorce requires grounds — cruelty, desertion, adultery — and takes longer." ·
   "Maintenance, custody and property can be settled by agreement to speed things up."
   Citation: `Sources: Hindu Marriage Act §13B`

5. **salary / notice / employer / job**
   Lead: "Notice-period and final-settlement disputes are governed by your contract plus state Shops &
   Establishments law:"
   Points: "Earned salary can never be withheld — it is legally recoverable." · "Notice-period buyout depends
   on your contract; many employers allow it." · "A lawyer's legal notice resolves most of these without going
   to court."
   Citation: `Sources: State S&E Acts, Payment of Wages Act`

6. **fallback** (no keyword matched)
   Lead: "Here's some general guidance while I understand your situation better:"
   Points: "Keep every document, message and receipt related to the issue — evidence wins cases." · "Write
   down the timeline of events; dates matter a lot in law." · "Most disputes have a limitation period, so
   acting early protects your rights."
   Citation: *(none)*

### 3. Lawyers directory (`screen: lawyers`)
Heading "Verified lawyers, honest prices" + sub "First consultation ₹500 · Your lawyer keeps 70% · Bar Council
verified". Filter chip row, exactly: **All / Criminal / Property / Family / Employment** (single-select,
default "All"). Responsive card grid (`minmax(340px,1fr)`): avatar initials on brand color, name + "✓
Verified" badge, specialty · years, meta pills (★ rating (reviews), languages, "Next: <slot>"), price row
`₹500` struck-through `₹5,000`, **Book** button.

Seed lawyers (`cat` = filter category key):
1. **Adv. Meera Krishnan** (MK, avatar `#1F3A5F`) — cat `Criminal`, Criminal Law, 12 yrs, English/Tamil,
   ★4.9 (312 reviews), next slot "Today 6:00 PM"
2. **Adv. Rohan Deshpande** (RD, avatar `#2F6B57`) — cat `Property`, Property & Tenancy, 8 yrs,
   English/Hindi/Marathi, ★4.8 (204), "Today 7:30 PM"
3. **Adv. Sana Qureshi** (SQ, avatar `#8A6A2E`) — cat `Family`, Family Law, 10 yrs, English/Hindi/Urdu,
   ★4.9 (287), "Tomorrow 11:00 AM"
4. **Adv. Arjun Nair** (AN, avatar `#52606D`) — cat `Employment`, Employment & Corporate, 6 yrs,
   English/Malayalam, ★4.7 (156), "Tomorrow 4:00 PM"

### 4. Booking (`screen: booking`)
Back link "← Back to lawyers" → lawyer summary card → "Pick a day" (5 day pills) → "Pick a time" (6 slot
pills) → "Consultation type" (Video call / Phone call toggle, default Video). Right rail: Summary card with
lawyer/when/type, fee breakdown (consultation fee ₹500, "Lawyer receives (70%)" ₹350, "Platform & GST:
included"), total ₹500, **"Proceed to pay ₹500"** (grey/disabled "Pick a time slot first" until a slot is
picked), footnote "Free cancellation up to 2 hours before".

Day pills: dynamically generated — "Today" then the next 4 days as `<weekday-abbrev> <day-of-month>
<month-abbrev>` (e.g. "Mon 20 Jul"), computed from the current date, not a hardcoded list. Time-slot pills are
fixed: `10:00 AM, 11:30 AM, 2:00 PM, 4:30 PM, 6:00 PM, 7:30 PM`.

### 5. Payment (`screen: pay`)
Two cards: Order summary (type/lawyer/when, total ₹500, green refund-guarantee note: "100% refund if the
lawyer doesn't join. Money is held safely until your consult completes.") and "Pay securely" (badge "Razorpay
· simulated", radio-style method rows):
- **UPI** — "GPay, PhonePe, Paytm — instant"
- **Card** — "Credit or debit, all networks"
- **Netbanking** — "All major Indian banks"

→ **"Pay ₹500"** button → spinner state "Processing payment…" (1.6s in the demo) → routes to Success.

### 6. Success (`screen: success`)
Centered check badge, "Booking confirmed!", "Payment of ₹500 received · Booking ID NX-YYYYMMDD-###" (demo
example: `NX-20260716-041` — format is `NX-` + date + 3-digit sequence), detail card (lawyer/when/"Join via:
Video link (sent by SMS & email)"), actions **"View my consultations"** / **"Back to chat"**.

### 7. User dashboard (`screen: dashboard`)
"Namaste, {first name}" ("friend" if a phone number was used to log in, "Guest" for guest login) + "Your legal
matters, all in one place". 3 stat cards: questions answered free (count of user messages sent), lawyer
consults booked (0 or 1 in the demo — single active booking), saved vs typical fees (green — `₹4,500` once a
booking exists, i.e. ₹5,000 typical minus ₹500 paid; `₹0` otherwise). "Upcoming consultation" card, or empty
state: "No consultations yet" / "Ask Neethi first — it's free. Book a lawyer only if you need one." →
**"Ask Neethi"**. "Recent questions" list: the user's last 3 chat questions (most recent first, "just now")
plus 2 canned older examples ("Can my society stop me from keeping a pet?" — 2 days ago; "Traffic challan paid
twice — refund?" — last week), capped at 4 rows total.

### 8. Lawyer portal (`screen: portal`, role=lawyer home)
Header: "Lawyer Portal", "Adv. Meera Krishnan · Criminal Law · Bar Council TN/1123/2014", availability toggle
pill (green dot "Available for consults" / grey dot "Unavailable" — toggles `available` state, defaults to
available). 4 stat cards: earnings this month (**₹42,700**, green), consultations (**61**), avg rating
(**★4.9**, 312 reviews), share (**70%** · "payout every Friday"). "Consultation requests" list: client
initials/name/topic/time + "you receive ₹350", **Accept**/**Decline** buttons while pending, or a status pill
once decided ("Accepted ✓" green / "Declined" grey), or a **Respond** button (navy) once accepted, which jumps
to that client's thread in Lawyer Messages. Footer info strip (soft-blue): "Next payout: ₹9,800 on Friday, 17
Jul · UPI to meera@okaxis · AI pre-briefs each client so your consults start 60% faster."

Seed requests (all `status: pending` initially): Priya S. (Tenant deposit dispute, Today · 6:00 PM), Vikram M.
(Cheque bounce NI Act §138, Tomorrow · 11:00 AM), Anita R. (Mutual consent divorce query, Tomorrow · 4:00 PM).

### 9. Lawyer messages (`screen: lmsgs`)
Two-pane inbox. Left: thread list (avatar initials on soft-blue, name, topic, unread dot). Right: active
thread — header (client initials/name + "{topic} · paid consult · ₹350 to you" + **"Start video call"**
button), message bubbles (client = white bordered, left; lawyer = green filled `#2F6B57`/`#EAF3EE`, right),
reply composer ("Reply to {name}…" + **Reply** button).

Seed threads (nav label shows unread count, e.g. "Client Messages (2)"):
1. **Priya S.** (PS) — Tenant deposit dispute, unread. Client: "Sir, my landlord in Chennai is refusing to
   return my ₹50,000 deposit even 2 months after I vacated. Neethi told me about the Model Tenancy Act — can
   you help me send a legal notice?"
2. **Vikram M.** (VM) — Cheque bounce (NI Act §138), unread. Client: "A cheque of ₹1.2L issued to me bounced
   twice. What are my next steps before the 30-day notice window closes?"
3. **Anita R.** (AR) — Mutual consent divorce, read. Client: "We both agree to separate amicably. How long
   will mutual consent divorce take, and which documents should we prepare?" Lawyer reply already in thread:
   "With mutual consent and 1 year of separation, expect 6–12 months. Start collecting: marriage certificate,
   address proofs, and a draft settlement on maintenance and assets. We can cover details on our call."

### 10. Lawyer profile (`screen: lprofile`)
"My profile" / "This is what clients see when they find you". Card: 68px avatar, name + "✓ Bar Council
verified" badge, "Criminal Law · 12 years · English, Tamil · Chennai", **Edit** button, bio: "12 years
defending clients across Chennai's sessions and High Court. Specialist in theft, cheating (§420) and bail
matters. Known for clear, jargon-free advice — most first consults end with a concrete action plan." 3
mini-stats (★4.9 · 312 reviews, ₹500 first consult · "you get ₹350", 61 consults this month). KYC/payout strip
(green): "Bar Council reg: TN/1123/2014 · KYC complete · Payouts to meera@okaxis".

## Sidebar navigation (desktop app shell)

Role **user**: "Chat with Neethi" (→ chat) / "Find a Lawyer" (→ lawyers, also highlighted during
booking/pay/success) / "My Consultations" (→ dashboard). Below the nav: **"Neethi Plus"** upsell card
(user role only) — "Unlimited AI chats + 1 free consult every month" — **₹299/month**. Below that: avatar +
name + "Sign out".

Role **lawyer**: "Dashboard" (→ portal) / "Client Messages" or "Client Messages (N)" when N threads are
unread (→ lmsgs) / "My Profile" (→ lprofile). No "Neethi Plus" card for lawyers.

## Mobile layout
Same screens, single-column inside a phone frame in the demo (frame itself is artifact-only chrome — ignore
it). Bottom tab bar, exactly: **Chat / Lawyers / Bookings / Profile**, active tab shown via a 26px navy bar
above the label + bold navy label text (inactive = light grey bar, `#98A2B3` label). Booking success is its
own tab state ("Booked!" checkmark confirmation, → "View bookings") before landing on the Bookings tab.

> The demo's desktop/mobile toggle and phone-frame chrome are **preview-only** artifact controls; the real app
> does not need a device switcher — build one genuinely responsive layout (sidebar + topbar ≥ `md` breakpoint,
> bottom tab bar below it) using the same screens and tokens described above.

## Notable copy/voice
- Login headline: "Legal help, finally within reach."
- Disclaimer (always visible in chat): "Neethi provides legal information, not legal advice. For advice
  specific to your case, consult a lawyer."
- Pricing story repeated everywhere: **₹500 first consult** (vs "typical" ₹5,000), lawyer keeps **70%**
  (₹350), platform/GST "included" in the rest.
- Subscription upsell (sidebar card, desktop, user role): "Neethi Plus" — "Unlimited AI chats + 1 free consult
  every month" — **₹299/month**. (Demo does not implement a purchase flow for this — it's a static card.)

## What this implies for the build
- Product/brand name = **Neethi-X**; assistant persona = **Neethi** — see "Naming" above, don't collapse them.
- Frontend must ship the two font families and the token table above as CSS variables / Tailwind theme
  extension — not re-derive a new palette.
- Backend's chat endpoint should implement the rule engine above (verbatim lead/points/citation text) as the
  free-tier fallback, and call the Anthropic API for richer answers only when `ANTHROPIC_API_KEY` is
  configured — the product's whole pitch is "free AI answers, paid human is optional," so the app must work
  end-to-end with zero API key configured.
- Anything about backend/data-model behavior the demo doesn't show (it's frontend-only, in-memory state) is
  **not covered by this document** — follow `.claude/NEETHI_BUILD_GUARDRAILS.md`'s no-assumption protocol for those
  gaps rather than inventing behavior silently.
