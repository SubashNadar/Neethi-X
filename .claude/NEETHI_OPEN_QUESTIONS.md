## Real Razorpay integration — backend implementation detail (2026-07-18)

**Question:** The architect spec says `create_order` should reuse an existing
`PaymentOrder` (same booking, `status == "created"`, has a `razorpay_order_id`) on
retry instead of creating a duplicate Razorpay order, but doesn't say what to do if
the retry request specifies a different `method` (e.g. user picked "card" first, hit
back, picked "upi" on retry) than the one stored on the reused row.

**Default chosen:** Update `order.method` to the latest requested value before
returning the reused order — `method` is advisory-only (passed to Razorpay Checkout as
`prefill.method`), so keeping it in sync with the user's latest choice is strictly more
correct than leaving a stale value, and doesn't affect the Razorpay order itself (which
is already created and immutable). Low-risk/reversible: a one-line change to stop
updating it if this turns out to be unwanted.

**Implemented at:** `backend/src/neethi/routers/payments.py` (`create_order`, the
`existing is not None` branch).

---

## Real Razorpay integration — scoping decisions with user, 2026-07-18

Two product-behavior-changing decisions (guardrails §2 point 4 — not silently-decidable defaults),
confirmed with the user before any implementation:

1. **UX deviation, confirmed acceptable**: real Razorpay payment collection requires their own
   hosted Checkout.js modal for entering card/UPI/netbanking details, which necessarily takes over
   from the current custom-built method-picker screen in `PaymentPage.tsx` (which today matches the
   demo mockup exactly, including the "Razorpay · simulated" badge). The existing screen can remain
   as a pre-confirmation step, but real payment-detail entry happens inside Razorpay's own UI, not
   ours. This is a real, user-visible change from the demo — user confirmed it's fine.
