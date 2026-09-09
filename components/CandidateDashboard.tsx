'use client';

import React, { useState, useMemo } from 'react';
import { CandidateEvaluation } from '@/types';

interface CandidateDashboardProps {
  evaluations?: CandidateEvaluation[];
  jobTitle?: string;
}

// Helper function to export candidate evaluations to CSV
export function exportEvaluationsToCSV(evaluations: CandidateEvaluation[], jobTitle: string) {
  if (!evaluations || evaluations.length === 0) return;

  const headers = [
    "Candidate Name",
    "Email",
    "Status",
    "Overall Score",
    "Parsed Yrs Experience",
    "Skills Found",
    "Disqualification Reason",
    "Summary",
    "Resume URL"
  ];

  const rows = evaluations.map((e) => [
    `"${e.candidate_name.replace(/"/g, '""')}"`,
    `"${e.email || ""}"`,
    `"${e.status}"`,
    e.overall_score,
    e.parsed_years_experience,
    `"${e.skills_found.join(", ").replace(/"/g, '""')}"`,
    `"${(e.disqualification_reason || "").replace(/"/g, '""')}"`,
    `"${e.summary.replace(/"/g, '""')}"`,
    `"${e.resume_url}"`
  ]);

  const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `${jobTitle.toLowerCase().replace(/\s+/g, "_")}_evaluations_${new Date().toISOString().slice(0,10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export default function CandidateDashboard({ evaluations = [], jobTitle = "Senior Full-Stack TypeScript Engineer" }: CandidateDashboardProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'QUALIFIED' | 'DISQUALIFIED'>('ALL');

  // Sort by overall_score descending and apply filters
  const filteredAndSortedEvaluations = useMemo(() => {
    return [...evaluations]
      .filter((candidate) => {
        const matchesSearch = 
          candidate.candidate_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (candidate.email && candidate.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
          candidate.skills_found.some((skill: string) => skill.toLowerCase().includes(searchTerm.toLowerCase()));
        
        const matchesStatus = statusFilter === 'ALL' || candidate.status === statusFilter;

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => b.overall_score - a.overall_score);
  }, [evaluations, searchTerm, statusFilter]);

  return (
    <div className="bg-white shadow rounded-lg p-6 border border-gray-100">
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Candidate Evaluation Dashboard</h2>
          <p className="mt-1 text-sm text-gray-500">
            Review, filter, and sort candidate evaluations ranked by AI score.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">
            Total Candidates: {evaluations.length}
          </span>
          {evaluations.length > 0 && (
            <button
              onClick={() => exportEvaluationsToCSV(evaluations, jobTitle)}
              className="inline-flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
            >
              Export to CSV
            </button>
          )}
        </div>
      </div>

      {/* Controls / Filters */}
      <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="w-full sm:w-96">
          <input
            type="text"
            placeholder="Search by name, email, or skill..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm outline-none bg-white"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {(['ALL', 'QUALIFIED', 'DISQUALIFIED'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
                statusFilter === status
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Candidate List Grid / Table */}
      <div className="space-y-4">
        {filteredAndSortedEvaluations.length === 0 ? (
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-12 text-center text-gray-500 text-sm">
            No candidates found matching your criteria. Upload resumes above to get started.
          </div>
        ) : (
          filteredAndSortedEvaluations.map((candidate) => (
            <div
              key={candidate.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 transition-all hover:shadow-md flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6"
            >
              {/* Candidate Info & Summary */}
              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-lg font-bold text-gray-900">{candidate.candidate_name}</h3>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      candidate.status === 'QUALIFIED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {candidate.status}
                  </span>
                  {candidate.email && (
                    <span className="text-xs text-gray-500">({candidate.email})</span>
                  )}
                </div>

                <p className="text-sm text-gray-600 leading-relaxed">{candidate.summary}</p>

                {candidate.disqualification_reason && (
                  <p className="text-xs text-rose-600 font-medium">
                    Reason: {candidate.disqualification_reason}
                  </p>
                )}

                {/* Skills tags */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {candidate.skills_found.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs font-medium"
                    >
                      {String(skill)}
                    </span>
                  ))}
                  <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded text-xs font-medium">
                    {String(candidate.parsed_years_experience)} yrs exp
                  </span>
                </div>
              </div>

              {/* Score & Actions */}
              <div className="flex items-center gap-6 w-full lg:w-auto justify-between lg:justify-end border-t lg:border-t-0 pt-4 lg:pt-0 border-gray-100">
                <div className="text-center lg:text-right">
                  <div className="text-2xl font-black text-gray-900">
                    {candidate.overall_score}
                    <span className="text-xs text-gray-400 font-normal">/100</span>
                  </div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Overall Score</div>
                </div>

                {candidate.resume_url && (
                  <a
                    href={candidate.resume_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
                  >
                    View Resume
                  </a>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
