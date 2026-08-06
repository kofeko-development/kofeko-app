"use client";

import {
    FileText,
    Sparkles,
    CheckCircle2,
    Target,
    Brain,
} from "lucide-react";

export default function RoleClaritySlide() {
    return (
        <div className="h-full w-full flex items-center justify-center px-8">

            <div className="grid grid-cols-[220px_25px_minmax(340px,1fr)] gap-5 items-center w-full scale-[0.75] origin-left">

                {/* LEFT SIDE */}
                <div
                    className="
                    bg-white
                    rounded-3xl
                    border
                    border-slate-200
                    shadow-lg
                    p-5
                    h-[420px]
                    ">
                    <div className="flex items-center gap-2 mb-4">
                        <FileText className="size-4 text-slate-500" />
                        <span className="text-sm font-medium text-slate-500">
                            Job Description
                        </span>
                    </div>

                    <h3 className="font-bold text-slate-900 mb-4">
                        Operational Analyst
                    </h3>

                    <div className="space-y-3 text-xs text-slate-500">

                        <div className="h-2 bg-slate-200 rounded-full w-full" />
                        <div className="h-2 bg-slate-200 rounded-full w-4/5" />
                        <div className="h-2 bg-slate-200 rounded-full w-5/6" />

                    </div>

                    <div className="mt-6">

                        <div className="text-xs font-semibold text-slate-600 mb-2">
                            Requirements
                        </div>

                        <div className="space-y-2">

                            <div className="bg-slate-100 rounded-lg px-3 py-2 text-xs">
                                Excel
                            </div>

                            <div className="bg-slate-100 rounded-lg px-3 py-2 text-xs">
                                Communication
                            </div>

                            <div className="bg-slate-100 rounded-lg px-3 py-2 text-xs">
                                Analysis
                            </div>

                            <div className="bg-slate-100 rounded-lg px-3 py-2 text-xs">
                                Operations
                            </div>

                        </div>
                    </div>

                    <div className="mt-5 text-xs text-amber-600 bg-amber-50 rounded-lg p-2">
                        Missing role structure
                    </div>

                </div>

                {/* CENTER */}
                <div className="relative flex items-center justify-center h-full">

                    <div
                        className="
                        absolute
                        left-0
                        right-0
                        top-1/2
                        -translate-y-1/2
                        border-t
                        border-dashed
                        border-primary/30
                        "
                    />

                    <div
                        className="
                        relative
                        z-10
                        bg-transparent
                        px-2
                        "
                    >
                        <Sparkles className="size-5 text-primary" />
                    </div>

                </div>

                {/* RIGHT SIDE */}
                <div
                    className="
          bg-white
          rounded-3xl
          border
          border-slate-200
          shadow-xl
          p-6
          h-[450px]
          min-w-[340px]
          "
                >

                    {/* Header */}

                    <div className="flex items-center justify-between mb-5">

                        <div>
                            <div className="text-xs text-slate-500">
                                Hiring Blueprint
                            </div>

                            <div className="font-bold text-slate-900">
                                Operational Analyst
                            </div>
                        </div>

                        <div
                            className="
              bg-green-50
              text-green-700
              px-3
              py-1
              rounded-full
              text-xs
              font-medium
              "
                        >
                            92% Complete
                        </div>

                    </div>

                    {/* Score */}

                    <div className="mb-5">

                        <div className="flex items-center justify-between text-xs mb-2">

                            <span className="text-slate-500">
                                Role Clarity Score
                            </span>

                            <span className="font-semibold text-slate-900">
                                94/100
                            </span>

                        </div>

                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">

                            <div
                                className="
                h-full
                w-[94%]
                bg-primary
                rounded-full
                "
                            />

                        </div>

                        <div className="space-y-3 text-xs text-slate-600 mt-4">

                            <div className="h-2 bg-slate-200 rounded-full w-full" />
                            <div className="h-2 bg-slate-200 rounded-full w-4/5" />
                            <div className="h-2 bg-slate-200 rounded-full w-5/6" />
                            <div className="h-2 bg-slate-200 rounded-full w-4/5" />

                        </div>

                    </div>

                    {/* Skill Groups */}

                    <div className="space-y-4">

                        <div>

                            <div className="flex items-center gap-2 mb-2">

                                <Target className="size-4 text-primary" />

                                <span className="text-sm font-semibold">
                                    Must Have
                                </span>

                            </div>

                            <div className="flex flex-wrap gap-2">

                                <span className="bg-primary/10 text-primary text-xs px-3 py-1 rounded-full">
                                    Excel
                                </span>

                                <span className="bg-primary/10 text-primary text-xs px-3 py-1 rounded-full">
                                    Reporting
                                </span>

                                <span className="bg-primary/10 text-primary text-xs px-3 py-1 rounded-full">
                                    Process Ops
                                </span>

                            </div>

                        </div>

                        <div>

                            <div className="flex items-center gap-2 mb-2">

                                <Brain className="size-4 text-slate-500" />

                                <span className="text-sm font-semibold">
                                    Trainable Skills
                                </span>

                            </div>

                            <div className="flex flex-wrap gap-2">

                                <span className="bg-slate-100 text-slate-700 text-xs px-3 py-1 rounded-full">
                                    SQL
                                </span>

                                <span className="bg-slate-100 text-slate-700 text-xs px-3 py-1 rounded-full">
                                    Automation
                                </span>

                            </div>

                        </div>

                    </div>

                    {/* Outcome */}

                    <div
                        className="
            mt-5
            bg-green-50
            border
            border-green-100
            rounded-2xl
            p-3
            flex
            items-center
            gap-3
            "
                    >
                        <CheckCircle2 className="size-5 text-green-600" />

                        <div>

                            <div className="text-sm font-semibold text-slate-900">
                                Better role communication
                            </div>

                            <div className="text-xs text-slate-500">
                                Fewer Wrong Applicants
                            </div>

                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
}