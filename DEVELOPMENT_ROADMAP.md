# 🛠️ LEGALCHAT - Development Roadmap & Open Source Stack

**⚠️ Pre-build plan, not current state.** This was written before any code existed and describes a stack the
real build diverged from: `python -m venv`/`requirements.txt` (real backend is **uv-only**, no venv/pip
anywhere), PostgreSQL + Redis + Celery + Pinecone + LangChain RAG (real backend is **SQLite**, no Redis/
Celery/Pinecone, no RAG framework — chat is a verbatim rule-engine with an optional Claude API path), Twilio
OTP + SendGrid email (real backend: **any 4-digit OTP accepted**, no email integration). The `main.py`/
`ChatBox.jsx` snippets below don't match what's actually in `backend/`/`frontend/`. For the real setup and
architecture, start at [`CLAUDE.md`](CLAUDE.md) and [`backend/README.md`](backend/README.md) (there's no
separate API contract doc — `backend/src/neethi/schemas.py`/`routers/` and `frontend/src/types.ts`/`lib/
api.ts` are the current contract). Kept here for the original planning rationale, not as instructions to
follow.

## 📋 Complete Tech Stack (100% Open Source + Free Tier APIs)

### **Frontend Stack**

#### Web Application
```yaml
Framework:
  - React.js 18+ (MIT License)
  - TypeScript (Apache 2.0)
  
State Management:
  - Redux Toolkit (MIT)
  - Context API (React built-in)
  
UI Components:
  - TailwindCSS (MIT)
  - shadcn/ui (MIT) - Beautiful React components
  - Heroicons (MIT) - Icons
  - Framer Motion (MIT) - Animations
  
Real-time Chat:
  - Socket.IO Client (MIT)
  - React Query / TanStack Query (MIT)
  
Forms & Validation:
  - React Hook Form (MIT)
  - Zod (MIT) - Type-safe validation
  
Routing:
  - React Router v6 (MIT)
```

#### Mobile Application (React Native)
```yaml
Framework:
  - React Native (MIT)
  - Expo (MIT) - Easier than raw React Native
  
Native Modules:
  - React Native WebSocket (MIT)
  - React Native Video (MIT) - For video calls later
  
UI Kit:
  - NativeBase (Apache 2.0)
  - React Native Paper (MIT)
```

---

### **Backend Stack**

#### Web Server
```yaml
Framework:
  - FastAPI (MIT) - High performance, async Python
  
Database:
  - PostgreSQL (PostgreSQL License - Free)
    → Local: Docker image
    → Production: Free tier (Railway, Render)
  - SQLAlchemy ORM (MIT)
  - Alembic (MIT) - Database migrations
  
Caching & Session:
  - Redis (BSD) - Session management, caching
    → Local: Docker image
    → Free tier: Redis Cloud (free tier available)
  
Task Queue:
  - Celery (BSD) - Background jobs
  - Redis as broker
  
Web Server:
  - Uvicorn (BSD)
  - Gunicorn (MIT)
  
API Documentation:
  - Swagger UI (Apache 2.0) - Built into FastAPI
  - ReDoc (MIT) - Alternative documentation
```

---

### **AI/ML Stack**

#### Language Model & RAG
```yaml
Main LLM:
  - Claude API (Anthropic)
    → FREE: $5 free credits monthly
    → Pricing: ₹0.10-0.30 per message
    → Alternative: Ollama (free, local LLM)
  
Backup LLM:
  - Ollama (MIT) - Local LLM inference
    → Models: Mistral 7B, Llama 2 (free)
    → No internet needed
    → CPU/GPU required
  
Vector Database:
  - Pinecone (Free tier: 1 index, 1M vectors)
  - Alternative: Weaviate (MIT) - Open source
  - Alternative: Milvus (MIT) - Vector DB
  
Embeddings:
  - Sentence Transformers (Apache 2.0)
    → Local embeddings, no API calls
    → Free models: all-MiniLM-L6-v2
  - OpenAI embeddings (paid, but cheap)
  
RAG Framework:
  - LangChain (MIT)
  - LlamaIndex (MIT)
  - LangGraph (MIT) - Agentic workflows
  
Web Scraping (for IPC data):
  - BeautifulSoup4 (MIT)
  - Scrapy (BSD) - Full web scraping framework
  - Selenium (Apache 2.0) - For dynamic sites
```

---

### **Payment Stack**

