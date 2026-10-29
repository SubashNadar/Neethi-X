# Nya-AI decisions

Product decisions that the code depends on. Newest first. Older entries came from the app's earlier
life under another name; the full history is in git.

## Public information pages (2026-10-29)

Legal, About, Contact and Help are public routes, so a signed-out visitor can read the disclaimer and
privacy notice before signing in. The policy text is a draft and says so; an advocate must review it
before launch. Contact messages are stored by `POST /api/support` with no login and no automated
reply. Rights requests (data summary, deletion) go through the Contact form with the topic "Privacy
or data" until self-serve buttons exist. The About page states no library numbers, because the
indexed library does not exist yet.

## Orbit theme in the app (2026-10-29)

The whole app uses the Orbit dark theme through the Tailwind tokens: navy background with a brass
grid, brass primary buttons with dark text, Fraunces headings, JetBrains Mono for metadata. The chat
screen follows the Orbit layout: a reasoning-trace panel, ¶-numbered answers with numbered sources,
and a temporal-jurisdiction panel that works out IPC or BNS from the incident date (BNS from
1 July 2024). Until the agent is built, the trace shows only real steps of the keyword engine and a
"basic mode" note, and the IPC to BNS concordance shows four examples, labelled as such.

## Rebrand to Nya-AI (2026-10-29)

The app is now Nya-AI only. The Python package is `nya_ai`, the dev database is `nya_ai.db` and the
browser token key is `nya_ai_token` (existing local sign-ins end once). The old design export, UI
reference, build guardrails and pitch documents were removed. The Orbit design canvas is the UI
reference from now on: https://claude.ai/artifact/QYs5pGyrFcvACgYUWrUp1g

## Real Razorpay integration (2026-07-18)

- Payment details are entered in Razorpay's hosted Checkout.js modal. The method picker on the
  payment screen only pre-selects a tab (`prefill.method`).
- Lawyer payouts are settled manually from the `lawyer_share` field. Razorpay Route is not used.
- Unset Razorpay keys return `503` from the payment endpoints only; the rest of the app still runs.
- A `payment.failed` webhook leaves the booking at `pending_payment` so the user can retry.
- On retry, `create_order` reuses the existing `created` order and updates `method` to the latest
  choice.
- Badge copy is "Razorpay · secure".

## Resolution pass with user (2026-07-18)

1. Mobile Bookings and Profile tabs have their own screens (`/bookings`, `/account`). Profile is
   account info and sign-out only.
2. Lawyer message endpoints kept as built.
3. Lawyer mobile tab labels kept as built.
4. `POST /api/auth/otp/verify` takes an optional `role`. `role="lawyer"` matches an existing lawyer by
   phone and never creates one. The seeded lawyer Meera Krishnan has phone `1234567890`.
5. Guest login as the demo lawyer kept as built.
6. Pending: real bio and Bar Council ID for Adv. Rohan Deshpande, Adv. Sana Qureshi and Adv. Arjun
   Nair. Placeholders stay in `seed.py` until supplied.
7. `Booking` keeps `client_name`, `client_initials` and `topic`.
8. `PATCH /api/messages/threads/{id}/read` is the only way to clear a thread's unread flag.
9. JWTs expire after 24 hours, carry a `jti`, and `POST /api/auth/logout` revokes them at once.
   Phone numbers are normalised to the last 10 digits. Booking refs are `NX-YYYYMMDD-###` per UTC day.

## Messages endpoints (2026-07-17)

The lawyer inbox needed `/api/messages/*` endpoints that the first API plan did not list. Both the
backend and the frontend added the same shapes; they are kept.

## Mobile sign-out (2026-07-17)

Sign-out lives on the mobile Account screen, so a phone user is never stuck signed in.
