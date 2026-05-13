
export type Notification = {
    id: string;
    applicantId: string;
    date: string;
    subject: string;
    body: string;
    read: boolean;
};

// In a real app, this would be a database.
export const applicantNotifications: Notification[] = [
    {
        id: 'notif-1',
        applicantId: 'candidate456',
        date: '2024-07-30T10:00:00Z',
        subject: 'Update on your application for UX/UI Designer',
        body: 'Hi Jessica,\n\nThank you for your interest in the UX/UI Designer role. We were impressed with your portfolio and would like to invite you for an initial screening call. Please let us know your availability for the coming week.\n\nBest regards,\nThe Kofeko Team',
        read: false,
    },
    {
        id: 'notif-2',
        applicantId: 'candidate456',
        date: '2024-07-28T15:30:00Z',
        subject: 'Update on your application for Senior Frontend Developer',
        body: 'Hi Jessica,\n\nWe have received your application for the Senior Frontend Developer position. Our team is currently reviewing it and we will get back to you soon.\n\nBest regards,\nThe Kofeko Team',
        read: true,
    }
];

export type Applicant = {
  id: string;
  candidateId: string;
  name: string;
  email: string;
  status: 'submitted' | 'screening' | 'interview' | 'offer' | 'rejected' | 'hired';
  appliedAt: string;
  matchScore: number;
  summary: string;
  phone?: string;
  linkedin?: string;
  resumeText?: string;
  experienceSummary?: string;
  trajectorySummary?: string;
  riskFlags?: string;
  keySkills?: string[];
};

export const applicantsData: Applicant[] = [
    { 
        id: '123', 
        candidateId: 'cand-123',
        name: 'Sarah Mayer', 
        email: 'sarah.mayer@example.com', 
        status: 'screening', 
        appliedAt: '2024-07-28', 
        matchScore: 92, 
        summary: 'Experienced Product Manager with a strong background in SaaS and agile methodologies.',
        experienceSummary: '8 years in product management at growth-stage SaaS companies. Led cross-functional teams of 10+ people.',
        trajectorySummary: 'Consistently promoted every 2 years. Moved from Associate PM to Senior Director level roles.',
        riskFlags: 'Minimal risks. Has mostly worked in large corporate structures, might need adjustment to early startup pace.',
        keySkills: ['Product Strategy', 'Agile/Scrum', 'Data Analysis', 'User Research', 'SQL'],
        phone: '123-456-7890',
        linkedin: 'linkedin.com/in/sarahmayer',
        resumeText: `Sarah Mayer - Product Manager...`
    },
    { 
        id: 'candidate456', 
        candidateId: 'cand-456',
        name: 'Jessica Williams', 
        email: 'candidate@kofeko.com', 
        status: 'interview', 
        appliedAt: '2024-07-27', 
        matchScore: 85, 
        summary: 'Creative UX/UI Designer with a passion for user-centered design and experience in mobile apps.',
        experienceSummary: '5 years of agency and in-house experience. Portfolio features high-traffic mobile applications.',
        trajectorySummary: 'Stable career growth. Transitioned from visual design to full-stack UX/UI design.',
        riskFlags: 'Limited experience with complex B2B enterprise design systems.',
        keySkills: ['Figma', 'Prototyping', 'User Interviews', 'Design Systems', 'Adobe CC'],
        phone: '111-222-3333',
        linkedin: 'linkedin.com/in/jessicawilliams',
        resumeText: 'Jessica Williams - UX/UI Designer...'
    },
    { 
        id: '125', 
        candidateId: 'cand-125',
        name: 'Jane Smith', 
        email: 'jane.smith@example.com', 
        status: 'screening', 
        appliedAt: '2024-07-26', 
        matchScore: 78, 
        summary: 'Full-stack developer with expertise in React and Node.js, looking for a challenging role.',
        experienceSummary: 'Strong focus on frontend but capable across the stack. 4 years of experience.',
        trajectorySummary: 'Upward trend. Has moved from junior to mid-level roles quickly.',
        riskFlags: 'Short tenure at the last two companies (less than 1 year each).',
        keySkills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'AWS'],
        phone: '222-333-4444',
        linkedin: 'linkedin.com/in/janesmith',
        resumeText: 'Jane Smith - Full-stack developer...'
    },
    { 
        id: '126', 
        candidateId: 'cand-126',
        name: 'Peter Jones', 
        email: 'peter.jones@example.com', 
        status: 'offer', 
        appliedAt: '2024-07-25', 
        matchScore: 95, 
        summary: 'Data Scientist with a knack for building predictive models and deriving actionable business insights.',
        experienceSummary: 'PhD in Computer Science with 6 years of industry experience in Fintech.',
        trajectorySummary: 'High achiever. Lead Data Scientist role within 4 years of joining industry.',
        riskFlags: 'Salary expectations may be above the current band for this role.',
        keySkills: ['Python', 'Machine Learning', 'TensorFlow', 'Statistics', 'R'],
        phone: '333-444-5555',
        linkedin: 'linkedin.com/in/peterjones',
        resumeText: 'Peter Jones - Data Scientist...'
    },
    { 
        id: '127', 
        candidateId: 'cand-127',
        name: 'Michael Brown', 
        email: 'michael.brown@example.com', 
        status: 'screening', 
        appliedAt: '2024-07-28', 
        matchScore: 65, 
        summary: 'Junior developer eager to learn and contribute to a fast-paced team environment.',
        experienceSummary: 'Recent bootcamp graduate with a few freelance projects under his belt.',
        trajectorySummary: 'Career changer. Previous background in finance brings good soft skills.',
        riskFlags: 'Lacks professional experience in a team setting. High ramp-up time expected.',
        keySkills: ['JavaScript', 'HTML/CSS', 'React Basics', 'Git'],
        phone: '444-555-6666',
        linkedin: 'linkedin.com/in/michaelbrown',
        resumeText: 'Michael Brown - Junior developer...'
    }
];
