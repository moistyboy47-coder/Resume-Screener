# CLAUDE.md — AI Resume Screener & Scraper

This file is the single source of truth for Claude Code when working on this project.
Read it fully before making any architectural decisions, writing any code, or suggesting changes.

---

## 1. What We're Building

**Product**: An AI-powered resume screening tool for mid-market in-house recruiting teams (50–300 employee companies with 3–10 recruiters).

**One-liner**: We screen inbound applications and flag ambiguous candidates for human review — instead of silently auto-rejecting them. Recruiters get back 10+ hours per hire and never have to explain an unexplainable rejection.

**Core differentiator**: Explainability + uncertainty flagging + confidence scoring. Every score decomposes into evidence. Every ambiguous extraction is flagged. Every low-confidence candidate routes to a human. This is both our product feature AND our compliance story.

**What we are NOT**: We are not a sourcing tool (no LinkedIn scraping). We are not a video interview tool. We are not an enterprise talent intelligence platform. We are not a black-box scorer.

---

## 2. Target Customer & Positioning

**ICP**: Mid-market in-house recruiting teams (50–300 employees, 3–10 recruiters).
**Buyer**: VP of Talent / Head of Recruiting.
**Their #1 pain**: The "visibility gap" — 65% of AI-rejected candidates never get seen by a human, and some of them are good.
**Our pitch**: "Your current system rejects candidates you'd want to interview. We flag the ambiguous ones and tell you why — so you never lose a great candidate to a keyword mismatch."

**Competitor benchmarks** (for context, not copying):

- Juicebox: $99/seat/mo — sourcing, not screening
- SeekOut: $149/user/mo — GitHub/skills sourcing
- hireEZ: $494/mo — multi-platform aggregation
- Eightfold: $50K–$500K/yr — enterprise talent intelligence
- Brainner: fraud detection niche

**Our pricing**:

- Starter: $299/mo (500 apps/mo, 3 seats, basic explainability)
- Growth: $799/mo (2,000 apps/mo, 10 seats, full confidence/uncertainty, ATS integration)
- Scale: $1,499/mo (unlimited, custom scoring, compliance audit support)

---

## 3. Tech Stack

| Layer             | Technology                       | Notes                                         |
| ----------------- | -------------------------------- | --------------------------------------------- |
| Framework         | Next.js (App Router)             | `app/` directory structure                    |
| Language          | TypeScript (strict)              | No `any` unless justified with comment        |
| Database          | Supabase (PostgreSQL)            | `candidate_evaluations` table + JSONB columns |
| AI SDK            | Vercel AI SDK (`generateObject`) | With Zod schemas                              |
| LLM Provider      | Google Gemini                    | Primary extraction model                      |
| PDF Parsing       | pdf2json                         | With sanitization layer                       |
| Schema Validation | Zod                              | All AI outputs validated                      |
| Styling           | Tailwind CSS                     | Dashboard components                          |
| Auth              | Supabase Auth                    | (Planned)                                     |
| Deployment        | Vercel                           |                                               |

---

## 4. Architecture Overview

Inbound Resume (PDF)
│
▼
┌───────────────────────┐
│ lib/parser/pdf.ts │ ← sanitizePdfText(), scanned PDF detection
│ UnsupportedPdfError │
└──────────┬────────────┘
│ clean text
▼
┌───────────────────────┐
│ lib/ai/evaluator.ts │ ← generateObject() with Zod schema
│ Gemini extraction │ ← Returns nested JSON: work history, education, skills, confidence_scores
└──────────┬────────────┘
│ raw JSON
▼
┌───────────────────────┐
│ lib/resume/adapter.ts│ ← toStructuredResume(rawInput: unknown)
│ Pure transformer │ ← Guarantees StructuredResume contract
└──────────┬────────────┘
│ StructuredResume
▼
┌───────────────────────┐
│ lib/resume/uncertainty│ ← evaluateUncertainty()
│ Rule engine │ ← Returns ReviewFlag[] + requires_human_review
└──────────┬────────────┘
│ flags + structured data
▼
┌───────────────────────┐
│ Supabase │ ← candidate_evaluations table
│ raw_extraction JSONB │ ← Audit-ready snapshot
│ review_flags JSONB │
└──────────┬────────────┘
│
▼
┌───────────────────────┐
│ CandidateDashboard │ ← "Why This Score" panel (NEXT PRIORITY)
│ React components │ ← Amber "Needs Review" badges
└───────────────────────┘

