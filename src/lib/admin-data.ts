
import type { User } from './types';

// This file contains mock data for the admin panel.
// In a real application, this would come from your database.

export const allUsers: User[] = [
  // Existing users from the main app
  {
    uid: 'recruiter123',
    email: 'recruiter@kofeko.com',
    name: 'Alex Johnson',
    role: 'recruiter',
    companyRole: 'HR Admin',
    linkedinProfileUrl: 'https://linkedin.com/company/firebase',
    status: 'active',
    company: 'TechCorp',
  },
  {
    uid: 'recruiter-hm-1',
    email: 'hiring.manager@kofeko.com',
    name: 'Bob Williams',
    role: 'recruiter',
    companyRole: 'Hiring Manager',
    status: 'active',
    company: 'TechCorp',
  },
  {
    uid: 'recruiter-int-1',
    email: 'interviewer@kofeko.com',
    name: 'Charlie Brown',
    role: 'recruiter',
    companyRole: 'Interviewer',
    status: 'active',
    company: 'TechCorp',
  },
  {
    uid: 'candidate456',
    email: 'candidate@kofeko.com',
    name: 'Jessica Williams',
    role: 'candidate',
    status: 'active',
  },
   {
    uid: 'operator789',
    email: 'operator@kofeko.com',
    name: 'Kofeko Operator',
    role: 'operator',
    status: 'active',
},

  // New users who have signed up for early access (pending approval)
  {
    uid: 'pending-recruiter-1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'recruiter',
    companyRole: 'Hiring Manager',
    status: 'pending',
    company: 'Innovate LLC',
    linkedinProfileUrl: 'https://linkedin.com/company/innovate-llc',
  },
  {
    uid: 'pending-recruiter-2',
    name: 'Jane Smith',
    email: 'jane.smith@work.com',
    role: 'recruiter',
    companyRole: 'Interviewer',
    status: 'pending',
    company: 'GrowthPeak',
    linkedinProfileUrl: 'https://linkedin.com/company/growthpeak',
  },
   {
    uid: 'pending-candidate-1',
    name: 'Peter Jones',
    email: 'peter.jones@email.com',
    role: 'candidate',
    status: 'pending',
  },
  {
    uid: 'suspended-recruiter-1',
    name: 'Sam Brown',
    email: 'sam.brown@company.com',
    role: 'recruiter',
    companyRole: 'HR Admin',
    status: 'suspended',
    company: 'Old Company',
    linkedinProfileUrl: 'https://linkedin.com/company/old-company',
  },
];
