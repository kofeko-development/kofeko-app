
export type UserRole = 'recruiter' | 'candidate' | 'operator';
export type CompanyRole = 'HR Admin' | 'Hiring Manager' | 'Recruiter' | 'Interviewer';

export interface WorkExperience {
  company: string;
  role: string;
  startDate: string;
  endDate: string;
}

export interface Education {
  institution: string;
  degree: string;
  field: string;
  dates: string;
}

export interface Project {
  name: string;
  description: string;
  technologies: string[];
}

export interface User {
  uid: string;
  email: string;
  name: string;
  role: UserRole;
  permissions?: string[];
  backendRoles?: string[];
  phone?: string;
  coverLetter?: string;
  skills?: string[];
  workExperience?: WorkExperience[];
  education?: Education[];
  projects?: Project[];
  hobbies?: string[];
  company?: string; // For recruiters
  companyRole?: CompanyRole; // For recruiters
  resumeUrl?: string; // For candidates
  linkedinProfileUrl?: string; // For recruiters
  status?: 'active' | 'pending' | 'suspended'; // for user management
}

/** Optional skill priorities for AI resume scoring (from job API `skillWeights`). */
export type JobSkillWeight = { skill: string; weight: number; yearsOfExperience?: number };

export interface Job {
  id: string;
  title: string;
  description: string;
  fullDescription?: string;
  company: string;
  location: string;
  department: string;
  postedAt: Date;
  status: 'open' | 'closed' | 'draft';
  recruiterId: string;
  applicantCount: number;
  /** Actual API status when loaded from the backend (open, paused, closed, draft). */
  backendStatus?: 'draft' | 'open' | 'paused' | 'closed';
  skillWeights?: JobSkillWeight[];
  experienceMin?: number;
  experienceMax?: number;
  employmentType?: string;
}

export type InterviewStatus = 'scheduled' | 'completed' | 'cancelled';

export interface Interview {
  id: string;
  applicantId: string;
  applicantName: string;
  jobId: string;
  jobTitle: string;
  interviewerId: string;
  interviewerName: string;
  date: string; // ISO string
  status: InterviewStatus;
  meetingLink?: string;
  transcript?: string;
  aiAnalysis?: {
    summary: string;
    strengths: string[];
    weaknesses: string[];
    sentiment: 'positive' | 'neutral' | 'negative';
    recommendation: string;
  };
}