text

---

## 5. Directory Structure

/app
/api
/resumes
/bulk-upload/route.ts ← Batch upload, per-file error handling
/screen/route.ts ← (Planned) Single resume screening
/dashboard
/page.tsx ← CandidateDashboard
/candidate/[id]/page.tsx ← (Planned) Detail view with score breakdown

/lib
/ai
evaluator.ts ← Gemini extraction, Zod schema, prompts
/parser
pdf.ts ← sanitizePdfText(), UnsupportedPdfError
/resume
adapter.ts ← toStructuredResume(), pure transformer
uncertainty.ts ← evaluateUncertainty(), rule engine
scoring.ts ← (Planned) Recency-weighted experience score
/supabase
client.ts ← Supabase client init
queries.ts ← Typed query functions

/types
index.ts ← StructuredResume, ContactInfo, WorkExperienceItem,
EducationItem, CertificationItem, ProjectItem,
CategorizedSkills, ReviewFlag, CandidateEvaluation

/components
CandidateDashboard.tsx
ReviewFlagBadge.tsx
ConfidenceScorePanel.tsx ← (Planned)
WhyThisScorePanel.tsx ← (Planned, HIGH PRIORITY)

/supabase
/migrations
\*.sql ← Schema migrations

text

---

## 6. Database Schema

### `candidate_evaluations` table

| Column                  | Type        | Notes                                                     |
| ----------------------- | ----------- | --------------------------------------------------------- |
| `id`                    | UUID        | Primary key                                               |
| `created_at`            | TIMESTAMPTZ |                                                           |
| `candidate_name`        | TEXT        | Extracted                                                 |
| `candidate_email`       | TEXT        | Extracted                                                 |
| `raw_extraction`        | JSONB       | Full LLM output — audit-ready snapshot                    |
| `structured_resume`     | JSONB       | Normalized StructuredResume                               |
| `confidence_scores`     | JSONB       | `{ overall: number, experience: number, skills: number }` |
| `review_flags`          | JSONB       | `ReviewFlag[]`                                            |
| `requires_human_review` | BOOLEAN     | True if any CRITICAL or 2+ WARNING flags                  |
| `overall_score`         | NUMERIC     | (Planned) Final match score                               |
| `job_id`                | UUID        | (Planned) FK to jobs table                                |
| `prompt_version`        | TEXT        | (Planned) For prompt versioning / audit                   |
| `scoring_version`       | TEXT        | (Planned) For scoring algorithm versioning                |

**Rules**:

- Never delete the `raw_extraction` column. It is our audit trail.
- All new columns must be nullable or have defaults — never break backward compatibility.
- Use JSONB for nested structures, not separate tables, unless we need to query inside them.

---

## 7. Core Type Contracts

These are canonical. Do not change them without updating `types/index.ts` AND all adapters.

````typescript
// StructuredResume — the guaranteed contract
interface StructuredResume {
  contact: ContactInfo;
  work_experience: WorkExperienceItem[];
  education: EducationItem[];
  certifications: CertificationItem[];
  projects: ProjectItem[];
  skills: CategorizedSkills;
  confidence_scores: ConfidenceScores;
  review_flags: ReviewFlag[];
}

interface WorkExperienceItem {
  company: string;
  role_title: string;
  start_date: string | null;
  end_date: string | null;
  is_current: boolean;          // Computed from end_date containing "Present"/"Current"
  bullet_points: string[];
}

interface ConfidenceScores {
  overall: number;              // 0–100
  experience: number;           // 0–100
  skills: number;               // 0–100
}

interface ReviewFlag {
  code: string;                 // e.g., "LOW_EXTRACTION_CONFIDENCE"
  message: string;              // Human-readable
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
}
Adapter rule: toStructuredResume(rawInput: unknown) must be a pure function. No side effects. No API calls. No DB writes. It takes unknown input and returns a guaranteed-valid StructuredResume. Missing fields become [] or "". Nulls become empty arrays. Dates are standardized.

