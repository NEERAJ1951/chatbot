# 🤖 Next-Generation AI Chatbot & Mentorship Platform

> **A premium, futuristic conversational AI platform featuring an intelligent robot mascot, global network visualization, real OpenRouter streaming AI, and full UPSC academic preparation tools.**

---

## 🌟 Visual & Architectural Highlights

- **Futuristic Atmosphere**: Sleek `#080B12` deep space background, `#101725` surface cards, glowing `#60A5FA` / `#38BDF8` blue accents, and subtle glassmorphic panels.
- **AI Robot Mascot**: Custom SVG robot with gently glowing pulsing blue eyes, metallic highlights, and friendly expressions.
- **Abstract Global Network**: Interactive world map with connected data nodes, micro-pulses, and network communication lines.
- **Floating Conversation Bubbles**: Translucent floating preview bubbles demonstrating natural conversation and problem solving.
- **Fluid Transition to Chat**: Single-click "Start Chatting" launches directly into the desktop-grade chat workspace.
- **Real OpenRouter LLM Integration**: Multi-tier architecture: Priority 1 OpenRouter (`openrouter/free` or custom), Priority 2 Gemini fallback, Priority 3 Heuristic fallback.
- **Live Health & Status**: Real-time status indicator ("Ready to help" / "Online") backed by `/api/health` — no fake status indicators.
- **Configurable Settings**: In-app modal with active provider metrics, API latency, language selector (English, Hindi, Hinglish), and UPSC RAG grounding toggle.
- **Zero-Dependency Markdown Engine**: Custom code blocks with copy-to-clipboard, formatted tables, ordered/unordered lists, and blockquotes.

---

## 🏗️ Architecture & Technology Stack

```
                                  +----------------------------+
                                  |   React 18 + Vite + TS     |
                                  |   Tailwind CSS (Academic)  |
                                  +--------------+-------------+
                                                 |
                                         REST & SSE Streams
                                                 |
                                  +--------------v-------------+
                                  |     FastAPI (Python 3.13)  |
                                  |   Auth (JWT & Bcrypt)      |
                                  +-------+--------------+-----+
                                          |              |
                      +-------------------+              +-------------------+
                      |                                                      |
         +------------v------------+                            +------------v------------+
         |     Google Gemini       |                            |   Database & Vector     |
         |  - Flash / Pro LLM      |                            |   - SQLite (Local zero) |
         |  - text-embedding-004   |                            |   - PostgreSQL/pgvector |
         +-------------------------+                            +-------------------------+
                      |                                                      |
         +------------v------------+                            +------------v------------+
         |  RAG Engine (PyMuPDF)   |                            |  Ingested Knowledge:    |
         |  - Prompt Injection Red.|                            |  - UPSC Syllabus 2026   |
         |  - Overlap Chunking     |                            |  - Academy Prospectus   |
         +-------------------------+                            +-------------------------+
```

---

## 📁 Repository Directory Structure