#### Payment Gateway
```yaml
Primary:
  - Razorpay API (Free tier: unlimited transactions)
    → Integration: Node.js/Python SDK
    → Fees: 2% + ₹0 fixed (best in India)
  
Alternative:
  - PayU (Free test account)
  - Cashfree (Free test account)

Webhook Handling:
  - FastAPI endpoints
  - Verify signatures locally
```

---

### **Authentication & Security**

```yaml
Authentication:
  - FastAPI Security (built-in)
  - JWT tokens (PyJWT - MIT)
  - OAuth2 (built into FastAPI)
  - python-jose (MIT) - JWT creation
  
Password Hashing:
  - bcrypt (Apache 2.0)
  - passlib (MIT)
  
Phone OTP:
  - Twilio (Free trial: ₹1000 free credits)
  - Alternative: Free SMS APIs for India (MSG91 free tier)
  
Email:
  - SendGrid (Free tier: 100 emails/day)
  - Postmark (Free tier)
  - Mailgun (Free tier: 5K emails/month)
```

---

### **Development & DevOps**

```yaml
Version Control:
  - Git (GPL)
  - GitHub (Free private repos)
  
Development Environment:
  - Docker (Free Community Edition)
  - Docker Compose (MIT)
  - VSCode (MIT)
  
Testing:
  - pytest (MIT) - Backend testing
  - Jest (MIT) - Frontend testing
  - React Testing Library (MIT)
  - Cypress (MIT) - E2E testing
  
CI/CD:
  - GitHub Actions (Free for public repos)
  - GitLab CI (Free tier)
  
Code Quality:
  - Black (MIT) - Python formatting
  - ESLint (MIT) - JavaScript linting
  - Prettier (MIT) - Code formatting
  - Pre-commit (MIT) - Git hooks
  
Monitoring (Free Tier):
  - Sentry (Free tier: 5K errors/month)
  - LogRocket (Free tier - later)
  
Documentation:
  - MkDocs (BSD) - Project documentation
  - Storybook (MIT) - Component documentation
```

---

### **Hosting (Local to Cloud Migration Path)**

```yaml
Local Development:
  ✅ Your laptop (Docker + PostgreSQL)
  ✅ Free & unlimited

Staging/MVP Hosting:
  - Railway (MIT) - Free tier: $5/month
  - Render (Free tier: deployments)
  - Heroku (Paid now, but alternatives available)
  - Fly.io (Free tier: 3 shared-cpu-1x 256MB VMs)
  - Vercel (Free tier: Frontend deployment)
  - Netlify (Free tier: Frontend deployment)
  
Database Hosting:
  - Supabase (Free tier: 500MB PostgreSQL)
  - PlanetScale (MySQL, free tier)
  - Railway (Free tier: database)
  
Redis Hosting:
  - Redis Cloud (Free tier: 30MB)
  - Upstash (Free tier: Redis)
  
Vector DB:
  - Pinecone (Free tier: 1 index)
  - Supabase Vector (Free with PG)
  - Weaviate Cloud (Free tier)
```

---

## 🚀 Complete Setup Instructions (Local Development)

### **Prerequisites**
```bash
# Install these once
- Python 3.11+
- Node.js 18+
- Docker (optional, but recommended)
- Git
- VSCode + extensions (REST Client, Prettier, ESLint)
```

### **Step 1: Clone & Setup Backend**

```bash
# Clone repository
git clone https://github.com/yourusername/legalchat.git
cd legalchat

# Create Python virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install backend dependencies
pip install -r requirements.txt

# Create .env file
cat > .env << EOF
# Database
DATABASE_URL=sqlite:///./legalchat.db  # Local SQLite for dev
REDIS_URL=redis://localhost:6379

# AI/LLM
ANTHROPIC_API_KEY=your_claude_api_key_here  # Get from https://console.anthropic.com
OPENAI_API_KEY=optional_for_embeddings

# Payment
RAZORPAY_KEY_ID=test_key
RAZORPAY_KEY_SECRET=test_secret

# Email
SENDGRID_API_KEY=optional_for_emails

# JWT
SECRET_KEY=your-super-secret-key-change-in-production

# Environment
ENV=development
DEBUG=true
EOF

# Run migrations
alembic upgrade head

# Start backend
uvicorn main:app --reload --port 8000
```

### **Step 2: Setup Frontend**

```bash
cd frontend

# Install dependencies
npm install

# Create .env.local
cat > .env.local << EOF
REACT_APP_API_URL=http://localhost:8000
REACT_APP_ENV=development
EOF

# Start development server
npm start
# Opens http://localhost:3000
```

### **Step 3: Optional - Setup React Native**