8. Uncertainty Rules (Deterministic)

These rules run inside evaluateUncertainty(). They are deterministic — no AI calls.

Rule Code	Trigger	Severity
LOW_EXTRACTION_CONFIDENCE	confidence_scores.experience < 70 OR confidence_scores.overall < 70	WARNING
AMBIGUOUS_WORK_DATES	Missing start_date or end_date in any work item	WARNING
MISSING_WORK_HISTORY	work_experience.length === 0	CRITICAL
Routing rule: requires_human_review = true if ANY CRITICAL flag OR 2+ WARNING flags.

When adding new rules: Add to the table above, add a unit test, update this doc.

9. AI Extraction Patterns

Provider: Google Gemini via Vercel AI SDK.
Method: generateObject() with a Zod schema.
Prompt philosophy: Factual extraction only. Capture exact resume statements. Do NOT summarize. Do NOT infer unstated details.

Zod schema requirements:

Every field must be nullable or have a default.
Confidence scores required on every extraction.
System prompt must include scoring rubric (deduct for ambiguous dates, implied skills, fragmented sentences).
Prompt versioning: Every prompt change must bump a PROMPT_VERSION constant. Store it with each evaluation.

Fallbacks: If the LLM returns malformed confidence scores, default to 75. If extraction fails entirely, throw and let the API route catch it — do not silently return empty data.

10. What's Built (Phase 1 — Complete)

✅ Nested JSON extraction (work history, education, skills, confidence scores)
✅ PDF sanitization (sanitizePdfText(), scanned PDF detection, UnsupportedPdfError)
✅ StructuredResume domain model + adapter
✅ Confidence scores (overall, experience, skills) with deterministic fallbacks
✅ Uncertainty handling (review flags, requires_human_review, dashboard badge)
✅ raw_extraction JSONB column for audit trail
✅ Per-file error handling in bulk upload
11. What to Build Next (Priority Order)

Ship these in the next 90 days. Do not skip ahead.

"Why This Score" panel — For every candidate, show which skills were found, in which bullet points, with what confidence, how recent. This is our demo. This is our differentiator.
Recency-weighted experience scoring (lib/resume/scoring.ts) — "8 years total" is meaningless. "5 years doing this specific thing, with the most recent 2 years highly relevant" is actionable.
Confidence score dashboard — Sortable, filterable. Let recruiters route low-confidence candidates to humans first.
Audit trail export — PDF/CSV per candidate: raw extraction, confidence, flags, final score with explanations. Compliance play.
Greenhouse integration (read-only first) — Pull applications, screen, push back review flag + score. Apply to partner program.
12. What NOT to Build (Yet)

Do not build these until we have 10 paying customers. They are distractions.

❌ LinkedIn scraping (legal liability, breaks constantly, distracts from screening)
❌ Skill depth / semantic matching / technology evolution (Phase 5 concerns)
❌ Achievement/competency/leadership inference (Phase 6 concerns)
❌ Two-pass AI architecture / embeddings (over-engineering for v1)
❌ Bias detection / historical validation (enterprise concerns, not mid-market v1)
❌ Video interview features
❌ Any feature that requires a 6-month enterprise sales cycle
13. Coding Conventions

TypeScript strict mode. No any. Use unknown + type guards.
Pure functions for adapters and rule engines. Side effects only in API routes and DB layers.
Zod for all external input. LLM outputs, API requests, form submissions.
Error handling: Custom error classes (UnsupportedPdfError). Never swallow errors silently.
Naming: camelCase for functions/variables, PascalCase for types/components, SCREAMING_SNAKE for constants.
File naming: kebab-case for files, index.ts for barrel exports.
Comments: Explain why, not what. Every non-obvious business rule gets a comment.
Commits: Conventional commits (feat:, fix:, refactor:, docs:).
14. Environment Variables

text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GOOGLE_GENERATIVE_AI_API_KEY=
Never commit .env. Never log API keys. Never expose service role key to client.

15. Compliance Requirements

We are building for NYC Local Law 144 and EU AI Act compliance. This means:

