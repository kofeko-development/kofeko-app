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

  if (!user.phone?.trim()) {
    missing.push('Phone Number');
  }

  // Note: Work experience, skills, education, project, hobbies, and cover letter are optional
  // Only Email (handled at auth level), Phone Number, and Resume are mandatory

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