```bash
# Install expo CLI
npm install -g expo-cli

cd mobile

# Install dependencies
npm install

# Start Expo
expo start

# Scan QR code with Expo Go app on your phone
```

### **Step 4: Optional - Local Database (Without Docker)**

```bash
# If you want SQLite (built-in, no setup needed)
# If you want PostgreSQL locally:

# macOS (Homebrew)
brew install postgresql
brew services start postgresql

# Create database
createdb legalchat

# Update .env
DATABASE_URL=postgresql://postgres:password@localhost/legalchat
```

---

## 📊 Project Structure

```
legalchat/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── models/
│   │   │   ├── user.py
│   │   │   ├── chat.py
│   │   │   ├── booking.py
│   │   │   └── payment.py
│   │   ├── schemas/
│   │   │   ├── user.py
│   │   │   ├── chat.py
│   │   │   └── booking.py
│   │   ├── routes/
│   │   │   ├── auth.py
│   │   │   ├── chat.py
│   │   │   ├── booking.py
│   │   │   └── payment.py
│   │   ├── services/
│   │   │   ├── ai_service.py
│   │   │   ├── rag_service.py
│   │   │   ├── payment_service.py
│   │   │   └── email_service.py
│   │   └── utils/
│   │       ├── security.py
│   │       └── validators.py
│   ├── tests/
│   ├── alembic/
│   ├── requirements.txt
│   ├── .env.example
│   └── docker-compose.yml
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Chat/
│   │   │   ├── Booking/
│   │   │   ├── Payment/
│   │   │   └── Dashboard/
│   │   ├── pages/
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── store/
│   │   ├── styles/
│   │   └── App.jsx
│   ├── public/
│   ├── package.json
│   └── .env.local.example
│
├── mobile/
│   ├── src/
│   ├── app.json
│   └── package.json
│
├── docs/
│   ├── API.md
│   ├── DATABASE.md
│   └── SETUP.md
│
└── README.md
```

---

## 🧪 Testing Strategy

### **Backend Testing (pytest)**

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=app

# Run specific test file
pytest tests/test_chat.py

# Example test
# tests/test_chat.py
def test_chat_message():
    client = TestClient(app)
    response = client.post(
        "/api/chat",
        json={"message": "What is theft under IPC?"}
    )
    assert response.status_code == 200
    assert "response" in response.json()
```

### **Frontend Testing (Jest + React Testing Library)**

```bash
# Run tests
npm test

# With coverage
npm test -- --coverage

# Watch mode
npm test -- --watch
```

### **E2E Testing (Cypress)**

```bash
# Install
npm install cypress --save-dev

# Open Cypress
npx cypress open

# Run headless
npx cypress run
```

---

## 📦 Week-by-Week Development Checklist

### **Week 1: Setup & Architecture**
- [ ] GitHub repo created
- [ ] Backend boilerplate (FastAPI)
- [ ] Frontend boilerplate (React)
- [ ] Database schema designed
- [ ] API documentation started
- [ ] Docker setup (optional)
- [ ] Environment variables configured

### **Week 2: Authentication & Core Backend**
- [ ] User registration (email/phone OTP)
- [ ] JWT authentication
- [ ] User model & database
- [ ] Password hashing
- [ ] Test user creation flow

### **Week 3: Chat Service**
- [ ] Chat message model
- [ ] WebSocket endpoint
- [ ] Basic AI integration (Claude API)
- [ ] Message persistence
- [ ] Conversation history

### **Week 4: RAG System**
- [ ] Download Indian Penal Code data
- [ ] Text chunking logic
- [ ] Embeddings (Sentence Transformers)
- [ ] Vector store (Pinecone/Weaviate)
- [ ] RAG retrieval endpoint
- [ ] Integration with chat

### **Week 5: Booking System**
- [ ] Lawyer model & profiles
- [ ] Booking model
- [ ] Calendar availability logic
- [ ] Booking creation flow
- [ ] Email notifications

### **Week 6: Payment Integration**
- [ ] Razorpay SDK setup
- [ ] Order creation endpoint
- [ ] Payment verification webhook
- [ ] Payment status tracking
- [ ] Invoice generation

### **Week 7: Frontend Polish**
- [ ] Chat UI component (React)
- [ ] Booking interface
- [ ] Payment flow UI
- [ ] Dashboard
- [ ] Mobile-responsive design

### **Week 8: Lawyer Dashboard**
- [ ] Lawyer registration
- [ ] Consultation list
- [ ] Accept/Decline bookings
- [ ] Earnings dashboard
- [ ] Chat integration

### **Week 9: Testing & Deployment**
- [ ] Unit tests (backend)
- [ ] Integration tests
- [ ] E2E tests
- [ ] Security audit
- [ ] Performance optimization

### **Week 10: Beta Launch**
- [ ] Deploy to staging (Railway/Render)
- [ ] Beta user testing
- [ ] Bug fixes
- [ ] Documentation
- [ ] Public launch

---

## 🔧 Essential Commands Cheatsheet

```bash
# Backend
python -m venv venv              # Create virtual env
source venv/bin/activate         # Activate (macOS/Linux)
pip install -r requirements.txt  # Install deps
uvicorn main:app --reload        # Start server
pytest                           # Run tests
black .                          # Format code

