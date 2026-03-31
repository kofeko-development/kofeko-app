
export type UserRole = 'recruiter' | 'candidate' | 'operator';
export type CompanyRole = 'HR Admin' | 'Hiring Manager' | 'Interviewer';

export interface WorkExperience {
  company: string;
  role: string;
  startDate: string;
  endDate: string;
}

export interface User {
  uid: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  coverLetter?: string;
  skills?: string[];
  workExperience?: WorkExperience[];
  company?: string; // For recruiters
  companyRole?: CompanyRole; // For recruiters
  resumeUrl?: string; // For candidates
  linkedinProfileUrl?: string; // For recruiters
  status?: 'active' | 'pending' | 'suspended'; // for user management
}

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
