-- Supabase PostgreSQL Schema for AI Resume Screener MVP

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Job Postings Table
CREATE TABLE IF NOT EXISTS job_postings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'closed')),
    required_skills TEXT[] NOT NULL DEFAULT '{}',
    preferred_skills TEXT[] NOT NULL DEFAULT '{}',
    min_years_experience INTEGER NOT NULL DEFAULT 0,
    weightings JSONB NOT NULL DEFAULT '{"experience_weight": 40, "skills_weight": 40, "education_weight": 20}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Candidate Evaluations Table
CREATE TABLE IF NOT EXISTS candidate_evaluations (
    id TEXT PRIMARY KEY,
    job_id UUID NOT NULL REFERENCES job_postings(id) ON DELETE CASCADE,
    candidate_name TEXT NOT NULL,
    email TEXT,
    status TEXT NOT NULL CHECK (status IN ('QUALIFIED', 'DISQUALIFIED')),
    overall_score INTEGER NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),
    disqualification_reason TEXT,
    summary TEXT NOT NULL DEFAULT '',
    skills_found TEXT[] NOT NULL DEFAULT '{}',
    parsed_years_experience NUMERIC NOT NULL DEFAULT 0,
    resume_url TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_candidate_evaluations_job_id ON candidate_evaluations(job_id);
CREATE INDEX IF NOT EXISTS idx_candidate_evaluations_status ON candidate_evaluations(status);
CREATE INDEX IF NOT EXISTS idx_candidate_evaluations_overall_score ON candidate_evaluations(overall_score DESC);

-- 3. Row Level Security (RLS)
ALTER TABLE job_postings ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_evaluations ENABLE ROW LEVEL SECURITY;

-- Job Postings Policies
CREATE POLICY "Allow public read on job_postings"
    ON job_postings FOR SELECT
    USING (true);

CREATE POLICY "Allow authenticated/service insert on job_postings"
    ON job_postings FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Allow authenticated/service update on job_postings"
    ON job_postings FOR UPDATE
    USING (true);

-- Candidate Evaluations Policies
CREATE POLICY "Allow public read on candidate_evaluations"
    ON candidate_evaluations FOR SELECT
    USING (true);

CREATE POLICY "Allow authenticated/service insert on candidate_evaluations"
    ON candidate_evaluations FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Allow authenticated/service update on candidate_evaluations"
    ON candidate_evaluations FOR UPDATE
    USING (true);

-- 4. Storage Bucket Setup for Resumes
INSERT INTO storage.buckets (id, name, public)
VALUES ('resumes', 'resumes', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies for 'resumes' Bucket
CREATE POLICY "Allow public read on resumes bucket"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'resumes');

CREATE POLICY "Allow public/service upload to resumes bucket"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'resumes');

-- 5. Seed Initial Sample Job Posting for Testing
INSERT INTO job_postings (
    id,
    title,
    status,
    required_skills,
    preferred_skills,
    min_years_experience,
    weightings
) VALUES (
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    'Senior Full-Stack TypeScript Engineer',
    'published',
    ARRAY['TypeScript', 'React', 'Node.js', 'Next.js'],
    ARRAY['PostgreSQL', 'Tailwind CSS', 'Docker', 'GraphQL'],
    3,
    '{"experience_weight": 40, "skills_weight": 40, "education_weight": 20}'::jsonb
) ON CONFLICT (id) DO NOTHING;
