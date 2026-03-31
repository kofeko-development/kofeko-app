
'use client';

import { useParams, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, MapPin, Trash2, ArrowLeft } from "lucide-react";
import ApplicationTimeline from './_components/application-timeline';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import sanitizeHtml from 'sanitize-html';

// Mock data, in a real app this would be fetched from your database
const applicationData = {
    '1': { 
        jobId: '1', 
        title: 'Senior Frontend Developer', 
        company: 'TechCorp', 
        location: 'Remote',
        status: 'screening' as const,
        description: `
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
    '2': { 
        jobId: '2', 
        title: 'UX/UI Designer', 
        company: 'DesignCo', 
        location: 'New York, NY',
        status: 'interview' as const,
        description: `Description for UX/UI Designer...`
    },
     '4': { 
        jobId: '4', 
        title: 'Data Scientist', 
        company: 'DataMinds', 
        location: 'San Francisco, CA',
        status: 'offer' as const,
        description: `Description for Data Scientist...`
    }
};


export default function ApplicationStatusPage({ params }: { params: { id: keyof typeof applicationData } }) {
    const router = useRouter();
    const { toast } = useToast();
    const application = applicationData[params.id];

    if (!application) {
        return <p>Application not found.</p>
    }

    const handleWithdraw = () => {
        // In a real app, you would make an API call here to update the application status
        toast({
            title: 'Application Withdrawn',
            description: `You have successfully withdrawn your application for the ${application.title} position.`,
        });
        router.push('/dashboard');
    }
    
    const cleanDescription = sanitizeHtml(application.description, {
        allowedTags: [ 'h2', 'h3', 'p', 'ul', 'li', 'strong', 'em', 'b', 'i' ],
        allowedAttributes: {
          '*': [ 'class' ]
        }
    });

    return (
        <div className="flex flex-col gap-6">
             <Button variant="ghost" size="sm" onClick={() => router.back()} className="mb-2 w-fit p-0 h-auto">
                <ArrowLeft className="mr-2 h-4 w-4"/> Back to Applications
             </Button>
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold font-headline">{application.title}</h1>
                    <p className="text-muted-foreground flex items-center gap-4 mt-1">
                        <span>{application.company}</span>
                        <span className="flex items-center gap-1"><MapPin className="size-4" /> {application.location}</span>
                    </p>
                </div>
                 <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive">
                            <Trash2 className="mr-2 h-4 w-4"/> Withdraw Application
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently withdraw your application for the {application.title} position.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleWithdraw}>Yes, Withdraw</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Application Status</CardTitle>
                    <CardDescription>Track the progress of your application here.</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center p-8">
                   <ApplicationTimeline currentStatus={application.status} />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Job Description</CardTitle>
                </CardHeader>
                <CardContent>
                        <div className="prose prose-stone dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: cleanDescription }} />
                </CardContent>
            </Card>
        </div>
    )
}
