import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';
import { JobPosting, CandidateEvaluation } from '@/types';
import { processBatchThrottled } from '@/lib/utils/batch';

// Ordered model fallback chain
const DEFAULT_MODEL_FALLBACK_CHAIN = [
  'gemini-3.6-flash',
  'gemini-3.5-flash',
  'gemini-3.5-flash-lite',
  'gemini-3.1-flash-lite',
  'gemini-3-flash-preview',
];

// Zod schema for structured extraction from resume text
const resumeExtractionSchema = z.object({
  candidate_name: z.string().describe('Full name of the candidate'),
  email: z.string().optional().describe('Email address if found'),
  skills_found: z.array(z.string()).describe('List of technical and professional skills found in the resume'),
  parsed_years_experience: z.number().describe('Total professional years of experience'),
  summary: z.string().describe('Brief professional summary of the candidate based on the resume'),
});

function isRateLimitOrQuotaError(error: unknown): boolean {
  const msg = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
  const status = (error as any)?.status || (error as any)?.statusCode;

  // Do not fallback for permanent errors like invalid API key, unauthenticated, or permission denied
  if (
    msg.includes('api_key') ||
    msg.includes('invalid api key') ||
    msg.includes('unauthenticated') ||
    msg.includes('permission_denied') ||
    msg.includes('authentication')
  ) {
    return false;
  }

  return (
    status === 429 ||
    status === 503 ||
    msg.includes('429') ||
    msg.includes('resource_exhausted') ||
    msg.includes('rate limit') ||
    msg.includes('quota') ||
    msg.includes('token') ||
    msg.includes('exhausted') ||
    msg.includes('overloaded')
  );
}

export async function evaluateResume(
  resumeText: string,
  jobPosting: JobPosting,
  resumeUrl: string = '',
  preferredModel: string = 'gemini-3.6-flash'
): Promise<CandidateEvaluation> {
  const fallbackChain = [
    preferredModel,
    ...DEFAULT_MODEL_FALLBACK_CHAIN.filter((m) => m !== preferredModel),
  ];

  let lastError: unknown = null;

  for (const modelToTry of fallbackChain) {
    let attempts = 2; // 2 attempts per model with backoff
    let success = false;
    let extractionResult: any = null;

    while (attempts > 0 && !success) {
      try {
        extractionResult = await generateObject({
          model: google(modelToTry),
          schema: resumeExtractionSchema,
          prompt: `Analyze the following resume text and extract candidate details:\n\n${resumeText}`,
        });
        success = true;
      } catch (error) {
        lastError = error;
        attempts--;

        if (isRateLimitOrQuotaError(error)) {
          if (attempts > 0) {
            console.warn(`[AI Evaluator] Model ${modelToTry} hit rate/quota limit. Retrying in 1.5s...`);
            await new Promise((r) => setTimeout(r, 1500));
            continue;
          } else {
            console.warn(`[AI Evaluator] Gemini model ${modelToTry} hit quota/rate limit. Falling back to next model.`);
          }
        } else {
          // Non-quota error (permanent error) -> throw immediately without falling back
          throw error;
        }
      }
    }

    if (success && extractionResult) {
      const { candidate_name, email, skills_found, parsed_years_experience, summary } = extractionResult.object;

      // Stage 2: Hard Disqualification Filter
      let status: 'QUALIFIED' | 'DISQUALIFIED' = 'QUALIFIED';
      let disqualification_reason: string | undefined = undefined;

      if (parsed_years_experience < jobPosting.min_years_experience) {
        status = 'DISQUALIFIED';
        disqualification_reason = `Parsed years of experience (${parsed_years_experience}) is less than the required minimum (${jobPosting.min_years_experience}).`;
      }

      // Stage 3: Deterministic Weighted Score Calculation
      const expRatio = Math.min(parsed_years_experience / Math.max(jobPosting.min_years_experience, 1), 2.0);
      const experienceScore = Math.min(expRatio * 50 + 50, 100);

      const matchedRequired = jobPosting.required_skills.filter(
        (req: string) => skills_found.some((s: string) => s.toLowerCase().includes(req.toLowerCase()))
      ).length;
      const requiredSkillsScore =
        jobPosting.required_skills.length > 0 ? (matchedRequired / jobPosting.required_skills.length) * 100 : 100;

      const matchedPreferred = jobPosting.preferred_skills.filter(
        (pref: string) => skills_found.some((s: string) => s.toLowerCase().includes(pref.toLowerCase()))
      ).length;
      const preferredSkillsScore =
        jobPosting.preferred_skills.length > 0 ? (matchedPreferred / jobPosting.preferred_skills.length) * 100 : 50;

      const skillsScore = requiredSkillsScore * 0.7 + preferredSkillsScore * 0.3;
      const educationScore = 80;

      const { experience_weight, skills_weight, education_weight } = jobPosting.weightings;
      const totalWeight = experience_weight + skills_weight + education_weight || 1;

      const overall_score = Math.round(
        (experienceScore * experience_weight + skillsScore * skills_weight + educationScore * education_weight) / totalWeight
      );

      if (status === 'QUALIFIED' && overall_score < 60) {
        status = 'DISQUALIFIED';
        disqualification_reason = 'Overall score below qualification threshold (60/100).';
      }

      return {
        id: `eval_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        job_id: jobPosting.id,
        candidate_name,
        email,
        status,
        overall_score,
        disqualification_reason,
        summary,
        skills_found,
        parsed_years_experience,
        resume_url: resumeUrl,
      };
    }
  }

  // If all fallback models are exhausted
  console.error('[AI Evaluator] All Gemini fallback models exhausted for resume evaluation:', lastError);
  throw new Error(`All Gemini fallback models exhausted: ${lastError instanceof Error ? lastError.message : 'Unknown error'}`);
}

export async function evaluateResumesBatch(
  resumes: { text: string; url?: string }[],
  jobPosting: JobPosting,
  batchSize: number = 2,
  delayMs: number = 2000,
  modelName: string = 'gemini-3.6-flash'
): Promise<CandidateEvaluation[]> {
  const results = await processBatchThrottled(resumes, batchSize, delayMs, async (resume) => {
    try {
      return await evaluateResume(resume.text, jobPosting, resume.url || '', modelName);
    } catch (err) {
      console.error('Failed to evaluate resume in batch:', err);
      throw err;
    }
  });
  return results.filter(Boolean);
}
