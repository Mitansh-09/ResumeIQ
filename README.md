# ResumeIQ — Career Intelligence Platform

A production-grade React app that helps students and freshers understand exactly where they stand for any job role.

## What it does

- **Resume Analyzer** — Upload your PDF resume + paste a JD → get match score, skill gaps, category breakdowns, and resume bullet rewrites powered by Gemini AI
- **Skill Roadmap** — Auto-generated, phased learning plan based on your missing skills with resources and milestones. Checkable progress tracking saved to Firestore.
- **Interview Prep** — Role-specific questions (technical, behavioral, system design, HR) with AI answer evaluation and scoring.
- **History** — All past analyses saved to Firebase, viewable and deletable.

---

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 18 + Vite |
| Routing | React Router v6 |
| State | Context API + useReducer |
| Forms | react-hook-form |
| Auth | Firebase Auth (email + Google) |
| Database | Firestore |
| AI | Google Gemini 1.5 Flash |
| PDF | pdfjs-dist |
| Styling | Tailwind CSS |
| Charts | Recharts |
| Deployment | Vercel / Netlify |

---

## Setup Instructions

### 1. Clone and install

```bash
git clone <your-repo>
cd resumeiq
npm install
```

### 2. Firebase Setup

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Create a new project
3. Enable **Authentication** → Email/Password + Google
4. Create a **Firestore Database** (start in test mode, then apply `firestore.rules`)
5. Go to Project Settings → Your apps → Add web app
6. Copy the config values

### 3. Gemini API Key

1. Go to [aistudio.google.com](https://aistudio.google.com)
2. Create API Key (free tier is sufficient)

### 4. Environment Variables

```bash
cp .env.example .env
```

Fill in your values in `.env`:

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_GEMINI_API_KEY=...
```

### 5. Apply Firestore Rules

In Firebase Console → Firestore → Rules, paste the contents of `firestore.rules`.

### 6. Run

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### 7. Deploy (Vercel)

```bash
npm install -g vercel
vercel
```

Set the same env variables in Vercel dashboard under Project → Settings → Environment Variables.

---

## Project Structure

```
src/
├── components/
│   ├── ui/          # Spinner, Badge, ScoreRing, ProgressBar, Toast, EmptyState
│   ├── layout/      # Sidebar, AppLayout, ProtectedRoute
│   ├── analyzer/    # (extendable) analyzer sub-components
│   ├── roadmap/     # (extendable) roadmap sub-components
│   └── prep/        # (extendable) prep sub-components
├── pages/
│   ├── Landing.jsx
│   ├── Login.jsx
│   ├── Signup.jsx
│   ├── Dashboard.jsx
│   ├── Analyzer.jsx
│   ├── Roadmap.jsx
│   ├── Prep.jsx
│   └── History.jsx
├── context/
│   ├── AuthContext.jsx   # Firebase auth state
│   └── AppContext.jsx    # Global app state (analyses, roadmap, notifications)
├── hooks/
│   └── index.js          # useUserData, useLocalStorage, useDebounce, useScrollTop
├── services/
│   ├── firebase.js       # Firebase init
│   ├── db.js             # All Firestore CRUD operations
│   └── gemini.js         # All Gemini AI calls
└── utils/
    └── pdfParser.js      # PDF text extraction
```

---

## How to Expand

- Add **resume storage** to Firebase Storage (upload actual PDF files, not just text)
- Add **LinkedIn URL scraping** as an alternative to PDF upload
- Add **profile page** with skill badges and progress over time
- Add **company-specific prep packs** (Amazon LP, Google SWE, etc.)
- Add **streak tracking** for consistent prep practice
- Add **share link** for analyses (public read-only view)

---

## Viva Prep

Key questions you should be able to answer:

- Why Context API over Redux? (state is auth + lists, no complex derived state)
- Why Gemini over OpenAI? (free tier, sufficient quality, already familiar)
- How does PDF parsing work? (pdfjs-dist, no backend needed, runs in browser)
- Why lazy loading? (React.lazy + Suspense for per-page code splitting)
- How are routes protected? (ProtectedRoute checks auth state before render)
- How does the roadmap save? (optimistic update in Context, async Firestore write)

---

## Academic Integrity Note

All AI-generated suggestions (resume bullets, roadmap, questions) are clearly labeled in the UI. The AI assists the user — it doesn't replace their thinking.
