'use client';

import React, { useState } from 'react';
import { CandidateEvaluation } from '@/types';

interface BulkUploadFormProps {
  onUploadComplete: (evaluations: CandidateEvaluation[]) => void;
  jobId?: string;
}

export default function BulkUploadForm({
  onUploadComplete,
  jobId = 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
}: BulkUploadFormProps) {
  const [files, setFiles] = useState<FileList | null>(null);
  const [selectedModel, setSelectedModel] = useState('gemini-3.6-flash');
  const [uploading, setUploading] = useState(false);
  const [progressMessage, setProgressMessage] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(e.target.files);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!files || files.length === 0) {
      setError('Please select at least one PDF resume file.');
      return;
    }

    setUploading(true);
    setError(null);
    setProgressMessage(`Preparing ${files.length} resume(s) for AI evaluation...`);

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('resumes', files[i]);
    }
    formData.append('job_id', jobId);
    formData.append('model', selectedModel);

    try {
      setProgressMessage(`Uploading and analyzing resumes with ${selectedModel}...`);
      const response = await fetch('/api/resumes/bulk-upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process bulk upload.');
      }

      setProgressMessage(`Successfully evaluated ${data.processed_count} candidate(s)!`);
      if (data.evaluations) {
        onUploadComplete(data.evaluations);
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6 mb-8 border border-gray-100">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Bulk Resume Upload & AI Screener</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select AI Model (Switch if hitting rate limits)
          </label>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            disabled={uploading}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="gemini-3.6-flash">Gemini 3.6 Flash (Recommended)</option>
            <option value="gemini-3.5-flash">Gemini 3.5 Flash</option>
            <option value="gemini-3.5-flash-lite">Gemini 3.5 Flash Lite</option>
            <option value="gemini-3.1-flash-lite">Gemini 3.1 Flash Lite</option>
            <option value="gemini-3-flash-preview">Gemini 3 Flash Preview</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select PDF Resumes (Multiple files supported)
          </label>
          <input
            type="file"
            accept="application/pdf"
            multiple
            onChange={handleFileChange}
            disabled={uploading}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-indigo-50 file:text-indigo-700
              hover:file:bg-indigo-100 cursor-pointer"
          />
        </div>

        {files && files.length > 0 && (
          <p className="text-sm text-gray-600">
            Selected: <span className="font-semibold">{files.length}</span> file(s)
          </p>
        )}

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}

        {uploading && (
          <div className="p-3 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-md text-sm flex items-center space-x-3">
            <svg
              className="animate-spin h-5 w-5 text-indigo-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              ></path>
            </svg>
            <span>{progressMessage}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={uploading || !files || files.length === 0}
          className="w-full bg-indigo-600 text-white font-medium py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
        >
          {uploading ? 'Processing Resumes...' : 'Upload & Evaluate with AI'}
        </button>
      </form>
    </div>
  );
}
