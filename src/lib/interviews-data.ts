
import type { Interview } from './types';

export const interviewsData: Interview[] = [
  {
    id: 'int-1',
    applicantId: '123',
    applicantName: 'Sarah Mayer',
    jobId: '1',
    jobTitle: 'Senior Frontend Developer',
    interviewerId: 'recruiter123',
    interviewerName: 'Alex Johnson',
    date: '2024-08-05T14:00:00Z',
    status: 'scheduled',
    meetingLink: 'https://meet.google.com/abc-defg-hij',
  },
  {
    id: 'int-2',
    applicantId: 'candidate456',
    applicantName: 'Jessica Williams',
    jobId: '2',
    jobTitle: 'UX/UI Designer',
    interviewerId: 'recruiter-hm-1',
    interviewerName: 'Bob Williams',
    date: '2024-08-06T10:30:00Z',
    status: 'scheduled',
    meetingLink: 'https://zoom.us/j/123456789',
  },
  {
    id: 'int-3',
    applicantId: '125',
    applicantName: 'Jane Smith',
    jobId: '1',
    jobTitle: 'Senior Frontend Developer',
    interviewerId: 'recruiter123',
    interviewerName: 'Alex Johnson',
    date: '2024-07-25T11:00:00Z',
    status: 'completed',
    transcript: "Alex: Hi Jane, thanks for joining us today. Can you tell me about your experience with Next.js?\n\nJane: Absolutely. I've been using Next.js for the past three years, specifically focusing on the App Router and server components. In my last project, we migrated a large-scale React app to Next.js which resulted in a 40% improvement in LCP...\n\nAlex: That's impressive. How do you handle complex state management in that environment?",
    aiAnalysis: {
      summary: "Jane demonstrated deep technical knowledge of Next.js and performance optimization. She communicated her past projects with high clarity and technical depth.",
      strengths: ["Expert Next.js knowledge", "Clear communication", "Performance-oriented mindset"],
      weaknesses: ["Limited experience with GraphQL", "Primarily worked in small teams"],
      sentiment: 'positive',
      recommendation: "Strong candidate for the Senior role. Proceed to technical deep-dive with the Engineering Lead."
    }
  },
  {
    id: 'int-4',
    applicantId: 'candidate456',
    applicantName: 'Jessica Williams',
    jobId: '2',
    jobTitle: 'UX/UI Designer',
    interviewerId: 'recruiter-hm-1',
    interviewerName: 'Bob Williams',
    date: '2024-07-20T14:30:00Z',
    status: 'completed',
    transcript: "Bob: Hi Jessica, let's talk about your design process. How do you approach a new mobile app project?\n\nJessica: I always start with user research. Understanding the pain points is key. Then I move to low-fidelity wireframes to iterate on the flow before touching high-fidelity visuals in Figma...\n\nBob: How do you handle feedback from stakeholders who might not have a design background?",
    aiAnalysis: {
      summary: "Jessica has a very mature design process centered on user research. She is articulate and defends her design decisions well while remaining open to feedback.",
      strengths: ["User-centric methodology", "Excellent Figma skills", "Strong presentation ability"],
      weaknesses: ["Less experience with design systems at scale", "Limited prototyping interaction depth"],
      sentiment: 'positive',
      recommendation: "High potential. Her focus on research is exactly what we need for the upcoming redesign."
    }
  },
  {
    id: 'int-5',
    applicantId: '126',
    applicantName: 'Peter Jones',
    jobId: '4',
    jobTitle: 'Data Scientist',
    interviewerId: 'recruiter123',
    interviewerName: 'Alex Johnson',
    date: '2024-07-18T09:00:00Z',
    status: 'completed',
    transcript: "Alex: Peter, can you walk me through a time you found a surprising insight in a large dataset?\n\nPeter: Sure. Working with e-commerce data, I noticed that users who visited the 'about us' page had a 3x higher conversion rate, but only 2% of users were seeing it. We moved the link to the header and saw a significant lift...\n\nAlex: Interesting. What models did you use for that analysis?",
    aiAnalysis: {
      summary: "Peter is highly analytical and business-focused. He understands how to translate data into actionable product changes. His technical stack is solid but fairly standard.",
      strengths: ["Business acumen", "Actionable insights", "Clear storytelling"],
      weaknesses: ["Could deepen knowledge in deep learning", "Prefers higher-level abstractions over custom math"],
      sentiment: 'positive',
      recommendation: "Solid hire for a growth-stage startup. He won't just build models; he'll help drive the roadmap."
    }
  },
  {
    id: 'int-6',
    applicantId: '123',
    applicantName: 'Sarah Mayer',
    jobId: '1',
    jobTitle: 'Senior Frontend Developer',
    interviewerId: 'recruiter-int-1',
    interviewerName: 'Charlie Brown',
    date: '2024-07-15T16:00:00Z',
    status: 'completed',
    transcript: "Charlie: Sarah, how do you keep up with the fast-moving frontend ecosystem?\n\nSarah: I'm a big fan of reading technical blogs and participating in open source. I recently contributed a fix to a popular UI library...\n\nCharlie: That's great. What are your thoughts on the current state of CSS-in-JS?",
    aiAnalysis: {
      summary: "Sarah is a self-starter with a genuine passion for the craft. She's technically curious and has a broad understanding of the ecosystem.",
      strengths: ["Open source contributor", "Constant learner", "Broad tech stack awareness"],
      weaknesses: ["A bit opinionated on specific toolsets", "Might struggle in highly restrictive environments"],
      sentiment: 'positive',
      recommendation: "Great fit for our culture. Her proactive nature will be an asset to the team."
    }
  },
  {
    id: 'int-7',
    applicantId: '127',
    applicantName: 'Michael Brown',
    jobId: '1',
    jobTitle: 'Senior Frontend Developer',
    interviewerId: 'recruiter-hm-1',
    interviewerName: 'Bob Williams',
    date: '2024-07-12T10:00:00Z',
    status: 'completed',
    transcript: "Bob: Michael, tell me about your experience with Tailwind.\n\nMichael: I've used it on a few small projects. I like the speed but sometimes find the class names hard to manage...\n\nBob: How do you approach responsive design with it?",
    aiAnalysis: {
      summary: "Michael is a capable junior developer but lacks the depth required for a senior role. His answers were honest but lacked technical complexity.",
      strengths: ["Honest self-assessment", "Quick learner", "Positive attitude"],
      weaknesses: ["Lacks architectural depth", "Minimal experience with large scale state management"],
      sentiment: 'neutral',
      recommendation: "Not suitable for the Senior role. Consider for a Junior/Mid level position if one opens up."
    }
  },
  {
    id: 'int-8',
    applicantId: '128',
    applicantName: 'Emily White',
    jobId: '5',
    jobTitle: 'Marketing Manager',
    interviewerId: 'recruiter-int-1',
    interviewerName: 'Charlie Brown',
    date: '2024-07-10T11:30:00Z',
    status: 'completed',
    transcript: "Charlie: Emily, how would you approach our Q4 marketing strategy?\n\nEmily: I'd probably just look at what the competitors are doing and do the same but with more spend...\n\nCharlie: Do you have experience with data-driven attribution models?",
    aiAnalysis: {
      summary: "Emily's approach to marketing is largely intuitive and lacks the data-driven rigor we require. She struggled to provide specific examples of successful campaigns she's led.",
      strengths: ["Confident speaker", "Good visual taste"],
      weaknesses: ["Lacks data-driven mindset", "Poor understanding of attribution", "Minimal ROI focus"],
      sentiment: 'negative',
      recommendation: "Do not move forward. The candidate's methodology is not aligned with our performance-based culture."
    }
  }
];
