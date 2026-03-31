
'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
    CalendarDays, 
    Clock, 
    Video, 
    FileText, 
    Sparkles, 
    Plus, 
    Search, 
    ChevronRight, 
    History, 
    BrainCircuit,
    MoreHorizontal,
    ExternalLink
} from 'lucide-react';
import { 
    Dialog, 
    DialogContent, 
    DialogDescription, 
    DialogHeader, 
    DialogTitle, 
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog";
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { interviewsData } from '@/lib/interviews-data';
import { applicantsData } from '@/lib/data';
import { jobs } from '@/lib/jobs-data';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import type { Interview } from '@/lib/types';

export default function InterviewsPage() {
    const { toast } = useToast();
    const [interviews, setInterviews] = useState(interviewsData);
    const [isScheduleOpen, setIsScheduleOpen] = useState(false);
    const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    // Form State
    const [newInterview, setNewInterview] = useState({
        applicantId: '',
        jobId: '',
        date: '',
        time: '',
    });

    const upcomingInterviews = useMemo(() => 
        interviews.filter(i => i.status === 'scheduled')
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    [interviews]);

    const pastInterviews = useMemo(() => 
        interviews.filter(i => i.status === 'completed')
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [interviews]);

    const handleSchedule = (e: React.FormEvent) => {
        e.preventDefault();
        const applicant = applicantsData.find(a => a.id === newInterview.applicantId);
        const job = jobs.find(j => j.id === newInterview.jobId);

        if (!applicant || !job) {
            toast({ title: "Error", description: "Please select an applicant and a job.", variant: "destructive" });
            return;
        }

        const scheduledInterview: Interview = {
            id: `int-${Date.now()}`,
            applicantId: applicant.id,
            applicantName: applicant.name,
            jobId: job.id,
            jobTitle: job.title,
            interviewerId: 'current-user',
            interviewerName: 'You',
            date: `${newInterview.date}T${newInterview.time}:00Z`,
            status: 'scheduled',
            meetingLink: 'https://meet.google.com/new',
        };

        setInterviews([scheduledInterview, ...interviews]);
        setIsScheduleOpen(false);
        toast({ title: "Interview Scheduled", description: `Invite sent to ${applicant.name}.` });
    };

    const openDetail = (interview: Interview) => {
        setSelectedInterview(interview);
        setIsDetailOpen(true);
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold font-headline">Interviews</h1>
                    <p className="text-muted-foreground">Manage your schedule and review candidate evaluations.</p>
                </div>
                <Dialog open={isScheduleOpen} onOpenChange={setIsScheduleOpen}>
                    <DialogTrigger asChild>
                        <Button className="btn-gradient">
                            <Plus className="mr-2 h-4 w-4" /> Schedule Interview
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Schedule New Interview</DialogTitle>
                            <DialogDescription>Select a candidate and set a time for the call.</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSchedule} className="space-y-4 pt-4">
                            <div className="space-y-2">
                                <Label>Select Job</Label>
                                <Select onValueChange={(val) => setNewInterview({...newInterview, jobId: val})}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {jobs.filter(j => j.status === 'open').map(j => (
                                            <SelectItem key={j.id} value={j.id}>{j.title}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Select Candidate</Label>
                                <Select onValueChange={(val) => setNewInterview({...newInterview, applicantId: val})}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select candidate" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {applicantsData.map(a => (
                                            <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Date</Label>
                                    <Input type="date" onChange={(e) => setNewInterview({...newInterview, date: e.target.value})} required />
                                </div>
                                <div className="space-y-2">
                                    <Label>Time</Label>
                                    <Input type="time" onChange={(e) => setNewInterview({...newInterview, time: e.target.value})} required />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit" className="w-full">Send Invitation</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Tabs defaultValue="upcoming" className="w-full">
                <TabsList className="grid w-full max-w-md grid-cols-2">
                    <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                    <TabsTrigger value="archive">Past & Analysis</TabsTrigger>
                </TabsList>

                <TabsContent value="upcoming" className="mt-6">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {upcomingInterviews.map((int) => (
                            <Card key={int.id} className="hover:shadow-md transition-shadow">
                                <CardHeader className="pb-3">
                                    <div className="flex justify-between items-start">
                                        <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                                            {int.jobTitle}
                                        </Badge>
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <CardTitle className="text-xl mt-2">{int.applicantName}</CardTitle>
                                    <CardDescription>Interviewer: {int.interviewerName}</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3 pb-4">
                                    <div className="flex items-center text-sm text-muted-foreground gap-2">
                                        <CalendarDays className="h-4 w-4" />
                                        {format(new Date(int.date), 'EEEE, MMM do')}
                                    </div>
                                    <div className="flex items-center text-sm text-muted-foreground gap-2">
                                        <Clock className="h-4 w-4" />
                                        {format(new Date(int.date), 'p')}
                                    </div>
                                </CardContent>
                                <CardFooter className="border-t pt-4">
                                    <Button asChild className="w-full btn-glass">
                                        <a href={int.meetingLink} target="_blank" rel="noreferrer">
                                            <Video className="mr-2 h-4 w-4" /> Join Call
                                        </a>
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                        {upcomingInterviews.length === 0 && (
                            <div className="col-span-full py-12 text-center border-2 border-dashed rounded-lg bg-muted/20">
                                <CalendarDays className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                                <h3 className="text-lg font-semibold">No interviews scheduled</h3>
                                <p className="text-muted-foreground">Book your first candidate screening above.</p>
                            </div>
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="archive" className="mt-6">
                    <Card>
                        <CardHeader className="pb-0">
                            <div className="flex items-center justify-between">
                                <CardTitle>Interview Archive</CardTitle>
                                <div className="relative w-64">
                                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input placeholder="Search archives..." className="pl-8" />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Candidate</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead>Conducted On</TableHead>
                                        <TableHead>AI Sentiment</TableHead>
                                        <TableHead className="text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {pastInterviews.map((int) => (
                                        <TableRow key={int.id} className="group">
                                            <TableCell className="font-medium">{int.applicantName}</TableCell>
                                            <TableCell>{int.jobTitle}</TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {format(new Date(int.date), 'MMM do, yyyy')}
                                            </TableCell>
                                            <TableCell>
                                                <Badge 
                                                    variant="secondary" 
                                                    className={int.aiAnalysis?.sentiment === 'positive' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}
                                                >
                                                    {int.aiAnalysis?.sentiment || 'N/A'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="outline" size="sm" onClick={() => openDetail(int)}>
                                                    View Analysis <ChevronRight className="ml-2 h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {pastInterviews.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                                No completed interviews yet.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Analysis Detail Dialog */}
            <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                    {selectedInterview && (
                        <>
                            <DialogHeader>
                                <div className="flex items-center gap-2 text-primary font-semibold mb-1">
                                    <BrainCircuit className="h-5 w-5" /> AI Interview Intelligence
                                </div>
                                <DialogTitle className="text-2xl">{selectedInterview.applicantName}</DialogTitle>
                                <DialogDescription>
                                    {selectedInterview.jobTitle} • Conducted on {format(new Date(selectedInterview.date), 'PPPP')}
                                </DialogDescription>
                            </DialogHeader>
                            <Separator className="my-4" />
                            <ScrollArea className="flex-1 pr-4">
                                <div className="grid md:grid-cols-2 gap-8">
                                    <div className="space-y-6">
                                        <div>
                                            <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                                                <FileText className="h-4 w-4" /> Transcript
                                            </h4>
                                            <div className="bg-muted/30 rounded-lg p-4 text-sm whitespace-pre-wrap font-mono leading-relaxed border">
                                                {selectedInterview.transcript || "No transcript available for this session."}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-6">
                                        <div>
                                            <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                                                <Sparkles className="h-4 w-4 text-yellow-500" /> AI Summary
                                            </h4>
                                            <p className="text-sm leading-relaxed">{selectedInterview.aiAnalysis?.summary}</p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <h5 className="text-xs font-bold text-green-600">KEY STRENGTHS</h5>
                                                <ul className="text-xs space-y-1">
                                                    {selectedInterview.aiAnalysis?.strengths.map((s, i) => (
                                                        <li key={i} className="flex items-center gap-1">
                                                            <div className="h-1 w-1 rounded-full bg-green-600" /> {s}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                            <div className="space-y-2">
                                                <h5 className="text-xs font-bold text-orange-600">AREAS FOR GROWTH</h5>
                                                <ul className="text-xs space-y-1">
                                                    {selectedInterview.aiAnalysis?.weaknesses.map((w, i) => (
                                                        <li key={i} className="flex items-center gap-1">
                                                            <div className="h-1 w-1 rounded-full bg-orange-600" /> {w}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                        <Card className="bg-primary/5 border-primary/20">
                                            <CardHeader className="pb-2">
                                                <CardTitle className="text-sm">Hiring Recommendation</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <p className="text-sm font-medium text-primary italic">
                                                    "{selectedInterview.aiAnalysis?.recommendation}"
                                                </p>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </div>
                            </ScrollArea>
                            <DialogFooter className="mt-6 sm:justify-between items-center border-t pt-4">
                                <Button variant="ghost" size="sm" asChild>
                                    <a href={`/applicants/${selectedInterview.applicantId}`}>
                                        View Full Profile <ExternalLink className="ml-2 h-3 w-3" />
                                    </a>
                                </Button>
                                <Button onClick={() => setIsDetailOpen(false)}>Close Analysis</Button>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