```
chatbot/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── admin.py           # Analytics, RAG doc uploads, enquiries, courses CRUD
│   │   │   ├── admissions.py      # Student counsellor handoff with consent
│   │   │   ├── auth.py            # Student & Admin registration, login, JWT
│   │   │   ├── chat.py            # SSE streaming, non-streaming, Mains eval, MCQs
│   │   │   ├── conversations.py   # Multi-turn history & feedback
│   │   │   ├── courses.py         # Academy course catalogue
│   │   │   └── study_plans.py     # Tailored 90-day preparation planner
│   │   ├── core/
│   │   │   ├── config.py          # Pydantic Settings & environment variables
│   │   │   ├── database.py        # SQLAlchemy engine & sessionmaker
│   │   │   └── security.py        # JWT tokens, bcrypt password hashing
│   │   ├── models/
│   │   │   └── models.py          # SQLAlchemy ORM models
│   │   ├── schemas/
│   │   │   └── schemas.py         # Pydantic v2 schemas
│   │   ├── services/
│   │   │   ├── ai_service.py      # Gemini streaming, Mains rubric, MCQ generator
│   │   │   ├── rag_service.py     # PyMuPDF, chunking, embeddings, prompt sanitization
│   │   │   └── seed_data.py       # Default admin, student, courses, and syllabus docs
│   │   └── main.py                # FastAPI app initialization, CORS, lifespans
│   ├── tests/
│   │   └── test_api.py            # Automated pytest test suite (100% pass)
│   ├── requirements.txt           # Backend python dependencies
│   └── run.py                     # Backend startup script
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AdmissionEnquiryModal.tsx  # Counsellor callback modal
│   │   │   ├── ChatInput.tsx              # Auto-resizing textarea & RAG toggle
│   │   │   ├── ChatMessage.tsx            # Citations drawer, feedback & copy
│   │   │   ├── MainsEvaluatorModal.tsx    # 3-tier Mains evaluation rubric
│   │   │   ├── MCQPracticeModal.tsx       # Interactive Prelims quiz
│   │   │   ├── Navbar.tsx                 # Academic header & user profile
│   │   │   ├── Sidebar.tsx                # Session history & subject pills
│   │   │   ├── StudyPlannerModal.tsx      # Diagnostic roadmap questionnaire
│   │   │   └── WelcomeScreen.tsx          # Suggested prompt cards
│   │   ├── context/
│   │   │   └── AuthContext.tsx            # User authentication state
│   │   ├── pages/
│   │   │   ├── AdminDashboardPage.tsx     # Admin KPI, docs, leads & courses
│   │   │   ├── ChatPage.tsx               # Main mentorship workspace
│   │   │   ├── CoursesPage.tsx            # Foundation & test series catalogue
│   │   │   ├── LoginPage.tsx              # Aspirant & Admin login with quick demo pills
│   │   │   ├── RegisterPage.tsx           # Aspirant onboarding
│   │   │   └── StudyPlanPage.tsx          # Saved study plan viewer
│   │   ├── services/
│   │   │   └── api.ts                     # TypeScript API client & SSE parser
│   │   ├── types/
│   │   │   └── index.ts                   # TypeScript interfaces
│   │   ├── App.tsx                        # Router configuration
│   │   ├── index.css                      # Tailwind styling
│   │   └── main.tsx                       # React root render
│   ├── nginx.conf                         # Production Nginx reverse proxy
│   ├── package.json                       # Frontend dependencies
│   └── vite.config.ts                     # Vite build & proxy config
├── docker-compose.yml                     # Multi-container orchestration (DB, API, Web)
├── Dockerfile.backend                     # Python 3.11 container
├── Dockerfile.frontend                    # Nginx + Node build container
├── .env.example                           # Configuration template
└── README.md                              # Comprehensive guide
```

---

## ⚡ Quick Start (Local Development)

### 1. Environment Configuration (.env)
The application reads its credentials securely from `.env` on the server:

```ini
# OpenRouter API (Primary LLM Engine)
OPENROUTER_API_KEY="sk-or-v1-..."
OPENROUTER_MODEL=openrouter/free
PORT=5000

# Security
SECRET_KEY=upsc-mentor-ai-super-secret-key-change-in-production-2026
DATABASE_URL=sqlite:///./upsc_mentor.db
```

*Note: A template without real secrets is provided in `.env.example`. The `.env` file is excluded from Git.*

### 2. Launching Both Servers
You can launch both the FastAPI backend and React frontend with a single click:

```bash
start.bat
```

Or manually:

```bash
# Terminal 1: Backend
cd backend
python run.py

# Terminal 2: Frontend
cd frontend
npm run dev
```
> Open your browser at **`http://localhost:5173`**

---

## 🤖 OpenRouter AI Response System

The platform uses the **OpenRouter API** (`https://openrouter.ai/api/v1/chat/completions`) as its primary conversational engine.

### Features
1. **Configurable Model**: Set via `OPENROUTER_MODEL` (e.g. `openrouter/free`, `meta-llama/llama-3.3-70b-instruct:free`, `google/gemini-2.0-flash-lite:free`, or any custom model catalog identifier).
2. **Conversation Context**: Remembers previous turns up to `MAX_HISTORY_MESSAGES` (default 8) for natural follow-up questions.
3. **Multi-lingual Support**: Automatically responds in simple English, Hindi, or natural Hinglish based on the user's phrasing.
4. **Resilient Error Handling**:
   - Provider rate limits (429) & timeout protection (`OPENROUTER_TIMEOUT_SECONDS`).
   - One-click **Retry** button on failed message responses.
   - Zero credential leaks in browser logs, network requests, or error banners.
5. **Security & Rate Limiting**: Server-side request validation (`max_length=10000`) and in-memory sliding-window rate limiting (40 req/min).

---
> Interactive API Documentation: **`http://127.0.0.1:8000/docs`**

### 2. Frontend Setup
In a second terminal:
```bash
# Navigate to frontend directory
cd frontend

# Install npm packages (already pre-installed)
npm install

# Start Vite dev server
npm run dev
```
> Open your browser at **`http://localhost:5173`**

---

## 🔑 Demo User Credentials

The platform is pre-seeded with two accounts for instant testing:

| Role | Email | Password | Access Privileges |
| :--- | :--- | :--- | :--- |
| **Aspirant / Student** | `student@antigravityias.com` | `Student@123456` | Mentor chat, Study Plans, Mains Evaluator, MCQs |
| **Academy Director / Admin** | `admin@antigravityias.com` | `Admin@123456` | Full Admin Portal, RAG Ingestion, Analytics, Leads |

