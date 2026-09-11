// types/index.ts

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
  status: "QUALIFIED" | "DISQUALIFIED";
  overall_score: number;
  disqualification_reason?: string;
  summary: string;
  skills_found: string[];
  parsed_years_experience: number;
  resume_url: string;
};
