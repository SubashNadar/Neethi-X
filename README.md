# 🏛️ LEGALCHAT / NEETHI-X - AI-Powered Legal Assistant for India

**Your path to building a ₹1Cr+ business in 12 months, starting this week.**

---

## 🔧 Current build status (read this first)

The product's working name in code/UI is **Neethi-X** (assistant persona: **Neethi**) — the pitch deck and
roadmap below are the original business planning docs and still use "LegalChat" as the business name; that's
intentional, not stale. The actual build lives elsewhere now:

| For... | Go to |
|---|---|
| **Project memory — read this first in a new session** | [`CLAUDE.md`](CLAUDE.md) |
| The real UI spec (screens, copy, colors, fonts) | [`.claude/NEETHI_UI_REFERENCE.md`](.claude/NEETHI_UI_REFERENCE.md) |
| Rules every agent must follow (no invented behavior) | [`.claude/NEETHI_BUILD_GUARDRAILS.md`](.claude/NEETHI_BUILD_GUARDRAILS.md) |
| Logged decisions where the source was ambiguous | [`.claude/NEETHI_OPEN_QUESTIONS.md`](.claude/NEETHI_OPEN_QUESTIONS.md) |
| The FastAPI backend (uv project) — its `schemas.py`/`routers/` are the current API contract | [`backend/`](backend/) |
| The React/Vite frontend — its `types.ts`/`lib/api.ts` mirror that same contract | [`frontend/`](frontend/) |
| The multi-agent build system (native Claude Code subagents) | [`.claude/agents/`](.claude/agents/) |

The original mockup this is built from is [`Neethi-X Demo.html`](Neethi-X%20Demo.html) (repo root) — a packed
interactive-artifact bundle; no decode tooling for it is checked into this repo, so treat
`.claude/NEETHI_UI_REFERENCE.md` as the practical source rather than re-deriving from the raw file.

---

## 📚 What You Have

You've been given a complete blueprint to build, launch, and scale a legal tech startup. Here's what's included:

### 1. **LEGALCHAT_PITCH_DECK.md** ⭐ START HERE
   - **Purpose:** Present to your friend (or anyone)
   - **Content:** Problem → Solution → Market → Revenue → Why you'll win
   - **Time to read:** 10 minutes
   - **When to use:** This week (Day 1) when you talk to your friend
   - **Key takeaway:** "₹50K Cr market, ₹500 initial consultations, 30% margin = ₹4.5L/month by year 1"

### 2. **DEVELOPMENT_ROADMAP.md** 📋 YOUR TECHNICAL BIBLE
   - **Purpose:** Every technical detail you need
   - **Content:** 
     - Complete tech stack (all free/open source)
     - Database design
     - API specifications
     - Week-by-week development plan
     - How to test each component
     - Deployment strategy
   - **Time to read:** 20 minutes (skim) or 1 hour (deep dive)
   - **When to use:** While building (Days 3 onwards)
   - **Key sections:**
     - Week 1-10: MVP build plan
     - Open source tools (FastAPI, React, Pinecone, etc.)
     - Local development setup
     - Testing strategy

### 3. **Interactive Demo Artifact** 🎨 SHOW DON'T TELL
   - **Purpose:** Show what the app will look like/feel like
   - **Features:**
     - Chat interface with AI responses
     - Lawyer booking system
     - User dashboard
     - Lawyer portal
     - Payment flow
   - **When to use:** 
     - Demo to your friend after pitch deck
     - Show users during testing
     - Share in Reddit/Twitter threads
   - **Key benefit:** Visual proof your idea works

---

## 🎯 Your Week at a Glance

```
Sunday (Day 1):
├─ Read pitch deck (10 min)
├─ Walk through demo (5 min)
├─ Call friend + pitch (30 min)
└─ Set up GitHub (15 min)
   TOTAL: 1 hour

Monday-Friday (Days 2-7):
├─ Environment setup (2-3 hours)
├─ Backend boilerplate (3-4 hours)
├─ Frontend boilerplate (2-3 hours)
├─ Database design (2 hours)
├─ First API endpoint (2 hours)
└─ Frontend integration (2-3 hours)
   TOTAL: ~17 hours (~ 3 hours/day)

Weekend Review:
└─ Test everything, commit to GitHub
   TOTAL: 2 hours
```

**By end of week:** 
- ✅ Pitch delivered + feedback collected
- ✅ Working backend + frontend
- ✅ End-to-end chat feature
- ✅ Code on GitHub
- ✅ Ready to show to anyone

---

## 🚀 How to Use These Documents

### For Pitching (This Week)

**Order of presentation to your friend:**

1. **Show the demo first (2 min)**
   - "Here's what the app will do"
   - Let them click around the artifact

