# AI Resume Screener MVP - Progress & Technical Context

> **CRITICAL ONGOING INSTRUCTION (Permanent Workspace Rule):**
> You **MUST** update `PROGRESS.md` dynamically every single time you complete a new feature, modify a core file, or change the database schema. This file must always reflect the absolute present state of the project as a context bridge for AI models and developers.

---

## 1. Project Architecture & Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript (`target: "es2022"`, strict mode enabled, path aliases `@/*` configured)
- **Styling:** Tailwind CSS
- **AI Engine:** Vercel AI SDK (`ai`), `@ai-sdk/google` (`gemini-3.6-flash`), and `zod` for structured schema extraction.
- **Parsing Utilities:** 
  - `lib/parser/pdf.ts` using `pdf2json` for robust, pure-JavaScript server-side multi-page PDF text extraction (`extractTextFromPDF`, `extractPdfText`, `fileToBuffer`) with zero native binaries or bundling errors.
- **Batch Utilities:** `lib/utils/batch.ts` for throttled batch processing.
- **Database & Storage:** Supabase (`@supabase/supabase-js`, PostgreSQL tables for `job_postings` and `candidate_evaluations`, and `resumes` storage bucket with RLS policies in `supabase/schema.sql`).
- **Supabase DB Helpers:** `lib/supabase/db.ts` (`uploadResumeToStorage`, `saveCandidateEvaluations`, `getJobPosting`).

---

## 2. Current Schema & Contracts (`types/index.ts`)

```typescript
export type JobPosting = {
  id: string;
  title: string;
  status: "draft" | "published" | "closed"; 
  required_skills: string[];
  preferred_skills: string[]; 
  min_years_experience: number;
  weightings: {
    experience_weight: number;
    skills_weight: number;
    education_weight: number;
  };
  created_at: string;
};

export type CandidateEvaluation = {
  id: string;
  job_id: string;
  candidate_name: string;
  email?: string;
  status: 'QUALIFIED' | 'DISQUALIFIED';
  overall_score: number;
  disqualification_reason?: string;
  summary: string;
  skills_found: string[];
  parsed_years_experience: number;
  resume_url: string;
};
```

---

## 3. Completed Work

- **Project Scaffolding & Configuration:**
  - Configured `package.json` with Next.js, React 18, TypeScript, Vercel AI SDK (`ai`), `@ai-sdk/google`, `zod`, `pdf2json`, and `@supabase/supabase-js`. Removed problematic `pdf-parse` package.
  - Configured `tsconfig.json` with modern ECMAScript target (`es2022`) and path mapping (`@/*` -> `./*`).
  - Configured `.env.local` with verified Gemini API key and Supabase credentials (URL, Anon Key, Service Role Key).
  - Created `.gitignore` to protect sensitive environment variables (`.env.local`), build artifacts (`.next/`, `node_modules/`), and editor configs.
- **Core Types (`types/index.ts`):**
  - Defined `JobPosting` and `CandidateEvaluation` TypeScript interfaces.
- **Database Schema & Server Client (`supabase/schema.sql`, `lib/supabase/server.ts`, `lib/supabase/db.ts`):**
  - Created `supabase/schema.sql` defining `job_postings`, `candidate_evaluations`, indexes, RLS policies, `resumes` storage bucket setup, and seeded default job posting (successfully executed in Supabase).
  - Implemented `lib/supabase/server.ts` exporting server client singleton and `getSupabaseServerClient()`.
  - Implemented `lib/supabase/db.ts` for storage uploading, record saving, and job fetching.
- **Jobs API (`app/api/jobs/route.ts`):**
  - Created GET and POST endpoints for creating and fetching dynamic job postings using standard valid UUIDs (`crypto.randomUUID()`) to prevent `invalid input syntax for type uuid` errors.
- **PDF Text Extraction Utility (`lib/parser/pdf.ts`):**
  - Replaced `pdf-parse` with `pdf2json` in `lib/parser/pdf.ts`. Implemented `extractTextFromPDF`, `extractPdfText`, and `fileToBuffer` using `PDFParser` buffer parsing and `.getRawTextContent()` for clean multi-page text extraction and robust error handling.
- **Throttled Batch Utility (`lib/utils/batch.ts`):**
  - Implemented `processBatchThrottled` utility function to process items in batched chunks with configurable delays to prevent HTTP 429 rate limit errors on Gemini's free tier.
- **AI Resume Evaluation Engine (`lib/ai/evaluator.ts`):**
  - Implemented structured resume extraction using Gemini via Vercel AI SDK and Zod schemas.
  - Implemented **robust automatic model fallback chain** (`gemini-3.6-flash` → `gemini-3.5-flash` → `gemini-3.5-flash-lite` → `gemini-3.1-flash-lite` → `gemini-3-flash-preview`) with rate-limit / quota error detection (`429`, `RESOURCE_EXHAUSTED`, `quota`, `token`), brief exponential backoff retries, and isolated per-resume failure handling so batch uploads never fail entirely.
- **End-to-End API Route (`app/api/resumes/bulk-upload/route.ts`):**
  - Fully wired POST route accepting multipart form data, extracting PDF text, uploading resumes to Supabase Storage, running Gemini 3.6 Flash evaluations in throttled batches, and saving records to PostgreSQL.
- **Frontend UI & CSV Export (`components/JobPostingForm.tsx`, `components/BulkUploadForm.tsx`, `components/CandidateDashboard.tsx`, `app/page.tsx`, `app/layout.tsx`):**
  - Built `JobPostingForm` component for dynamic job position and weightings configuration using valid UUIDs.
  - Built `BulkUploadForm` component with live status messaging, file selection, and **dynamic AI model selector** (`gemini-3.6-flash`, `gemini-3.5-flash`, `gemini-3.5-flash-lite`, `gemini-3.1-flash-lite`, `gemini-3-flash-preview`) for rate-limit mitigation using the user's Google AI Studio API key.
  - Built `CandidateDashboard` component with sorting by `overall_score` descending, real-time search, status filtering, and CSV Export (`exportEvaluationsToCSV`).
  - Created root layout and home page integrating all components.
- **Documentation (`README.md`):**
  - Created a comprehensive, beautifully formatted `README.md` explaining project purpose, tech stack, prerequisites, local setup instructions, database initialization, and project structure.

---

## 4. Pending Roadmap

1. **Testing & QA:**
   - Add automated unit or integration tests (Vitest / Playwright).

---

## 5. Technical Debt & Known Issues

- **None currently identified.** Build compiles cleanly with zero errors and zero warnings.
