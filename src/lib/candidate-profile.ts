import type { User } from './types';

const MIN_ABOUT_LENGTH = 20;

export type CandidateProfileCompletion = {
  isComplete: boolean;
  missing: string[];
};

/** Whether a candidate has enough profile data to apply to jobs. */
export function getCandidateProfileCompletion(user: User | null | undefined): CandidateProfileCompletion {
  if (!user || user.role !== 'candidate') {
    return { isComplete: false, missing: ['Candidate profile'] };
  }

  const missing: string[] = [];

  if (!user.resumeUrl?.trim()) {
    missing.push('Resume');
  }

  const about = user.coverLetter?.trim() ?? '';
  if (about.length < MIN_ABOUT_LENGTH) {
    missing.push('About (professional summary)');
  }

  return {
    isComplete: missing.length === 0,
    missing,
  };
}

export function canCandidateApply(
  user: User | null | undefined,
  options?: { resumeFileSelected?: boolean },
): boolean {
  const { isComplete } = getCandidateProfileCompletion(user);
  if (!isComplete) return false;

  const hasResume = Boolean(user?.resumeUrl?.trim() || options?.resumeFileSelected);
  return hasResume;
}