2. **Present the pitch deck (8 min)**
   - Problem: 90% Indians can't afford lawyers
   - Solution: AI first, affordable humans second
   - Market: ₹50K Cr opportunity
   - Revenue: ₹500 consultation × 30% margin = ₹150 profit
   - Why you: Full-stack skills, founder mentality

3. **Ask for feedback (10 min)**
   - Does this solve a real problem?
   - Would YOU use this?
   - Any lawyers you know?
   - Interest in co-founding?

4. **Share the roadmap**
   - "Here's the technical plan"
   - "Building week 1-4"
   - "Launch month 2"

---

### For Building (Week 2 Onwards)

**Daily workflow:**

```
Morning:
1. Check today's tasks (originally tracked in QUICK_START_CHECKLIST.md, since removed — see CLAUDE.md's
   episodic log for current priorities instead)
2. Copy code snippets
3. Run commands
4. Test locally

Afternoon:
5. Add features
6. Test again
7. Commit to GitHub with message

Evening:
8. Update progress file
9. Plan tomorrow
```

**When you get stuck:**

1. Check DEVELOPMENT_ROADMAP.md for similar problem
2. Read the "Debugging Tips" section
3. Search Stack Overflow
4. Ask in coding communities

---

## 📊 Key Numbers You Should Know

**Keep these handy:**

| Metric | Value | Notes |
|--------|-------|-------|
| **TAM** | ₹50,000 Cr | Total addressable market (legal services) |
| **DAU Target** | 100K | Day 1 active users by end of year 1 |
| **Avg consultation** | ₹1000 | User pays this to lawyer |
| **Your margin** | 30% | You keep ₹300 per consultation |
| **Lawyer payout** | 70% | Lawyer gets ₹700 |
| **Break-even** | 100 consultations/month | ~3-4 per day |
| **Month 6 projection** | ₹6L revenue | 200 consultations/day |
| **Month 12 projection** | ₹1.5Cr revenue | 500 consultations/day |
| **Year 1 profit** | ₹50L | Conservative estimate |

---

## 🛠️ Tech Stack Summary (100% Free)

**Frontend:**
- React.js (MIT)
- TailwindCSS (MIT)
- React Native for mobile (MIT)

**Backend:**
- FastAPI (MIT)
- PostgreSQL (Free)
- SQLAlchemy ORM (MIT)

**AI/LLM:**
- Claude API (pay-as-you-go)
- LangChain (MIT)
- Sentence Transformers (Apache 2.0)

**Database:**
- SQLite (local dev) / PostgreSQL (production)
- Pinecone (free tier: 1 index, 1M vectors)
- Redis (free tier available)

**Payments:**
- Razorpay (2% fee, free test mode)

**Hosting (when ready):**
- Local: Your laptop (free ♾️)
- Staging: Railway/Render (free tier)
- Production: Railway (~₹5K/month when profitable)

**Cost to MVP:** ₹0-50K (mostly your time)

---

## 🎓 Learning Path

If you're new to any of these, here's the order:

### Priority 1 (Must know):
- [ ] Python basics (loops, functions, async)
- [ ] FastAPI fundamentals
- [ ] React basics (components, hooks)
- [ ] SQL (SELECT, INSERT, UPDATE)

### Priority 2 (Should know):
- [ ] Authentication (JWT tokens)
- [ ] REST APIs
- [ ] React forms & state management
- [ ] Database design

### Priority 3 (Nice to know):
- [ ] RAG systems
- [ ] WebSockets (real-time chat)
- [ ] Payments APIs
- [ ] Deployment

---

## 📱 What Success Looks Like

### Week 1: Foundation
```
✅ Backend running
✅ Frontend running
✅ Database designed
✅ Chat works (hardcoded AI response)
✅ Code on GitHub
✅ Friend gave feedback
```

### Week 2-4: MVP
```
✅ Claude API integrated
✅ RAG with IPC working
✅ Lawyer booking system
✅ Razorpay integration
✅ User authentication
✅ Lawyer dashboard
✅ Beta testing with 50 users
```

### Month 2: Launch
```
✅ Product Hunt launch
✅ 1000+ users
✅ 50+ consultations/day
✅ ₹15K revenue
✅ All bugs fixed
✅ Ready for scale
```

### Month 3-12: Scale
```
✅ 10K+ users
✅ 200+ consultations/day
✅ ₹6L revenue
✅ Mobile app live
✅ 500+ lawyers
✅ Ready for Series A
```

---

## 💰 Unit Economics (Key for Investors)

**Cost to acquire user:** ₹15-20 (Google Ads, organic)  
**% of users who book lawyer:** 10%  
**Revenue per booking:** ₹1000 (user pays)  
**Your margin:** 30% = ₹300  
**LTV (lifetime value):** ₹300 × 5 bookings = ₹1500  
**LTV:CAC ratio:** 1500/20 = 75x ✅ (Ideal is >3x)