Audit trail: Every evaluation stores raw extraction + confidence + flags + prompt version.
Human oversight: requires_human_review flag is a compliance feature, not just UX.
Explainability: Every score must decompose into evidence. No black boxes.
Candidate notification: (Planned) Support for 10-business-day advance notice workflows.
Bias audit readiness: (Planned) Export scoring data in a format suitable for third-party bias testing.
When in doubt, log more. We can always delete data. We can't recreate it.

16. Testing

Unit tests for toStructuredResume() (all edge cases: null, missing, malformed)
Unit tests for evaluateUncertainty() (each rule, each severity combination)
Integration test for the full pipeline: PDF → sanitize → extract → adapt → flag → store
No E2E tests until we have a stable dashboard
17. Key Commands

bash
npm run dev          # Local dev server
npm run build        # Production build
npm run test         # Unit tests
npm run lint         # ESLint
npx supabase db push # Apply migrations
18. When You're Unsure

Product questions: Re-read sections 1, 2, and 11 of this file.
Architecture questions: Prefer pure functions, Zod validation, and audit trails.
Scope questions: If it's not in section 11, it's probably not a priority. Ask before building.
Compliance questions: Log more. Flag more. Route to humans more.
The single most important rule: Every feature we build must either (a) help recruiters avoid losing good candidates, (b) help them explain a rejection, or (c) save them measurable time. If it does none of these, don't build it.

text

---

## File 2: `STRATEGY.md` — For Your Co-Founder

This is the document you read together before every weekly sync. It's the "why" behind the "what."

