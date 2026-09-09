'use client';

import React, { useState } from 'react';
import BulkUploadForm from '@/components/BulkUploadForm';
import CandidateDashboard from '@/components/CandidateDashboard';
import JobPostingForm from '@/components/JobPostingForm';
import { CandidateEvaluation, JobPosting } from '@/types';

export default function HomePage() {
  const [evaluations, setEvaluations] = useState<CandidateEvaluation[]>([]);
  const [currentJob, setCurrentJob] = useState<JobPosting>({
    id: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    title: 'Senior Full-Stack TypeScript Engineer',
    status: 'published',
    min_years_experience: 3,
    required_skills: ['React', 'TypeScript', 'Node.js', 'Next.js'],
    preferred_skills: ['Tailwind CSS', 'PostgreSQL', 'Docker', 'GraphQL'],
    weightings: { experience_weight: 40, skills_weight: 40, education_weight: 20 },
    created_at: new Date().toISOString(),
  });

  const handleUploadComplete = (newEvaluations: CandidateEvaluation[]) => {
    setEvaluations((prev) => {
      const existingIds = new Set(prev.map((e) => e.id));
      const filteredNew = newEvaluations.filter((e) => !existingIds.has(e.id));
      return [...filteredNew, ...prev];
    });
  };

  const handleJobCreated = (job: JobPosting) => {
    setCurrentJob(job);
    setEvaluations([]);
  };

  return (
    <div className="space-y-8">
      <JobPostingForm onJobCreated={handleJobCreated} />

      <div className="bg-white shadow rounded-lg p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold text-gray-900">{currentJob.title}</h2>
          <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-3 py-1 rounded-full uppercase">
            {currentJob.status}
          </span>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Upload candidate PDF resumes to automatically parse details, evaluate against role requirements using Gemini 2.5 Flash, calculate weighted scores, and rank candidates.
        </p>
        <div className="flex flex-wrap gap-2 text-xs font-medium text-gray-700">
          <span className="bg-gray-100 px-3 py-1 rounded-full">Min Exp: {currentJob.min_years_experience} Years</span>
          <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full">
            Required: {currentJob.required_skills.join(', ')}
          </span>
          <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full">
            Preferred: {currentJob.preferred_skills.join(', ')}
          </span>
        </div>
      </div>

      <BulkUploadForm onUploadComplete={handleUploadComplete} jobId={currentJob.id} />

      <CandidateDashboard evaluations={evaluations} jobTitle={currentJob.title} />
    </div>
  );
}