*(On the Login page, click the **"Demo Student"** or **"Director Admin"** buttons to auto-fill these credentials).*

---

## 🧠 Core Feature Capabilities

### 1. UPSC Study Assistant & Doubt Resolution
- Explains difficult concepts in simple **English**, **Hindi**, and **Hinglish**.
- Maps every topic to its respective GS Paper (**GS-1, GS-2, GS-3, GS-4, or Essay**).
- Multi-turn conversation context preserved with user-level privacy.

### 2. Mains Answer Writing Evaluator
- Uses a transparent 3-tier scoring rubric:
  - **Introduction (20%):** Definition, empirical data, constitutional article / Supreme Court precedents.
  - **Body (70%):** Multi-dimensional **PESTEL** framework (Political, Economic, Social, Technological, Environmental, Legal/Ethical) with bold subheadings and committee citations (Sarkaria, Punchhi, 2nd ARC).
  - **Conclusion & Way Forward (10%):** Forward-looking, balanced constitutional outlook.
- Highlights specific strengths, critical improvements, and points missed.

### 3. Prelims MCQ Practice & Logic Elimination
- Generates 4-option multiple choice questions mapped to UPSC Prelims standards.
- Interactive question card with instant correctness feedback.
- Explains the **logical reasoning** and details the **statement elimination strategy** (identifying extreme qualifiers, statutory vs constitutional distinctions, etc.).

### 4. Personalized 90-Day Study Planner
- Collects diagnostic inputs: current level (Beginner/Intermediate/Advanced), target year, daily hours, optional subject, and strong/weak subjects.
- Generates:
  - Daily routine blocks (Morning, Afternoon, Evening, Night Revision).
  - Phased roadmap: Phase 1 (Core NCERT Foundation), Phase 2 (Dynamic Syllabi & Optional), Phase 3 (Full-length Testing & Answer Writing).

### 5. Coaching Admissions & Human Counsellor Handoff
- Inquiries regarding courses, fees, batch schedules, faculty, and scholarships are answered using verified institute data.
- Seamlessly offers human counsellor callback.
- **Privacy & Consent Protection:** Collects only minimum required information and verifies explicit student consent before submitting leads.

### 6. RAG Document Ingestion Pipeline
- **Formats supported:** PDF, DOCX, TXT, MD.
- **Extraction:** Powered by **PyMuPDF**, extracting text page-by-page.
- **Sanitization:** Regex-based neutralizing of prompt injection attacks.
- **Chunking:** Configurable chunk size (600 chars) with 100-character overlap.
- **Embedding:** Gemini `text-embedding-004` (with deterministic high-dimensional vector fallback).
- **Grounded Responses:** When answering from ingested materials, source citations with document names and page numbers are displayed in an expandable citations drawer.

---

## 🧪 Automated Testing

Automated tests are included in `backend/tests/test_api.py`.

To run tests:
```bash
cd backend
python -m pytest tests/test_api.py -v
```

**Test Coverage Summary:**
- `test_health_check` — Server and database connection
- `test_auth_and_login` — JWT token generation and bcrypt verification
- `test_get_courses` — Course catalogue retrieval
- `test_chat_non_streaming` — Academic mentor response generation
- `test_evaluate_mains_rubric` — Mains answer evaluation and scoring
- `test_generate_mcqs` — MCQ generation and options integrity
- `test_admission_enquiry_with_consent` — Valid lead submission
- `test_admission_enquiry_without_consent_fails` — Strict consent guardrail enforcement

---

## 🐳 Docker Production Deployment

To run the complete production stack (PostgreSQL with `pgvector`, FastAPI backend, and Nginx-served React frontend):

```bash
# 1. Configure environment variables in .env
cp .env.example .env

# 2. Build and launch containers
docker compose up -d --build

# 3. Check container status
docker compose ps
```

- **Frontend Application:** `http://localhost`
- **Backend API:** `http://localhost:8000`
- **Interactive OpenAPI Documentation:** `http://localhost:8000/docs`

---

## 🛡️ Security Best Practices Implemented
1. **Zero Secret Leakage:** API keys and JWT secret keys are loaded strictly from server environment variables.
2. **Password Security:** Password hashing using bcrypt with 12 salt rounds. Plaintext passwords are never stored or logged.
3. **Prompt Injection Guardrails:** Query sanitization strips system prompt manipulation triggers (`ignore previous instructions`, `system:`, etc.).
4. **Data Isolation:** User conversations and personalized study plans are strictly scoped to the authenticated user ID.
5. **CORS Configuration:** Explicit origin whitelisting for frontend ports.

---

*AntiGravity IAS Academy • Building Tomorrow's Civil Servants with Rigor and Integrity.*
#   c h a t b o t  
 #   c h a t b o t  
 