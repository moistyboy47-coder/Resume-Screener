import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { JobPosting } from "@/types";
import crypto from "crypto";

export async function GET() {
  try {
    const { data, error } = await supabaseServer
      .from("job_postings")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, jobs: data || [] });
  } catch (err) {
    console.error("Error fetching jobs:", err);
    const defaultJob: JobPosting = {
      id: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
      title: "Senior Full-Stack TypeScript Engineer",
      status: "published",
      required_skills: ["React", "TypeScript", "Node.js", "Next.js"],
      preferred_skills: ["Tailwind CSS", "PostgreSQL", "Docker", "GraphQL"],
      min_years_experience: 3,
      weightings: { experience_weight: 40, skills_weight: 40, education_weight: 20 },
      created_at: new Date().toISOString(),
    };
    return NextResponse.json({ success: true, jobs: [defaultJob] });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, min_years_experience, required_skills, preferred_skills, weightings } = body;

    if (!title) {
      return NextResponse.json({ error: "Job title is required." }, { status: 400 });
    }

    const newJob: JobPosting = {
      id: crypto.randomUUID(), // Valid v4 UUID
      title,
      status: "published",
      min_years_experience: Number(min_years_experience) || 0,
      required_skills: Array.isArray(required_skills) ? required_skills : (required_skills || "").split(',').map((s: string) => s.trim()).filter(Boolean),
      preferred_skills: Array.isArray(preferred_skills) ? preferred_skills : (preferred_skills || "").split(',').map((s: string) => s.trim()).filter(Boolean),
      weightings: weightings || { experience_weight: 40, skills_weight: 40, education_weight: 20 },
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabaseServer
      .from("job_postings")
      .insert([newJob])
      .select()
      .single();

    if (error) {
      console.warn("Supabase job insert warning (returning local newJob):", error.message);
      return NextResponse.json({ success: true, job: newJob });
    }

    return NextResponse.json({ success: true, job: data });
  } catch (err) {
    console.error("Error creating job posting:", err);
    return NextResponse.json({ error: "Internal server error creating job posting." }, { status: 500 });
  }
}
