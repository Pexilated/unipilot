# UniPilot — Complete MVP Setup Guide

## What You'll Have After This Guide
A working web app where students can sign up, upload PDFs, get AI summaries, take quizzes, and chat with their files.

---

## Step 1: Create the Next.js Project

Open your terminal and run these commands one by one:

```bash
npx create-next-app@latest unipilot --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
cd unipilot
```

When prompted, choose:
- TypeScript → Yes
- ESLint → Yes
- Tailwind CSS → Yes
- `src/` directory → Yes
- App Router → Yes
- Import alias → Yes (keep default @/*)

---

## Step 2: Install Required Packages

```bash
npm install @supabase/supabase-js @supabase/ssr
npm install openai
npm install pdf-parse
npm install react-dropzone
npm install lucide-react
npm install clsx
npm install @types/pdf-parse
```

**What each package does:**
- `@supabase/supabase-js` — connects to your Supabase database and auth
- `@supabase/ssr` — makes Supabase work correctly with Next.js server components
- `openai` — talks to the OpenAI API for summaries, quizzes, and chat
- `pdf-parse` — extracts raw text from uploaded PDF files
- `react-dropzone` — drag-and-drop file upload UI component
- `lucide-react` — clean icon library (used throughout the UI)
- `clsx` — utility to conditionally combine CSS class names

---

## Step 3: Set Up Supabase

1. Go to https://supabase.com and create a free account
2. Click "New Project" — name it `unipilot`
3. Choose a region close to you
4. Set a strong database password (save it somewhere safe)
5. Wait ~2 minutes for the project to be ready

### Get your API keys:
- Go to your project → Settings → API
- Copy: **Project URL**, **anon/public key**, **service_role key**

### Run the database schema:
- Go to your project → SQL Editor → New Query
- Paste and run the SQL from `database/schema.sql` (included in this project)

---

## Step 4: Set Up Environment Variables

Create a file called `.env.local` in the root of your project:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# OpenAI
OPENAI_API_KEY=your_openai_api_key_here

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Where to get each key:**
- `NEXT_PUBLIC_SUPABASE_URL` → Supabase → Settings → API → Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` → Supabase → Settings → API → anon/public
- `SUPABASE_SERVICE_ROLE_KEY` → Supabase → Settings → API → service_role (keep this secret!)
- `OPENAI_API_KEY` → https://platform.openai.com/api-keys

**Important:** Never commit `.env.local` to Git. It's already in `.gitignore` by default.

---

## Step 5: Set Up Supabase Storage

1. Go to Supabase → Storage
2. Click "New bucket"
3. Name it `pdfs`
4. Set it to **Private** (users can only access their own files)
5. Click Create

---

## Project File Structure

```
unipilot/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   │   └── page.tsx          ← Login page
│   │   │   └── signup/
│   │   │       └── page.tsx          ← Signup page
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx            ← Dashboard shell with sidebar
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx          ← Home dashboard
│   │   │   ├── upload/
│   │   │   │   └── page.tsx          ← PDF upload page
│   │   │   └── files/
│   │   │       ├── page.tsx          ← File list
│   │   │       └── [id]/
│   │   │           └── page.tsx      ← Single file view (summary/quiz/chat)
│   │   ├── api/
│   │   │   ├── upload/
│   │   │   │   └── route.ts          ← PDF upload + text extraction API
│   │   │   ├── summarize/
│   │   │   │   └── route.ts          ← AI summary generation API
│   │   │   ├── quiz/
│   │   │   │   └── route.ts          ← Quiz question generation API
│   │   │   └── chat/
│   │   │       └── route.ts          ← Chat with PDF API
│   │   ├── auth/
│   │   │   └── callback/
│   │   │       └── route.ts          ← Supabase auth callback
│   │   ├── globals.css
│   │   ├── layout.tsx                ← Root layout
│   │   └── page.tsx                  ← Landing page
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   └── Badge.tsx
│   │   ├── dashboard/
│   │   │   ├── Sidebar.tsx
│   │   │   └── Header.tsx
│   │   ├── files/
│   │   │   ├── FileCard.tsx
│   │   │   └── FileUploader.tsx
│   │   └── ai/
│   │       ├── SummaryView.tsx
│   │       ├── QuizView.tsx
│   │       └── ChatView.tsx
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts             ← Browser Supabase client
│   │   │   ├── server.ts             ← Server Supabase client
│   │   │   └── middleware.ts         ← Auth middleware helper
│   │   ├── ai/
│   │   │   └── openai.ts             ← OpenAI wrapper (easy to swap)
│   │   └── utils.ts                  ← Shared utility functions
│   └── types/
│       └── index.ts                  ← TypeScript types
├── database/
│   └── schema.sql                    ← Run this in Supabase SQL Editor
├── middleware.ts                     ← Route protection
├── .env.local                        ← Your secret keys (never commit this)
└── SETUP_GUIDE.md                    ← This file
```

---

## Deployment on Vercel

1. Push your code to GitHub
2. Go to https://vercel.com → New Project → Import your repo
3. Add all your environment variables in Vercel's settings
4. Deploy!

Change `NEXT_PUBLIC_APP_URL` to your Vercel URL after deploying.