**This means:** For every ₹1 you spend on marketing, you make ₹75 back. This is **venture-scale** unit economics.

---

## 🤝 How to Get Help

### Problem Solving
- **Coding issues:** Stack Overflow, ChatGPT
- **Business questions:** Twitter, LinkedIn (DM founders)
- **Legal questions:** Consult actual lawyer (not AI) once you launch

### Community
- **Indie Hacker:** indiehackers.com
- **Twitter:** #buildinpublic hashtag
- **Reddit:** r/learnprogramming, r/startups
- **Discord:** Dev communities (search for "Web Dev" discord)

### If Stuck for 2+ Hours
- Ask in Stack Overflow (title: "FastAPI + React + PostgreSQL ...")
- Post in Dev.to community
- DM me with screenshot of the error

---

## 📞 Quick Reference

### Files
- **Pitch deck:** 5-10 min read, present Monday
- **Roadmap:** 1 hour read, reference while building
- **Checklist:** 5 min read, follow daily
- **Demo:** 2 min explore, show to anyone

### Time Investment
- **This week:** 15-20 hours (3 hours/day)
- **Weeks 2-4:** 20-25 hours/week
- **Month 2 onwards:** 15-20 hours/week (part-time while building)

### Critical APIs
- Claude API key: Get from console.anthropic.com
- Razorpay account: razorpay.com (free test mode)
- GitHub: github.com (free for public repos)

### Key Dates
- **Day 1:** Pitch to friend
- **Day 7:** Working skeleton
- **Week 4:** MVP ready
- **Month 2:** Public launch
- **Month 6:** ₹50K/month revenue
- **Month 12:** Series A ready

---

## 🚨 Do NOT Do

❌ Start coding before reading the pitch deck  
❌ Spend money on cloud hosting before MVP  
❌ Try to build mobile app before web works  
❌ Integrate payments before user auth works  
❌ Optimize before MVP ships  
❌ Copy competitors' UI/code  
❌ Ignore feedback from users  
❌ Build features no one asked for  

✅ **DO:** Build → Test → Ship → Iterate fast

---

## 🎯 Success Criteria

**Week 1:** ✅
- Friend thinks it's a good idea
- Can explain it in 2 sentences
- Code is on GitHub
- Backend + frontend running

**Week 4:** ✅
- Chat with AI working
- 50 beta users testing
- Feedback collected
- Main bugs fixed

**Month 2:** ✅
- Public launch
- 1000+ users
- 50+ consultations
- ₹15K revenue

**Month 6:** ✅
- 10K+ users
- ₹6L revenue
- Team of 2-3
- Mobile app live

**Month 12:** ✅
- 50K+ users
- ₹1.5Cr revenue
- Ready for Series A
- Funded by VCs

---

## 🙌 Why You'll Succeed

✅ **Problem:** 90% Indians need this (huge market)  
✅ **Solution:** AI is the perfect solution (reduces lawyer time 60%)  
✅ **Execution:** You have all the skills (full-stack, founder mentality)  
✅ **Timing:** Legal tech is hot (investors want this)  
✅ **Unit Economics:** Highly profitable (75x LTV:CAC ratio)  
✅ **Speed:** Can ship 10x faster than competitors  

**The only variable is execution. Execute well, and you win.**

---

## 📋 This Week's Homework

- [ ] Read pitch deck (10 min)
- [ ] Walk through demo (5 min)
- [ ] Schedule call with friend (today!)
- [ ] Set up development environment (tomorrow)
- [ ] Complete one day from checklist (start Tuesday)
- [ ] Share progress with friend (Friday)
- [ ] Commit to GitHub (Friday evening)
- [ ] Plan week 2 (Saturday)

---

## 🚀 You're Ready

You have:
✅ A billion-rupee idea  
✅ A clear market opportunity  
✅ Step-by-step instructions  
✅ Code examples  
✅ Testing strategy  
✅ Launch plan  

**All you need to do is execute.**

Start today. Ship by week 4. Scale from there.

---

<div align="center">

## This is Your Moment 🔥

**Don't wait for the perfect moment.  
Don't wait for more preparation.  
Don't wait for external validation.**

**Start now. Build in public. Ship fast.**

### The best time to plant a tree was 20 years ago.  
### The second best time is today.

---

**Questions?**  
Check the relevant document:
- **What's the current state / what's next?** → CLAUDE.md
- **How was it originally planned?** → DEVELOPMENT_ROADMAP.md
- **How to pitch it?** → LEGALCHAT_PITCH_DECK.md
- **What should it look like?** → `.claude/NEETHI_UI_REFERENCE.md` / `Neethi-X Demo.html`

---

## Let's Build This 💪

**You have everything you need.**  
**Now, go execute.**

</div>
