'use server';
/**
 * @fileOverview An AI flow for building job descriptions.
 *
 * - buildJobDescription - A function that generates a job description.
 * - BuildJobDescriptionInput - The input type for the buildJobDescription function.
 */

import { z } from 'zod';

export const BuildJobDescriptionInputSchema = z.object({
  jobTitle: z.string().describe('The title of the job.'),
  requirements: z.string().describe('The key requirements and skills for the job.'),
  location: z.string().optional().describe('The location of the job.'),
  jobType: z.string().optional().describe('The type of job (e.g., On-site, Remote, Hybrid).'),
  employmentType: z.string().optional().describe('The type of employment (e.g., Full-time, Part-time, Contract).'),
});
export type BuildJobDescriptionInput = z.infer<typeof BuildJobDescriptionInputSchema>;


export async function buildJobDescription(input: BuildJobDescriptionInput): Promise<string> {
  const template = `
<h2>About Kofeko</h2>
<p>Kofeko is an AI-powered hiring co-pilot designed for startups and SMBs. We accelerate hiring by structuring roles, understanding candidates beyond keywords, and removing ambiguity at decision points — without taking control away from you.</p>

<h2>Our Mission</h2>
<p>To empower organizations to hire smarter and faster by leveraging AI to streamline the entire recruitment lifecycle, from creating compelling job descriptions to identifying the best-fit candidates.</p>

<h2>The Role: ${input.jobTitle}</h2>
<p>We are seeking a passionate and experienced ${input.jobTitle || 'Professional'} to join our team. In this role, you will be a key player in shaping our product's user experience. You will be responsible for leading the development of our next-generation user interfaces, creating reusable components, and ensuring our applications are performant, accessible, and scalable. You'll work closely with our design and product teams to bring innovative ideas to life.</p>

<h3>Core Expectations</h3>
<ul>
  <li>Develop and maintain high-quality, reusable, and scalable frontend code using React and TypeScript.</li>
  <li>Collaborate with UI/UX designers to translate wireframes and mockups into functional web applications.</li>
  <li>Own features from conception to deployment, including architectural design, implementation, and testing.</li>
  <li>Champion best practices for frontend development, including performance, accessibility, and testing.</li>
</ul>

<h3>Required Skills & Experience</h3>
<ul>
  <li>5+ years of professional experience in your field.</li>
  <li>Expertise in relevant technologies for the role.</li>
  <li>Strong understanding of industry best practices.</li>
  <li>A keen eye for detail and a passion for creating excellent work.</li>
</ul>

<h3>Nice to Have Skills & Certifications</h3>
<ul>
  <li>Experience with data visualization libraries (e.g., D3.js, Recharts).</li>
  <li>Familiarity with backend technologies (Node.js, GraphQL).</li>
  <li>Contributions to open-source projects.</li>
  <li>Relevant industry certifications.</li>
</ul>
`;
  return Promise.resolve(template);
}
