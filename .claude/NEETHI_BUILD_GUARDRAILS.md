# Neethi Build Guardrails

Mandatory reading for every agent (subagent or the orchestrating session) before writing any Neethi code —
architecture, backend, or frontend. These rules exist because a fabricated detail that "looks right" is worse
than an obviously missing feature: it ships silently and only surfaces when a user or the demo comparison
catches it.

## 1. Source-of-truth hierarchy

When two sources disagree, the higher one wins:

1. **`.claude/NEETHI_UI_REFERENCE.md`** — the practical top of the hierarchy: a careful transcription of
   `Neethi-X Demo.html` (repo root — a packed interactive-artifact bundle; the readable markup/JSX is base64/gzip
   inside it, not plain HTML). No decode tooling for that bundle is checked into this repo, so treat the
   reference doc as reliable for anything it states specifically (exact copy, exact hex, exact list); treat
   silence on a topic as "not yet verified, ask/log it," not as "doesn't matter." Don't attempt to re-decode
   the raw HTML yourself unless you already have a working method — a wrong-but-confident decode is worse than
   deferring to the reference doc.
2. **The actual `backend/` and `frontend/` code** — authoritative for the current API contract (there is no
   longer a separate contract doc; `backend/src/neethi/schemas.py` + `routers/` and `frontend/src/types.ts` +
   `lib/api.ts` are the seam). If backend and frontend disagree with each other, that's a real bug to fix, not
   a doc to consult.
3. **This file** — process rules.

Nothing else is authoritative. Do not infer UI details from generic SaaS conventions, other legal-tech apps,
or "what's usually done" when the UI reference actually shows the answer — go look.

## 2. No-assumption protocol

If you hit a decision that isn't settled by the hierarchy above (the demo is frontend-only with in-memory
state, so most backend *behavior* — validation rules, exact error messages, token expiry, rate limits, retry
policy, exact DB constraints — is genuinely unspecified):

1. **Check the source first.** Re-read `.claude/NEETHI_UI_REFERENCE.md` in full before assuming it's actually
   unspecified — it might just be a detail you haven't looked for yet.
2. **If still unspecified, don't silently invent it.** Pick the smallest, most obviously-reversible default
   that lets you keep moving, and log it in **`.claude/NEETHI_OPEN_QUESTIONS.md`** with:
   - The specific question
   - The default you chose and why it's low-risk/reversible
   - What file/line implements it (so a reviewer can find and override it in one place)
3. **Never fabricate specifics that look authoritative but aren't sourced** — a fake Bar Council registration
   format, a fake IPC section, a fake rate limit number presented as if it came from the demo. Generic,
   clearly-labeled placeholders ("dev default, override via env var") are fine; confident-sounding invented
   facts are not.
4. If a decision materially changes product behavior a user would notice (pricing, the 70/30 split, what the
   free tier includes), that is **not** a "smallest reversible default" — stop and flag it in
   `.claude/NEETHI_OPEN_QUESTIONS.md` as blocking rather than picking a direction.

## 3. Fidelity bar — "100%": nothing in the demo goes missing or drifts

Before reporting a screen/feature done, verify against `.claude/NEETHI_UI_REFERENCE.md` that you have, verbatim
where the reference gives verbatim text:

- [ ] Every screen listed in the UI reference exists (Login, Chat, Lawyers, Booking, Payment, Success, User
      Dashboard, Lawyer Portal, Lawyer Messages, Lawyer Profile) for both roles where applicable.
- [ ] Exact copy: headlines, disclaimers, button labels, empty states — not paraphrased.
- [ ] Exact design tokens: colors, fonts, radii, shadows, animation keyframes from the token table — not
      "close enough" substitutes.
- [ ] Exact seed data: the 4 lawyers, the 3 lawyer-portal requests, the 3 message threads, with their exact
      names/topics/amounts.
- [ ] Exact rule-engine chat responses (lead sentence + points + citation) reproduced verbatim as the
      zero-API-key fallback.
- [ ] Behavioral details that are easy to mis-simplify: the lawyer-CTA card appears on **every** AI chat
      answer except the greeting (not "when the topic needs a lawyer"); quick-reply chips disappear after the
      first user message; nav labels differ by role; "Neethi-X" vs "Neethi" naming (see UI reference
      "Naming" section) is not interchangeable.
- [ ] Responsive behavior: real sidebar+topbar / bottom-tab-bar responsiveness, not a recreation of the demo's
      device-preview toggle (that chrome is explicitly out of scope — see UI reference).

## 4. The "110%" bar — where to legitimately exceed the demo

The demo is a static, frontend-only mockup with fake in-memory state (a page refresh loses everything, OTP
always accepts `1234`, payments are simulated, "AI" is a keyword table). The real product should be **more
capable and more robust than the demo only along dimensions the demo structurally can't cover**, never by
changing the visual design or UX flow:

**Legitimate 110% (do these):**
- Real persistence (SQLite), real auth (JWT), real input validation, real error/loading/empty states on every
  network call, real accessibility (keyboard nav, ARIA labels, focus management) — the demo has none of this
  because it's a prototype.
- The rule-engine chat as a genuine standalone feature (works with zero config) *plus* an optional real Claude
  API path for richer answers — additive, not a replacement for the fallback.
- Reasonable, clearly-logged defaults for things the demo doesn't specify (see §2) — a real JWT expiry, a real
  password/OTP length check, etc.
- Basic security hygiene the demo (a client-only mockup) has no reason to have: parameterized queries, secrets
  from env vars not hardcoded, CORS locked to the actual frontend origin.

**Not "110%" — these are silent scope changes, don't do them without flagging in `.claude/NEETHI_OPEN_QUESTIONS.md`:**
- Redesigning a screen's layout, copy, or color because you think it reads better.
- Adding features the demo doesn't show (new screens, new nav items, a real payment gateway integration,
  a real SMS/OTP provider) unless explicitly requested.
- "Simplifying" the rule-engine responses instead of reproducing them verbatim.
- Silently dropping the OTP-demo convenience (`1234` always works) in favor of requiring a "real" OTP flow —
  that would break the product's own documented demo path.

## 5. Verification before reporting "done"

Do not report a build step complete without having actually run it:

- **Backend**: `uv sync` succeeds; the server boots (`uv run uvicorn neethi.main:app`); hit the touched
  endpoints (curl/httpx) and confirm both status code and response shape match what `frontend/src/lib/api.ts` /
  `types.ts` expect.
- **Frontend**: `npm run build` succeeds with zero TypeScript errors; if the backend is reachable, exercise the
  touched screen and confirm it renders without console errors.
- Re-check the relevant rows of the §3 fidelity checklist for whatever you just touched, not just "it compiles."
- If you could not verify something (e.g. no `ANTHROPIC_API_KEY` available to test the live-Claude chat path),
  say so explicitly in your report rather than implying it was tested.

## 6. Reporting

End every build task with: what you built (files touched), what you verified (commands run + results), and
any entries you added to `.claude/NEETHI_OPEN_QUESTIONS.md`. A report that only says "done" without these three is
incomplete.