```markdown
# STRATEGY.md — What We're Building and Why

**Last updated**: [DATE]
**Authors**: [YOU] + [PARTNER]
**Read this before every weekly sync.**

---

## The One-Sentence Version

We help mid-market recruiting teams stop losing good candidates to dumb automation — by flagging ambiguous candidates for human review instead of silently rejecting them.

---

## The Problem (In Plain English)

Here's what happens at a 150-person company hiring 5 engineers:

1. They post a job. 400 applications come in.
2. Their ATS (Greenhouse/Lever) auto-screens by keyword. It rejects 250 people.
3. Their 2 recruiters manually review the remaining 150.
4. They spend 23 hours screening resumes for *one* hire.
5. Meanwhile, 65% of the 250 auto-rejected candidates never got seen by a human. Some of them were good.
6. Months later, a hiring manager asks: "Why didn't we interview [great candidate]?" Nobody can answer. The rejection is unexplainable.

This is the **visibility gap**. It's the #1 concern for HR leaders in 2026, according to Paylocity's survey of 1,000 HR leaders. It beats bias, compliance, and candidate drop-off.

And it's getting worse:
- Recruiter headcount is **down 56%** since 2022.
- Applications per recruiter are **up 385%**.
- **92%** of recruiting leaders say AI-generated resumes are common. Resumes are less trustworthy than ever.
- **38%** of candidates have walked away from a hiring process because of AI. Companies are scared of being "the company that rejects people with robots."

---

## The Solution (What We Built)

We sit between the inbound application and the ATS. We:

1. **Extract** structured data from resumes (work history, education, skills) using an LLM.
2. **Score confidence** — how sure are we about this extraction? (0–100 per section)
3. **Flag uncertainty** — when dates are missing, when skills are implied, when work history is empty.
4. **Route to humans** — candidates with critical flags get a "Needs Review" badge, not an auto-reject.
5. **Explain every score** — recruiters can see *why* a candidate scored what they scored, with evidence from the resume.

**The differentiator isn't the extraction. It's the explainability and the uncertainty flagging.**

Every competitor scores candidates. Almost none say "I'm not sure about this one — a human should check." That's our wedge.

---

## Who We Sell To

**Primary ICP**: Mid-market in-house recruiting teams.
- Company size: 50–300 employees
- Recruiting team: 3–10 recruiters
- ATS: Greenhouse or Lever (we'll integrate with these first)
- Buyer: VP of Talent or Head of Recruiting
- Their budget: Already paying $350–$750/recruiter/mo for their ATS. They have room for a $500–$1,500/mo tool.

**Secondary ICP (later)**: Staffing agencies and RPO firms. They feel the pain even more acutely (speed is their margin), but they'll want white-labeling. That's a channel play, not a direct sale.

**We are NOT selling to**: Enterprise (1,000+ employees). They're buying Eightfold and hireEZ. Procurement takes 6–12 months. We'll get there, but not first.

---

## Why We Win (Our Three Moats)

### Moat 1: Explainability

Every score decomposes into evidence. Recruiters can see which skills were found, in which bullet points, with what confidence, and how recent. This is:
- **A sales feature**: It's the demo that makes recruiters lean forward.
- **A compliance feature**: NYC Local Law 144 and the EU AI Act require explainable AI for hiring. Most competitors can't answer "why was this candidate rejected?" We can.
- **A trust feature**: Recruiters don't trust black boxes. They trust systems that show their work.

### Moat 2: Uncertainty Flagging

We don't auto-reject. We flag and route to humans. This is:
- **A candidate experience play**: Companies are terrified of being "the company that rejects people with robots." We position as "human-in-the-loop by design."
- **A risk play**: When a hiring manager asks "why wasn't this person interviewed?", our customers can say "the system flagged them for human review, and here's why."
- **A fairness play**: We don't penalize candidates for parsing ambiguities.

### Moat 3: Compliance Readiness

Our architecture — audit trails, confidence scores, review flags, prompt versioning — is 80% of the compliance story. Every HR leader in 2026 is asking "will this get me audited?" We're the answer.

---

## Our Pricing

| Tier | Price | What's Included |
|------|-------|----------------|
| Starter | $299/mo | 500 apps/mo, 3 recruiter seats, basic explainability |
| Growth | $799/mo | 2,000 apps/mo, 10 seats, full confidence/uncertainty, ATS integration |
| Scale | $1,499/mo | Unlimited, custom scoring, compliance audit support |

**Pilot pricing**: $500/mo for 3 months, with a success metric. "We'll screen your next 100 applications for one role. If your recruiter doesn't save 4+ hours in the first month, month 2 is free."

**Revenue target**: $10K MRR within 6 months of first paid pilot. That's 12–20 customers. That's the signal that gets us into seed round conversations.

---

## The 90-Day Plan

### Days 1–14: Customer Discovery (BEFORE MORE CODE)

Find 10 mid-market recruiters. Ask them:
1. Walk me through how you screen a new batch of applications today.
2. What happens when your ATS rejects someone you would have interviewed?
3. How often does that happen?
4. What would you pay to never have that happen again?

**Do not pitch. Just listen.** Their words become our marketing copy.

### Days 15–28: Build the Demo

- Ship the "Why This Score" panel.
- Record a 3-minute Loom showing a real resume being screened.
- Post on LinkedIn.
- Build an interactive demo on the website (upload resume → see breakdown).

### Days 29–56: First Paid Pilots

- Offer 3 companies the pilot: $500/mo for 3 months, with success metric.
- Get written testimonials from every pilot customer.
- Iterate on their feedback weekly.

### Days 57–84: ATS Integration

- Build read-only Greenhouse integration.
- Get it working for pilot customers.
- Apply to Greenhouse partner program.
- Start building Lever integration.

### Days 85–90: Review & Decide

- If we have $2K–$5K MRR and 3–5 happy customers: start seed conversations.
- If not: figure out what's blocking us. Is it the product? The pitch? The ICP?

---

## Go-to-Market Plan

### Channel 1: LinkedIn (Primary)

Recruiters live on LinkedIn. Engagement rates for HR tech outreach are 14–20% — much higher than email (5–8%).

**What we do**:
- Post one "Screen This Resume" demo video per week. Anonymized. Real job description. Show the score breakdown and the uncertainty flag. Tag nobody.
- Write one deep-dive article per week on the pain points: "The Visibility Gap," "The Chaos Story," "NYC Local Law 144."
- Target "Dream 100" list: 100 mid-market companies actively hiring tech roles. Find their VP of Talent. Personalized outreach.

### Channel 2: Free "AI Screening Audit" (Lead Magnet)

Analyze a prospect's last 50 rejected candidates. Show them which ones *would have been flagged for human review* by our system. This is the "aha" moment that closes deals.

### Channel 3: ATS Marketplaces (Distribution Moat)

Once we have 5–10 customers on Greenhouse or Lever, apply to their partner programs. Getting listed in the Greenhouse marketplace is free distribution to every company using Greenhouse. That's thousands of potential customers.

### Channel 4: RPO/Staffing Channel (Later)

RPO firms are a $10.8B market. If we integrate with Bullhorn or JobAdder, we can sell to hundreds of staffing agencies through one integration. But this is a Phase 2 play.

---

## What We're NOT Doing (And Why)

- **LinkedIn scraping**: Legal liability. Breaks constantly. Distracts from screening. Use compliant data providers (People Data Labs, Bright Data) if we ever need sourcing.
- **Video interviews**: Different product category. Different buyer. Don't dilute.
- **Enterprise sales**: 6–12 month cycles. We'd burn out before revenue. Start mid-market.
- **Building all 78 roadmap items**: Phases 2–11 are a wish list, not a plan. We ship 5 things in the next 90 days. The rest waits.
- **Free trials**: YC's Tom Blomfield is right — free trials are too long and lack success metrics. Paid pilots with clear success criteria are better.

---

## How We Measure Success

### Leading indicators (weekly)
- Number of recruiter conversations had
- Number of demos given
- LinkedIn post engagement (comments from recruiters, not likes)

### Lagging indicators (monthly)
- MRR
- Number of paying customers
- Pilot → paid conversion rate
- Time saved per recruiter (customer-reported)

### The one number that matters most
**$10K MRR within 6 months of first paid pilot.** That's the signal.

---

## Our Roles

We need to decide who owns what. Suggested split:

**[YOU] — Product & Engineering**
- Owns the codebase, architecture, and technical roadmap
- Ships the "Why This Score" panel, scoring algorithm, ATS integration
- Writes technical blog posts / demo scripts

**[PARTNER] — GTM & Customer**
- Owns customer discovery, sales conversations, and pilot onboarding
- Runs LinkedIn presence, writes marketing content
- Manages the "Dream 100" outreach list
- Handles compliance research (NYC LL144, EU AI Act)

**Both of us**:
- Weekly sync (read this doc first)
- Customer calls (we both listen)
- Product decisions (we both vote)

---

## The Honest Risks

1. **We build too much before selling.** The 78-item roadmap is a trap. Customer discovery comes first.
2. **We target too broadly.** "Recruiters" is not an ICP. Mid-market in-house teams at 50–300 person companies is.
3. **We underprice.** $299/mo is not too expensive for a tool that saves 10 hours per hire. Don't race to the bottom.
4. **We get distracted by enterprise.** The first enterprise deal that comes along will look attractive. It will also take 9 months and kill our momentum.
5. **We forget the compliance story.** NYC LL144 and EU AI Act are not optional. Our compliance readiness is a feature, not overhead.

---

## The Weekly Sync Agenda

Every Monday, 30 minutes:

1. **Customer conversations this week** — what did we hear?
2. **Product shipped this week** — what changed?
3. **Blockers** — what's stuck?
4. **The one thing** — what's the single most important thing to do this week?
5. **Update this doc** — if anything changed, write it down.

---

## The One Rule

Every feature we build, every conversation we have, every dollar we spend must answer this question:

**Does this help a recruiter avoid losing a good candidate, or help them explain a rejection they can't otherwise explain?**

If yes, do it. If no, don't.
How to Use These Files

CLAUDE.md lives in the repo root. When you start a Claude Code session and say "build the Why This Score panel," Claude will already know: the tech stack, the type contracts, the directory structure, the priority order, and the hard rules (no LinkedIn scraping, no black boxes, log everything).

STRATEGY.md lives in your shared drive (Notion, Google Docs, whatever). You and your partner read it before every weekly sync. When one of you says "should we build X?", the answer is in section "What We're NOT Doing." When one of you says "who's our customer?", the answer is in "Who We Sell To."

Update both files as you learn. The moment a customer tells you something that contradicts STRATEGY.md, that's a signal — either the customer is wrong, or the doc is. Figure out which, then update the doc. The doc is the source of truth, not your memory.
````
