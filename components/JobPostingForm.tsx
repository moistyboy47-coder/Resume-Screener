"use client";

import React, { useState } from "react";
import { JobPosting } from "@/types";

interface JobPostingFormProps {
  onJobCreated: (job: JobPosting) => void;
}

export default function JobPostingForm({ onJobCreated }: JobPostingFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [minExp, setMinExp] = useState(0);
  const [requiredSkills, setRequiredSkills] = useState(
    "React, TypeScript, Node.js, Next.js",
  );
  const [preferredSkills, setPreferredSkills] = useState(
    "Tailwind CSS, PostgreSQL, Docker",
  );
  const [expWeight, setExpWeight] = useState(40);
  const [skillsWeight, setSkillsWeight] = useState(40);
  const [eduWeight, setEduWeight] = useState(20);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Job title is required.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          min_years_experience: minExp,
          required_skills: requiredSkills
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          preferred_skills: preferredSkills
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          weightings: {
            experience_weight: Number(expWeight),
            skills_weight: Number(skillsWeight),
            education_weight: Number(eduWeight),
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create job posting.");
      }

      if (data.job) {
        onJobCreated(data.job);
        setTitle("");
        setIsOpen(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6 mb-8 border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Job Posting Management
          </h2>
          <p className="text-sm text-gray-500">
            Configure target role, required skills, and score weightings.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-semibold rounded-lg transition-colors"
        >
          {isOpen ? "Close Form" : "+ Create New Job Position"}
        </button>
      </div>

      {isOpen && (
        <form
          onSubmit={handleSubmit}
          className="space-y-4 pt-4 border-t border-gray-100"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Job Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Senior AI Engineer"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Years Experience
              </label>
              <input
                type="number"
                value={minExp}
                onChange={(e) => setMinExp(Number(e.target.value))}
                min={0}
                max={20}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Required Skills (Comma separated)
              </label>
              <input
                type="text"
                value={requiredSkills}
                onChange={(e) => setRequiredSkills(e.target.value)}
                placeholder="React, TypeScript, Python"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preferred Skills (Comma separated)
              </label>
              <input
                type="text"
                value={preferredSkills}
                onChange={(e) => setPreferredSkills(e.target.value)}
                placeholder="Docker, AWS, GraphQL"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Score Weightings (%)
            </label>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <span className="text-xs text-gray-500 block mb-1">
                  Experience Weight
                </span>
                <input
                  type="number"
                  value={expWeight}
                  onChange={(e) => setExpWeight(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
              <div>
                <span className="text-xs text-gray-500 block mb-1">
                  Skills Weight
                </span>
                <input
                  type="number"
                  value={skillsWeight}
                  onChange={(e) => setSkillsWeight(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
              <div>
                <span className="text-xs text-gray-500 block mb-1">
                  Education Weight
                </span>
                <input
                  type="number"
                  value={eduWeight}
                  onChange={(e) => setEduWeight(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
            </div>
          </div>

          {error && <p className="text-xs text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-indigo-600 text-white font-medium py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors text-sm"
          >
            {submitting ? "Creating Job..." : "Save & Select Job"}
          </button>
        </form>
      )}
    </div>
  );
}
