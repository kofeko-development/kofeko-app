
import type { Job } from "./types";

export const jobs: Job[] = [
    { 
        id: '1', 
        title: 'Senior Frontend Developer', 
        company: 'TechCorp', 
        location: 'Remote',
        department: 'Engineering',
        postedAt: new Date('2024-07-15T09:00:00Z'),
        status: 'open',
        recruiterId: 'recruiter123',
        applicantCount: 25,
        description: 'Lead the development of our next-gen user interfaces with React and TypeScript.',
        fullDescription: `
<h2 class="text-xl font-bold mb-4">About the Role</h2>
<p class="mb-4">We are seeking a passionate and experienced Senior Frontend Developer to join our dynamic team. In this role, you will be responsible for leading the development of our next-generation user interfaces, creating reusable components, and ensuring our applications are performant, accessible, and scalable. You'll work closely with our design and product teams to bring innovative ideas to life.</p>
<h3 class="text-lg font-bold mb-2">Responsibilities:</h3>
<ul class="list-disc list-inside mb-4 space-y-1">
  <li>Develop and maintain high-quality, reusable, and scalable frontend code using React and TypeScript.</li>
  <li>Collaborate with UI/UX designers to translate wireframes and mockups into functional web applications.</li>
  <li>Participate in code reviews to maintain a high-quality code culture.</li>
</ul>
<h3 class="text-lg font-bold mb-2">Qualifications:</h3>
<ul class="list-disc list-inside mb-4 space-y-1">
  <li>5+ years of professional experience in frontend development.</li>
  <li>Expertise in React, JavaScript (ES6+), and TypeScript.</li>
  <li>Strong understanding of HTML5, CSS3, and responsive design principles.</li>
</ul>
`
    },
    { 
        id: '2', 
        title: 'UX/UI Designer', 
        company: 'DesignCo', 
        location: 'New York, NY',
        department: 'Design',
        postedAt: new Date('2024-07-12T11:00:00Z'),
        status: 'open',
        recruiterId: 'recruiter123',
        applicantCount: 12,
        description: 'Create intuitive and beautiful user experiences for our web and mobile apps.',
        fullDescription: 'Description for UX/UI Designer...'
    },
    { 
        id: '3', 
        title: 'Product Manager', 
        company: 'TechCorp', 
        location: 'Remote',
        department: 'Product',
        postedAt: new Date('2024-07-10T14:00:00Z'),
        status: 'closed',
        recruiterId: 'recruiter123',
        applicantCount: 3,
        description: 'Drive product strategy and roadmap for our core SaaS product.',
        fullDescription: 'Description for Product Manager...'
    },
    { 
        id: '4', 
        title: 'Data Scientist', 
        company: 'DataMinds', 
        location: 'San Francisco, CA',
        department: 'Data Science',
        postedAt: new Date('2024-07-20T10:00:00Z'),
        status: 'open',
        recruiterId: 'recruiter123',
        applicantCount: 42,
        description: 'Analyze large datasets to extract meaningful insights and drive business decisions.',
        fullDescription: 'Description for Data Scientist...'
    },
    { 
        id: '5', 
        title: 'Marketing Manager', 
        company: 'Growth Co.', 
        location: 'Austin, TX',
        department: 'Marketing',
        postedAt: new Date('2024-07-22T10:00:00Z'),
        status: 'draft',
        recruiterId: 'recruiter123',
        applicantCount: 0,
        description: 'Develop and execute marketing strategies to drive growth.',
        fullDescription: 'Description for Marketing Manager...'
    }
];