2. **Lawyer payout model: manual settlement**, not Razorpay Route. Razorpay Orders/Checkout only
   moves money from the user into the business account — it does not auto-split the 70/30 to
   lawyers. User chose to handle lawyer payouts manually/periodically (using the existing
   `lawyer_share` field as the record of what's owed) rather than integrating Razorpay Route, which
   would require each lawyer to complete their own linked-account KYC. Route is not being built.

Not yet implemented — spec pass with neethi-architect next, then backend/frontend build.

### Architect spec pass, same day — 4 more decisions

1. **Unset Razorpay keys → `503` at request time**, not a boot failure. App keeps booting with
   zero config (free chat/lawyers/dashboard unaffected); only the payment endpoints themselves
   return `503` until keys are set. Confirmed with user.
2. **Payment-screen badge copy**: "Razorpay · simulated" → **"Razorpay · secure"** once this is a
   real integration (the old text becomes false). Confirmed with user.
3. **Method-picker UI kept**, repurposed to pass the selected method into Razorpay's checkout modal
   as `prefill.method` rather than removed — preserves demo screen fidelity while giving the picker
   a real function now that it no longer collects payment data itself. Low-risk default, not
   separately confirmed.
4. **`payment.failed` webhook leaves the booking at `pending_payment`** (retryable) rather than a
   terminal failed state, so the user can retry payment from the same screen. Low-risk/reversible
   default, not separately confirmed.

Full technical spec (model/schema/endpoint/webhook/frontend details) produced by neethi-architect
this session; implementation to follow.

---

## Resolution pass with user, 2026-07-18

All 9 entries below were walked through with the user directly. Outcomes:

1. **Mobile sign-out/tab mapping** — OVERRIDDEN. User wants standalone Bookings and Profile
   mobile screens instead of both routing to `/dashboard`. Clarified: since the UI reference
   only documents the tab *labels*, not screen content, build both using only real, already-
   sourced account/booking data (no invented copy) — Bookings = standalone screen listing the
   user's real booking history; Profile = real account info (name/phone) + settings block +
   sign out.
2. **Messages endpoints** — KEPT as implemented.
3. **Mobile bottom-tab labels (lawyer role)** — KEPT as implemented.
4. **OTP-verify role scoping** — OVERRIDDEN. `otp/verify` will accept an optional `role`
   param mirroring `guest`. If `role=lawyer`, match against an existing seeded lawyer account
   by phone; if no match, reject the login. Does **not** auto-create new lawyer accounts via
   OTP.
5. **Demo-lawyer guest-login identity** — KEPT as implemented.
6. **Bio/Bar Council placeholders (3 lawyers)** — PENDING. User will supply real bio + Bar
   Council ID for Adv. Rohan Deshpande, Adv. Sana Qureshi, Adv. Arjun Nair. Placeholders stay
   in `seed.py` until received.
7. **Booking `client_name`/`client_initials`/`topic` fields** — KEPT as implemented.
8. **Message-thread unread-clearing** — OVERRIDDEN. Adding `PATCH /api/messages/threads/{id}/read`
   as the *only* way to clear unread; removing the implicit clear-on-view/reply side effect
   (user explicitly chose "explicit only" over keeping both).
9. **JWT expiry / phone normalization / booking-ref sequence** — PARTIALLY OVERRIDDEN. JWT
   expiry shortened to 24h **and** real server-side logout invalidation added (a revocation
   check on every authenticated request, not just a shorter expiry) — user explicitly asked
   for logout to work immediately, which a stateless-only JWT can't do. Phone normalization
   (last-10-digits) and booking-ref format (`NX-YYYYMMDD-###` per UTC day) are unchanged.

Following the architect's spec pass, two more decisions were confirmed with the user:
- Seeded lawyer (Meera Krishnan) gets phone `1234567890` attached so role-based OTP login is
  actually reachable end-to-end, not just a correct-but-unreachable capability.
- Mobile Profile screen stays minimal (account info + sign-out only) — no Neethi Plus upsell
  card relocated onto mobile.

Implementation tracked in this session; see `CLAUDE.md` episodic log for the build report once
done.

---

## Mobile sign-out affordance + Bookings/Profile tab mapping (frontend build, 2026-07-17)

**Question:** The demo's mobile bottom tabs are Chat/Lawyers/Bookings/Profile, and its "Profile" tab shows a
mobile-only settings screen (language, saved answers, help & support) that has no desktop equivalent in the 10
core screens `NEETHI_UI_REFERENCE.md` lists. Meanwhile sign-out lives only in the desktop sidebar footer, which
this build correctly hides on mobile in favor of the bottom tab bar — but that means, unmodified, a mobile user
would have no way to sign out at all.

**Default chosen:** (1) Both the "Bookings" and "Profile" bottom tabs route to the existing User Dashboard page
(`/dashboard`) rather than inventing a new settings screen — low-risk since it reuses an existing, in-spec
screen instead of adding one. (2) Added a small sign-out control to the app header, visible only below the
`md` breakpoint (`MobileSignOut` in `frontend/src/components/AppShell.tsx`) — this is a genuine robustness
fix (guardrails §4: "real ... accessibility" is legitimate 110%), not a redesign, since without it mobile is a
dead end.

**Implemented at:** `frontend/src/components/AppShell.tsx`, `frontend/src/components/BottomTabBar.tsx`.

---

# Neethi Open Questions

Running log of decisions made where `NEETHI_UI_REFERENCE.md` / `NEETHI_API_CONTRACT.md` / the demo bundle
didn't specify an answer, per the no-assumption protocol in `.claude/NEETHI_BUILD_GUARDRAILS.md` §2. Newest entries at
the top. Each entry: the question, the default chosen and why it's low-risk/reversible, and where it's
implemented.

## Messages endpoints missing from NEETHI_API_CONTRACT.md (frontend build, 2026-07-17)

**Question:** The Lawyer Messages screen (`lmsgs`) needs to list threads, open a thread, and reply, but
`NEETHI_API_CONTRACT.md` v1 had no `/api/messages/*` endpoints — the demo is frontend-only in-memory state so
this was never specified.

**Default chosen:** Added a small REST shape (`GET /api/messages/threads`, `GET
/api/messages/threads/{id}`, `POST /api/messages/threads/{id}/reply`) to `NEETHI_API_CONTRACT.md` under a new
"Messages" section, modeled on the existing Bookings/Dashboard shapes (auth + role=lawyer, plain JSON). This is
low-risk/reversible: it's additive, doesn't touch any existing endpoint, and matches the seed data in
`NEETHI_UI_REFERENCE.md` §9 (3 threads: Priya S., Vikram M., Anita R.) exactly.

**Implemented at:** `frontend/src/lib/api.ts` (`getMessageThreads`, `getMessageThread`, `replyToThread`),
consumed by `frontend/src/pages/LawyerMessagesPage.tsx`. Backend should implement to match — flagging for the
backend agent to pick up since it was written by the frontend side of the build.

---

## Mobile bottom-tab-bar labels for lawyer role (frontend build, 2026-07-17)

**Question:** `NEETHI_UI_REFERENCE.md` documents the mobile bottom tab bar as exactly "Chat / Lawyers /
Bookings / Profile", but the demo's mobile mode (`agents/tools/extracted/template.html` mTabs array, ~line
1067) only ever renders those 4 tabs regardless of role — the demo's mobile preview was never exercised in
lawyer role, so there's no source for what a lawyer sees on a narrow viewport.

**Default chosen:** For role=lawyer on mobile, show 3 bottom tabs mirroring the desktop sidebar labels
exactly: Dashboard / Messages / Profile (routing to `/portal`, `/messages`, `/profile`). Low-risk/reversible:
it only affects the lawyer role's mobile nav labels, doesn't touch any user-role screen or copy the reference
does specify, and can be swapped for a different label set in one place if the real demo/spec turns out to say
otherwise.

