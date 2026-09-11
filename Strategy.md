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
4. They spend 23 hours screening resumes for _one_ hire.
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
5. **Explain every score** — recruiters can see _why_ a candidate scored what they scored, with evidence from the resume.

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

| Tier    | Price     | What's Included                                                       |
| ------- | --------- | --------------------------------------------------------------------- |
| Starter | $299/mo   | 500 apps/mo, 3 recruiter seats, basic explainability                  |
| Growth  | $799/mo   | 2,000 apps/mo, 10 seats, full confidence/uncertainty, ATS integration |
| Scale   | $1,499/mo | Unlimited, custom scoring, compliance audit support                   |

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

Analyze a prospect's last 50 rejected candidates. Show them which ones _would have been flagged for human review_ by our system. This is the "aha" moment that closes deals.

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
