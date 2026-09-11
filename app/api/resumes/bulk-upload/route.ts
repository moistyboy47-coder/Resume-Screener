import { NextRequest, NextResponse } from "next/server";
import { extractPdfText } from "@/lib/parser/pdf";
import { evaluateResume } from "@/lib/ai/evaluator";
import { processBatchThrottled } from "@/lib/utils/batch";
import {
  uploadResumeToStorage,
  saveCandidateEvaluations,
  getJobPosting,
} from "@/lib/supabase/db";
import { JobPosting, CandidateEvaluation } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("resumes") as File[];
    const jobId =
      (formData.get("job_id") as string) ||
      "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d";
    const model = (formData.get("model") as string) || "gemini-3.6-flash";

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: "No resume files uploaded." },
        { status: 400 },
      );
    }

    // 1. Fetch Job Posting from Supabase (or fallback to default mock)
    let job = await getJobPosting(jobId);
    if (!job) {
      job = {
        id: jobId,
        title: "Senior Full-Stack TypeScript Engineer",
        status: "published",
        min_years_experience: 0,
        required_skills: ["React", "TypeScript", "Node.js", "Next.js"],
        preferred_skills: ["Tailwind CSS", "PostgreSQL", "Docker", "GraphQL"],
        weightings: {
          experience_weight: 40,
          skills_weight: 40,
          education_weight: 20,
        },
        created_at: new Date().toISOString(),
      };
    }

    // 2. Process each uploaded file
    const processSingleFile = async (
      file: File,
    ): Promise<CandidateEvaluation | null> => {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Extract text from PDF
        const resumeText = await extractPdfText(buffer);

        // Upload PDF to Supabase Storage
        let resumeUrl = "";
        try {
          resumeUrl = await uploadResumeToStorage(
            buffer,
            file.name,
            file.type || "application/pdf",
          );
        } catch (storageErr) {
          console.warn(`Storage upload warning for ${file.name}:`, storageErr);
        }

        // Run AI Evaluation
        const evaluation = await evaluateResume(
          resumeText,
          job!,
          resumeUrl,
          model,
        );
        return evaluation;
      } catch (err) {
        console.error(`Failed to process ${file.name}:`, err);
        return null;
      }
    };

    // 3. Throttle requests in batches of 2 with 2s delay to respect Gemini free tier limits
    const rawResults = await processBatchThrottled(
      files,
      2,
      2000,
      processSingleFile,
    );
    const validEvaluations = rawResults.filter(
      (item): item is CandidateEvaluation => item !== null,
    );

    if (validEvaluations.length === 0) {
      return NextResponse.json(
        { error: "Failed to process any of the uploaded resumes." },
        { status: 500 },
      );
    }

    // 4. Save evaluation records to PostgreSQL
    try {
      await saveCandidateEvaluations(validEvaluations);
    } catch (dbErr) {
      console.warn(
        "Database insert warning (returning evaluations anyway):",
        dbErr,
      );
    }

    return NextResponse.json({
      success: true,
      processed_count: validEvaluations.length,
      evaluations: validEvaluations,
    });
  } catch (error) {
    console.error("Bulk Upload Error:", error);
    return NextResponse.json(
      { error: "Internal server error during batch upload processing." },
      { status: 500 },
    );
  }
}