# Frontend
npm install                      # Install deps
npm start                        # Dev server
npm run build                    # Production build
npm test                         # Tests
npx prettier --write .           # Format code

# Database
alembic init migrations          # Init migrations
alembic revision --autogenerate  # Create migration
alembic upgrade head             # Apply migrations

# Git
git add .                        # Stage changes
git commit -m "message"          # Commit
git push origin main             # Push
```

---

## 💡 Open Source Tools for Productivity

```yaml
Documentation:
  - Notion (free personal) - Project planning
  - MkDocs (free) - API documentation
  - Readme.so (free) - Readme generator

Design:
  - Figma Community (free) - UI design
  - DrawIO (free) - Architecture diagrams
  - Excalidraw (free) - Quick sketches

Project Management:
  - GitHub Projects (free)
  - OpenProject (free self-hosted)
  - Taiga (free)

Collaboration:
  - Discord (free) - Team communication
  - Loom (free tier) - Screen recordings

Code Quality:
  - SonarQube (free community)
  - CodeQL (free)
```

---

## 🎯 Local Development Workflow

```
Daily Development:
1. Pull latest code: git pull
2. Activate venv: source venv/bin/activate
3. Run migrations: alembic upgrade head
4. Start backend: uvicorn main:app --reload
5. Start frontend: npm start (in frontend dir)
6. Code & test
7. Commit: git add . && git commit -m "..."
8. Push: git push origin feature-branch
9. Create PR for review

Testing Cycle:
1. Write test first (TDD)
2. Run: pytest tests/
3. Implement feature
4. Run tests again
5. All green? ✅ Commit

Deployment (when ready):
1. Merge to main
2. Run full test suite
3. Deploy to staging (Railway)
4. Test in staging
5. Deploy to production
```

---

## 📞 Key API Integrations Setup

### **1. Claude API**
```python
# Get free credits from https://console.anthropic.com
# Add to .env: ANTHROPIC_API_KEY=sk-...

from anthropic import Anthropic
client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

message = client.messages.create(
    model="claude-3-5-sonnet-20241022",
    max_tokens=1024,
    messages=[{"role": "user", "content": "What is theft under IPC?"}]
)
```

### **2. Razorpay**
```python
# Test credentials already available in Razorpay dashboard
# No setup needed for testing

import razorpay
client = razorpay.Client(auth=(KEY_ID, KEY_SECRET))

order = client.order.create({
    "amount": 50000,  # In paise
    "currency": "INR",
    "receipt": "order_rcptid",
})
```

### **3. Sentence Transformers (Local Embeddings)**
```python
# 100% free, runs locally
from sentence_transformers import SentenceTransformer

model = SentenceTransformer('all-MiniLM-L6-v2')
embeddings = model.encode(["What is IPC Section 299?"])
# No API calls, no cost!
```

---

## 🌐 Deployment Checklist (When Ready)

```
Infrastructure:
  ☐ PostgreSQL (Railway/Supabase free tier)
  ☐ Redis (Redis Cloud free tier)
  ☐ Vector DB (Pinecone free tier / Supabase)
  ☐ Frontend (Vercel/Netlify free)
  ☐ Backend (Railway/Render free tier)
  ☐ Monitoring (Sentry free tier)

Configuration:
  ☐ Environment variables set
  ☐ Database backups configured
  ☐ SSL certificates (automatic)
  ☐ Domain registered
  ☐ Email service configured
  ☐ Payment gateway live testing

Testing:
  ☐ Load testing (Locust)
  ☐ Security testing
  ☐ All test suites passing
  ☐ Manual testing
```

---

## 🎉 You're Ready to Build!

**Everything you need is:**
- ✅ Free
- ✅ Open source
- ✅ Production-ready
- ✅ Scalable

**No cloud costs until you're making ₹50K+ revenue.**

Start with local development. Ship when ready. Scale when profitable.

