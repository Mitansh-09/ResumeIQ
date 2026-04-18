<div align="center">

<img src="public/favicon.svg" width="64" height="64" alt="ResumeIQ logo" />

# ResumeIQ

**AI-powered career intelligence for students and freshers.**  
Know exactly where you stand for any role — before you apply.

[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)
[![Firebase](https://img.shields.io/badge/Firebase-10-FFCA28?style=flat-square&logo=firebase&logoColor=black)](https://firebase.google.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38BDF8?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Gemini](https://img.shields.io/badge/Gemini-1.5_Flash-4285F4?style=flat-square&logo=google&logoColor=white)](https://aistudio.google.com)

</div>

---

## The Problem

Every student applying for internships faces the same frustration — you spend hours tailoring your resume, apply to 30 roles, get 2 responses, and have no idea why. You don't know which skills you're missing, which parts of your resume are weak, or how to actually prepare for the interview.

**ResumeIQ fixes this.** Upload your resume, paste a JD, and get a brutally honest analysis in under 3 minutes.

---

## Features

### 🔍 Resume ↔ JD Analyzer
Upload your PDF resume and paste any job description. Gemini AI returns:
- An **overall match score** (0–100)
- **Category breakdowns** — technical skills, experience, education, soft skills, domain knowledge
- **Skill tags** — what you have ✓, what you're missing ✗, what's partial ~
- **Top 3 strengths** and **top 3 improvements**
- **Resume bullet rewrites** — before/after suggestions for weak lines
- A **verdict** — strong fit / good match / needs work / not a fit

### 🗺️ Personalized Skill Roadmap
Automatically generated from your skill gaps after every analysis:
- Phased learning plan with estimated timelines
- Per-skill milestones (concrete things to build or achieve)
- Curated resources (courses, articles, videos, books)
- **Progress tracking** — check off skills as you complete them, saved to Firestore

### 🎤 Interview Prep Mode
Role-specific questions generated from the JD + your resume:
- **7 questions per session** — 3 technical, 2 behavioral, 1 system design, 1 HR
- Type your answer → AI evaluates it (scored out of 10)
- Get strengths, improvement points, and a stronger version of your answer
- Peek at sample answers when stuck

### 📋 Analysis History
Every analysis you run is saved. Come back anytime to review past scores, re-open results, or delete old ones.

---

## Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | React 18 + Vite | Fast HMR, modern tooling |
| Routing | React Router v6 | Protected routes, lazy loading |
| State | Context API + useReducer | Auth + global data, no Redux overhead |
| Forms | react-hook-form | Validation without re-render cost |
| Auth | Firebase Auth | Email/password + Google OAuth, zero backend |
| Database | Firestore | Per-user data, real-time, offline support |
| AI | Gemini 1.5 Flash | Free tier, fast, structured JSON output |
| PDF | pdfjs-dist | Client-side extraction — no file upload to server |
| Styling | Tailwind CSS | Utility-first, custom design tokens |
| Deployment | Vercel | Zero-config, auto deploys |

---

## Project Structure

```
resumeiq/
├── public/
│   └── favicon.svg
├── src/
│   ├── App.jsx                    # Routes + lazy loading + Suspense
│   ├── main.jsx
│   ├── index.css                  # Tailwind + custom animations
│   │
│   ├── pages/
│   │   ├── Landing.jsx            # Public marketing page
│   │   ├── Login.jsx              # Email + Google sign-in
│   │   ├── Signup.jsx             # Account creation
│   │   ├── Dashboard.jsx          # Stats, recent analyses, quick actions
│   │   ├── Analyzer.jsx           # Core — PDF upload + JD + AI result
│   │   ├── Roadmap.jsx            # Phased skill roadmap with progress tracking
│   │   ├── Prep.jsx               # Interview questions + answer evaluation
│   │   └── History.jsx            # All saved analyses
│   │
│   ├── components/
│   │   ├── ui/index.jsx           # Spinner, Badge, ScoreRing, ProgressBar, Toast, EmptyState
│   │   └── layout/
│   │       ├── Sidebar.jsx        # Navigation
│   │       ├── AppLayout.jsx      # Sidebar + toast notification stack
│   │       └── ProtectedRoute.jsx # Auth guard
│   │
│   ├── context/
│   │   ├── AuthContext.jsx        # Firebase auth + login/signup/logout/Google
│   │   └── AppContext.jsx         # Global state: analyses, roadmap, notifications
│   │
│   ├── hooks/
│   │   └── index.js               # useUserData, useLocalStorage, useDebounce, useClickOutside
│   │
│   ├── services/
│   │   ├── firebase.js            # Firebase init
│   │   ├── db.js                  # All Firestore CRUD operations
│   │   └── gemini.js              # All 4 Gemini AI prompts
│   │
│   └── utils/
│       └── pdfParser.js           # Client-side PDF → text extraction
│
├── firestore.rules                # Security rules
├── .env.example
├── tailwind.config.js
├── vite.config.js
└── package.json
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- A Firebase project (free)
- A Gemini API key (free at [aistudio.google.com](https://aistudio.google.com))

### 1. Clone and install

```bash
git clone https://github.com/your-username/resumeiq.git
cd resumeiq
npm install
```

### 2. Set up Firebase

1. Go to [console.firebase.google.com](https://console.firebase.google.com) → **Create project**
2. **Authentication** → Sign-in method → Enable **Email/Password** and **Google**
3. **Firestore Database** → Create database → Start in test mode
4. **Project Settings** → Your apps → **Add web app** → Copy the config values
5. Paste `firestore.rules` into **Firestore → Rules** tab and publish

### 3. Get your Gemini API key

1. Go to [aistudio.google.com](https://aistudio.google.com)
2. Click **Get API Key** → **Create API key in new project**
3. Copy the key

### 4. Configure environment variables

```bash
cp .env.example .env
```

Fill in `.env`:

```env
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123:web:abc

VITE_GEMINI_API_KEY=AIza...
```

> ⚠️ Never commit `.env` to git. It's already in `.gitignore`.

### 5. Run

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### 6. Deploy to GitHub Pages

```bash
npm run build
```

1. Push your code to GitHub.
2. In your repo, open **Settings → Secrets and variables → Actions** and add:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
   - `VITE_GEMINI_API_KEY`
   - ⚠️ These `VITE_*` values are exposed in the browser bundle at runtime. Use strict Firebase Security Rules and provider/API key restrictions in Google Cloud/Firebase to protect your project.
3. Go to **Settings → Pages** and set:
   - **Source**: **GitHub Actions**
4. Push to `main` (or `master`) and the workflow `.github/workflows/deploy-pages.yml` will deploy automatically.
5. Your app will be available at:
   - `https://<your-username>.github.io/<repo-name>/`

### 7. Deploy to Vercel (optional)

```bash
npm install -g vercel
vercel
```

Add all `.env` variables in Vercel: **Project → Settings → Environment Variables**

---

## React Concepts Used

| Concept | Where it's used |
|---|---|
| `useState` | File upload, loading states, form values, result data |
| `useEffect` | Auth listener in `AuthContext`, data fetch in `useUserData` |
| `useRef` | SVG ring animation, file input, fetch deduplication flag |
| `useMemo` | Dashboard stats computed from analyses array |
| `useCallback` | `notify()` in AppContext, roadmap toggle handler |
| `useReducer` | Global app state in `AppContext` |
| Context API | `AuthContext` + `AppContext` — two separate concerns |
| Custom hooks | `useUserData`, `useLocalStorage`, `useDebounce`, `useClickOutside` |
| `React.lazy` + `Suspense` | All 8 pages lazy-loaded for code splitting |
| Controlled components | All forms via `react-hook-form` |
| Lifting state up | Analysis result → AppContext → Dashboard + History |
| Conditional rendering | Skeletons, empty states, result panels, auth guards |
| Lists and keys | Analyses, roadmap items, skill tags, questions |
| Component composition | `AppLayout` wraps every protected page, `ProtectedRoute` wraps routes |
| React Router v6 | Full routing with protected and public routes |

---

## Firestore Data Model

```
/analyses/{docId}
  userId        string
  jobTitle      string
  resumeText    string
  jdText        string
  result        object  { overallScore, verdict, summary, categoryScores,
                          skillsPresent, skillsMissing, skillsPartial,
                          strengths, improvements, resumeBulletSuggestions }
  createdAt     timestamp

/roadmaps/{docId}
  userId        string
  analysisId    string
  items         array   [{ id, skill, phase, phaseTitle, duration,
                           completed, milestones, resources }]
  createdAt     timestamp

/prepSessions/{docId}
  userId        string
  analysisId    string
  jobTitle      string
  questions     array   [{ id, question, category, difficulty, hint, sampleAnswer }]
  answers       object  { [questionId]: { answer, feedback } }
  createdAt     timestamp
```

---

## Possible Extensions

This codebase is built to grow. Easy next steps:

- **Resume PDF storage** → save files to Firebase Storage instead of just extracted text
- **Profile page** → skill progress chart over time using Recharts
- **LinkedIn JD import** → paste a LinkedIn URL, auto-fetch the JD
- **Company prep packs** → preset question banks for Amazon, Google, Flipkart, etc.
- **Daily streak tracking** → habit loop for consistent prep
- **Public share link** → read-only view of an analysis for sharing with mentors
- **Score history chart** → line chart showing improvement across analyses
- **Mobile sidebar** → hamburger drawer for small screens

---

## License

MIT — use it, learn from it, ship it.

---

<div align="center">
  <sub>React · Firebase · Gemini AI · Tailwind CSS</sub>
</div>
