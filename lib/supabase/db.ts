import { supabaseServer } from './server';
import { CandidateEvaluation, JobPosting } from '@/types';

export async function uploadResumeToStorage(
  buffer: Buffer,
  fileName: string,
  contentType: string = 'application/pdf'
): Promise<string> {
  const sanitizedName = fileName.replace(/[^a-zA-Z0-9_.-]/g, '_');
  const filePath = `${Date.now()}_${sanitizedName}`;

  const { data, error } = await supabaseServer.storage
    .from('resumes')
    .upload(filePath, buffer, {
      contentType,
      upsert: true,
    });

  if (error) {
    throw new Error(`Failed to upload resume to storage: ${error.message}`);
  }

  const { data: publicUrlData } = supabaseServer.storage
    .from('resumes')
    .getPublicUrl(data.path);

  return publicUrlData.publicUrl;
}

export async function saveCandidateEvaluations(
  evaluations: CandidateEvaluation[]
): Promise<void> {
  if (!evaluations || evaluations.length === 0) return;

  const { error } = await supabaseServer
    .from('candidate_evaluations')
    .upsert(evaluations, { onConflict: 'id' });

  if (error) {
    throw new Error(`Failed to save candidate evaluations to database: ${error.message}`);
  }
}

export async function getJobPosting(jobId: string): Promise<JobPosting | null> {
  const { data, error } = await supabaseServer
    .from('job_postings')
    .select('*')
    .eq('id', jobId)
    .single();

  if (error || !data) {
    return null;
  }

  return data as JobPosting;
}
