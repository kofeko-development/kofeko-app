
'use client';

import PublicNavbar from "@/components/public-navbar";
import AppFooter from "@/components/app-footer";
import { Award, Target, Gem, Zap, Handshake, Users } from 'lucide-react';

export default function AboutPage() {
    const values = [
        {
            icon: Zap,
            title: "Intelligence",
            description: "We build smart, data-driven tools that provide actionable insights, not just more data.",
        },
        {
            icon: Handshake,
            title: "Efficiency",
            description: "We are obsessed with saving time and effort, automating the mundane so you can focus on the human element of hiring.",
        },
        {
            icon: Gem,
            title: "Simplicity",
            description: "We believe powerful technology should be intuitive and easy to use, designed for a seamless user experience.",
        },
        {
            icon: Users,
            title: "Partnership",
            description: "We see ourselves as a partner in your success, committed to helping you build exceptional teams.",
        },
    ];

    return (
        <div className="flex flex-col min-h-screen bg-muted/20">
            <PublicNavbar />
            <main className="flex-1 mt-20">
                <section className="py-20 text-center bg-gradient-to-br from-purple-50/70 to-orange-50/70">
                    <div className="container">
                        <h1 className="text-5xl font-bold font-headline">Redefining Recruitment</h1>
                        <p className="mt-4 text-xl text-muted-foreground max-w-3xl mx-auto">
                            Kofeko is an AI-powered platform designed to make hiring faster, smarter, and more equitable for everyone.
                        </p>
                    </div>
                </section>

                <section className="py-20">
                    <div className="container grid md:grid-cols-2 gap-16 items-center">
                        <div className="space-y-4">
                            <div className="inline-block bg-primary/10 text-primary p-3 rounded-lg">
                                <Target className="h-8 w-8" />
                            </div>
                            <h2 className="text-3xl font-bold font-headline">Our Mission</h2>
                            <p className="text-lg text-muted-foreground">
                                To empower organizations to hire smarter and faster by leveraging AI to streamline the entire recruitment lifecycle, from creating compelling job descriptions to identifying the best-fit candidates.
                            </p>
                        </div>
                        <div className="space-y-4">
                             <div className="inline-block bg-secondary/20 text-secondary-foreground p-3 rounded-lg">
                                <Award className="h-8 w-8" />
                            </div>
                            <h2 className="text-3xl font-bold font-headline">Our Vision</h2>
                            <p className="text-lg text-muted-foreground">
                                To create a more efficient, equitable, and intelligent hiring landscape where every company can effortlessly find the talent they need to thrive, and every candidate can find their perfect role.
                            </p>
                        </div>
                    </div>
                </section>
                
                <section className="py-20 bg-background">
                    <div className="container text-center">
                        <h2 className="text-4xl font-bold font-headline">Our Core Values</h2>
                        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                            The principles that guide our product, our company, and our partnership with you.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-12">
                            {values.map((value, index) => (
                                <div key={index} className="p-8 rounded-lg border bg-card text-card-foreground shadow-sm">
                                    <div className="inline-block bg-primary/10 text-primary p-4 rounded-full">
                                        <value.icon className="h-8 w-8" />
                                    </div>
                                    <h3 className="mt-6 text-xl font-bold">{value.title}</h3>
                                    <p className="mt-2 text-muted-foreground text-sm">{value.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </main>
            <AppFooter />
        </div>
    );
}
