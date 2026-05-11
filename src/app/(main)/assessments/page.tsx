
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AssessmentsPage() {
  return (
    <div className="flex flex-col gap-6">
       <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline">Skill Assessments</h1>
          <p className="text-muted-foreground">Assessments will appear here once enabled.</p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Coming soon</CardTitle>
          <CardDescription>This section will be connected to real assessment data later.</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          No assessments available.
        </CardContent>
      </Card>
    </div>
  );
}
