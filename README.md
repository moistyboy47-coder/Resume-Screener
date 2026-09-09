# 🚀 AI-Powered Resume Screener & Batch Evaluator

> An intelligent, production-ready MVP built with Next.js 14, Vercel AI SDK (Gemini), Supabase, and TypeScript that automates resume screening, scoring, and candidate ranking against custom job descriptions.

---

## 🎯 Purpose

Recruiting engineering and HR teams spend hours manually parsing resumes and matching skills against job requirements. This MVP streamlines the workflow:
1. **Define Job Requirements:** Specify required skills, preferred skills, minimum years of experience, and scoring weights (Experience, Skills, Education).
2. **Batch Upload Resumes:** Upload multiple PDF resumes simultaneously.
3. **AI Extraction & Evaluation:** Automatically extracts multi-page PDF text using `pdf2json`, evaluates candidates using Google Gemini AI with automatic model fallback (`gemini-3.6-flash` → `gemini-3.5-flash` → `gemini-3.5-flash-lite`, etc.) and Zod schemas, and applies a two-stage evaluation (Hard Disqualification Filter → Weighted Scoring).
4. **Interactive Dashboard & Export:** View ranked candidate evaluations sorted by overall score, filter by status (`QUALIFIED` / `DISQUALIFIED`), search by name/skills, and export results instantly to **CSV**.

---

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript (Strict mode enabled, ES2022)
- **Styling:** Tailwind CSS
- **AI Engine:** Vercel AI SDK (`ai`), `@ai-sdk/google`, and `zod` for structured schema extraction
- **PDF Parsing:** `pdf2json` (Pure JavaScript multi-page PDF text extraction with zero native binary dependencies)
- **Database & Storage:** Supabase (PostgreSQL relational tables for job postings and candidate evaluations, plus secure Supabase Storage bucket for PDF resumes)

---

## 📋 Prerequisites

Before setting up the project, make sure you have:
- **Node.js** (v18+ recommended) installed on your machine.
- A free **Google AI Studio API Key** (for Gemini AI models).
- A free **Supabase** account and project (for PostgreSQL database and resume storage).

---

## ⚙️ Local Setup & Installation

### 1. Clone or Download the Repository
Open your terminal in the project directory.

### 2. Install Dependencies
Run the following command to install all required npm packages:
```bash
npm install
```

### 3. Configure Environment Variables
Create a file named `.env.local` in the root of the project by copying from `.env.example`:
```bash
cp .env.example .env.local
```
Open `.env.local` and fill in your credentials:
```env
GOOGLE_GENERATIVE_AI_API_KEY=your_google_ai_studio_api_key_here
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
```

### 4. Initialize Supabase Database
1. Go to your [Supabase Dashboard](https://app.supabase.com).
2. Navigate to the **SQL Editor**.
3. Open `supabase/schema.sql` from this project, copy its contents, paste them into the Supabase SQL Editor, and click **Run**. This will create the `job_postings` table, `candidate_evaluations` table, indexes, RLS security policies, the `resumes` storage bucket, and a seeded default job posting.

---

## 🏃‍♂️ Running the Application

### Development Mode
Start the Next.js development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build & Verification
To verify a clean production build with zero TypeScript errors:
```bash
npm run build
npm start
```

---

## 📁 Project Structure

```text
├── app/                  # Next.js App Router (Pages, Layouts, API Routes)
│   ├── api/              # API endpoints (/api/jobs, /api/resumes/bulk-upload)
│   ├── globals.css       # Tailwind CSS styles
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Main dashboard page
├── components/           # React Client Components
│   ├── BulkUploadForm.tsx    # Multi-file dropzone & AI model selector
│   ├── CandidateDashboard.tsx # Ranked candidate table, search, filters & CSV export
│   └── JobPostingForm.tsx     # Job creation & weighting configuration
├── lib/                  # Core Business Logic & Services
│   ├── ai/               # Gemini evaluator with automatic fallback chain
│   ├── parser/           # pdf2json multi-page PDF text extraction
│   ├── supabase/         # Supabase server client & database helper functions
│   └── utils/            # Throttled batch queue utility for rate limits
├── supabase/             # Database migration schema & setup script
├── types/                # Shared TypeScript contracts (JobPosting, CandidateEvaluation)
├── PROGRESS.md           # Detailed technical roadmap & changelog
└── README.md             # Project overview & instructions
```

---

## 🛡️ License

This project is built for enterprise recruitment evaluation and is provided as-is.