**Implemented at:** `frontend/src/components/BottomTabBar.tsx`.

---

---

## Backend build (2026-07-17)

1. **Q: Does `POST /api/auth/otp/verify` support logging in as `role: "lawyer"`?**
   `NEETHI_API_CONTRACT.md`'s otp/verify request is `{ phone, otp }` — no `role` field,
   unlike `POST /api/auth/guest` which does take one.
   Default: phone/OTP login always resolves to (or creates) a `role="user"` account. The
   lawyer persona is only reachable via `POST /api/auth/guest {role:"lawyer"}`, which
   returns the single canonical seeded demo-lawyer account (Meera Krishnan) — matching
   the fact that the UI reference's Lawyer Portal header is hardcoded to her identity
   and no other lawyer login path is shown in the demo. Low-risk/reversible: adding a
   `role` param to otp/verify later, or a real per-lawyer account model, is additive.
   Implemented: `backend/src/neethi/routers/auth.py` (`verify_otp`, `guest_login`).

2. **Q: What identity/data does "Explore as demo lawyer" (guest, role=lawyer) map to?**
   Default: always the same seeded `User` row linked to the Meera Krishnan `Lawyer`
   record (one canonical demo-lawyer account, reused across guest-lawyer logins rather
   than minted fresh each time), so portal stats/requests stay consistent across a
   session. Directly sourced from UI reference §8 (portal header hardcoded to her
   name/spec/Bar Council ID), not a fabrication. Implemented: `backend/src/neethi/seed.py`
   (`demo_lawyer_user`), `backend/src/neethi/routers/auth.py` (`guest_login`).

3. **Q: `bio` / `bar_council_id` for the 3 lawyers other than Meera Krishnan** — the UI
   reference only gives a detailed bio + Bar Council registration for Meera (§10's
   Lawyer Profile screen shows only her).
   Default: a clearly generic, non-sourced-looking placeholder — `bio` is a short
   templated sentence built only from already-known fields (years, specialty); an actual
   fake Bar Council ID string was deliberately avoided (guardrails explicitly forbid
   presenting a fabricated registration number as if sourced). Placeholder text:
   `"Bar Council verified — registration on file"`. Low-risk: swap in real data per
   lawyer whenever it's sourced. Implemented: `backend/src/neethi/seed.py`
   (`GENERIC_BAR_ID`, `_generic_bio`).

4. **Q: `Booking` had no field for the lawyer-portal request's client name/initials or
   topic** (UI reference §8 needs "client initials/name/topic/time" per request;
   `Booking` only exposed `user_id`, and no `GET /api/users/{id}` endpoint exists to
   resolve it).
   Default (contract deviation, documented and applied to `NEETHI_API_CONTRACT.md`
   directly per guardrails §1): added `client_name`, `client_initials`, `topic` (all
   nullable) onto `Booking`, mirroring the existing pattern where `lawyer: LawyerCard`
   is already embedded rather than left as an id-only reference. `topic` is only ever
   populated for the 3 seeded demo requests — the real booking flow (UI reference §4)
   never collects a topic, so organically created bookings leave it `null`.
   Implemented: `backend/src/neethi/models.py` (`Booking`), `backend/src/neethi/schemas.py`
   (`BookingOut`), `backend/src/neethi/routers/bookings.py`.

5. **Q: Opening a lawyer-messages thread / replying to it — should it clear the unread
   flag?** No "mark read" endpoint exists in the `Messages` section the frontend build
   added to `NEETHI_API_CONTRACT.md`.
   Default: `GET /api/messages/threads/{id}` and `POST /api/messages/threads/{id}/reply`
   both clear `unread` on that thread as a side effect — mirrors the UI reference's
   unread-dot / "Client Messages (N)" badge behavior (§9), and is the only place to do
   it without a dedicated endpoint. Low-risk: a separate `PATCH .../read` endpoint can
   be added later without removing this behavior. Implemented:
   `backend/src/neethi/routers/messages.py` (`get_thread`, `reply_to_thread`).

6. **Q: JWT expiry, phone-number validation strictness, booking-ref daily-sequence
   reset** — none specified anywhere (demo has no real session/backend).
   Defaults: JWT expires in 7 days; phone numbers are normalized to their last 10 digits
   (no stricter format check); booking refs are `NX-YYYYMMDD-###` with the sequence
   counted per UTC calendar day. All low-risk/reversible config-level choices.
   Implemented: `backend/src/neethi/config.py` (`JWT_EXPIRE_MINUTES`),
   `backend/src/neethi/auth.py` (`normalize_phone`), `backend/src/neethi/routers/bookings.py`
   (`_next_ref`).
