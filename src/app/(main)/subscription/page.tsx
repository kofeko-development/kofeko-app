
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const plans = [
  {
    name: 'Starter',
    price: '$49',
    priceSuffix: '/month',
    features: [
      '5 Job Postings',
      'Basic ATS',
      'AI Job Description Builder',
      'Email Support',
    ],
    isCurrent: false,
    isUpgrade: false,
  },
  {
    name: 'Pro',
    price: '$99',
    priceSuffix: '/month',
    features: [
      'Unlimited Job Postings',
      'Advanced ATS',
      'All AI Features',
      'Priority Support',
      'Team Collaboration',
    ],
    isCurrent: true,
    isUpgrade: false,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    priceSuffix: '',
    features: [
      'Everything in Pro',
      'Dedicated Account Manager',
      'Custom Integrations',
      'SLA & Security Reviews',
    ],
    isCurrent: false,
    isUpgrade: true,
  },
];

const billingHistory = [
    { date: '2024-07-01', description: 'Pro Plan Monthly Subscription', amount: '$99.00' },
    { date: '2024-06-01', description: 'Pro Plan Monthly Subscription', amount: '$99.00' },
    { date: '2024-05-01', description: 'Pro Plan Monthly Subscription', amount: '$99.00' },
];

export default function SubscriptionPage() {
  const getButtonText = (plan: typeof plans[0]) => {
    if (plan.name === 'Enterprise') return 'Contact Sales';
    if (plan.isCurrent) return 'Current Plan';
    return 'Switch Plan';
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold font-headline">Manage Subscription</h1>
        <p className="text-muted-foreground">
          View your current plan, upgrade, or manage your billing details.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 items-stretch">
        {plans.map((plan) => (
          <Card key={plan.name} className={`flex flex-col ${plan.isCurrent ? 'border-primary ring-2 ring-primary' : ''}`}>
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>
                <span className="text-3xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground">{plan.priceSuffix}</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 flex-1">
              <ul className="space-y-2 text-sm">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
                 {plan.isCurrent ? (
                    <Button variant="outline" className="w-full" disabled>Current Plan</Button>
                ) : (
                    <Button className="w-full">{getButtonText(plan)}</Button>
                )}
            </CardFooter>
          </Card>
        ))}
      </div>

        <Card>
            <CardHeader>
                <CardTitle>Billing Information</CardTitle>
                <CardDescription>Manage your payment method and view past invoices.</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
                <div>
                    <p className="font-semibold">Visa ending in 1234</p>
                    <p className="text-sm text-muted-foreground">Expires 12/2026</p>
                </div>
                <Button variant="outline">Update Payment Method</Button>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Billing History</CardTitle>
                <CardDescription>An overview of your recent payments.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {billingHistory.map((invoice) => (
                            <TableRow key={invoice.date}>
                                <TableCell>{invoice.date}</TableCell>
                                <TableCell>{invoice.description}</TableCell>
                                <TableCell className="text-right">{invoice.amount}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    </div>
  );
}
