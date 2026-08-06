"use client";

import {
    User,
    CheckCircle2,
    TrendingUp,
} from "lucide-react";

export default function CandidateSignalsSlide() {
    return (
        <div className="h-full w-full flex items-start justify-center px-6">

            <div className="grid grid-cols-[220px_1fr] gap-4 items-center w-full scale-[0.82] origin-left">

                {/* LEFT PANEL */}

                <div
                    className="
          bg-white/70
          backdrop-blur-sm
          rounded-3xl
          border
          border-slate-200
          shadow-lg
          p-4
          h-[300px]
          "
                >

                    <div className="text-sm font-semibold text-slate-500 mb-4">
                        Candidate Shortlist
                    </div>

                    <div className="space-y-3">

                        {/* Selected */}

                        <div
                            className="
              p-3
              rounded-2xl
              border
              border-primary/20
              bg-primary/10
              "
                        >
                            <div className="flex justify-between items-center">

                                <div>
                                    <div className="font-semibold text-slate-900 text-sm">
                                        Sarah Chen
                                    </div>

                                    <div className="text-xs text-slate-500">
                                        Backend Engineer
                                    </div>
                                </div>

                                <div className="font-bold text-primary">
                                    94%
                                </div>

                            </div>
                        </div>

                        {[
                            ["Rahul Patel", "89%"],
                            ["Emma Wilson", "84%"],
                            ["David Kim", "78%"],
                        ].map(([name, score]) => (
                            <div
                                key={name}
                                className="
                p-3
                rounded-2xl
                border
                border-slate-100
                bg-white
                "
                            >
                                <div className="flex justify-between items-center">

                                    <div className="font-medium text-sm text-slate-700">
                                        {name}
                                    </div>

                                    <div className="font-semibold text-slate-400 text-sm">
                                        {score}
                                    </div>

                                </div>
                            </div>
                        ))}

                    </div>

                </div>

                {/* RIGHT PANEL */}

                <div
                    className="
          bg-white/70
          backdrop-blur-sm
          rounded-3xl
          border
          border-slate-200
          shadow-xl
          p-5
          h-[360px]
          "
                >

                    {/* HEADER */}

                    <div className="flex justify-between items-start mb-3">

                        <div className="flex gap-4">

                            <div
                                className="
                size-14
                rounded-2xl
                bg-primary/10
                flex
                items-center
                justify-center
                "
                            >
                                <User className="size-7 text-primary" />
                            </div>

                            <div>

                                <div className="font-bold text-slate-900">
                                    Sarah Chen
                                </div>

                                <div className="text-sm text-slate-500">
                                    Senior Backend Engineer
                                </div>

                                <div className="flex gap-2 mt-1">

                                    <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
                                        Python
                                    </span>

                                    <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
                                        AWS
                                    </span>

                                    <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
                                        Django
                                    </span>

                                </div>

                            </div>

                        </div>

                        <div
                            className="
              bg-green-50
              text-green-700
              px-3
              py-2
              rounded-full
              text-sm
              font-semibold
              "
                        >
                            94% Match
                        </div>

                    </div>

                    {/* WHY THIS CANDIDATE */}

                    <div
                        className="
            bg-slate-50
            rounded-2xl
            p-0
            mb-0
            "
                    >

                        <div className="font-semibold text-slate-900 mb-2">
                            Candidate Intelligence
                        </div>

                        <div className="space-y-3">

                            {[
                                "Strong Python backend experience",
                                "Relevant SaaS product background",
                                "Consistent career progression",
                                "Led cross-functional engineering teams",
                            ].map((item) => (
                                <div
                                    key={item}
                                    className="flex gap-2 items-start"
                                >
                                    <CheckCircle2 className="size-4 text-green-600 mt-0.5" />

                                    <span className="text-sm text-slate-600">
                                        {item}
                                    </span>
                                </div>
                            ))}

                        </div>

                    </div>

                    {/* SIGNAL SUMMARY */}

                    <div className="grid grid-cols-3 gap-3 mt-3 mb-2">

                        {[
                            ["Role Alignment", "92%"],
                            ["Skill Depth", "89%"],
                            ["Experience", "94%"],
                        ].map(([label, value]) => (
                            <div key={label} className="
                                bg-white
                                rounded-xl
                                p-3
                                text-center
                                border
                                border-primary/10
                                "
                                style={{
                                    boxShadow: `
                                    0 2px 8px rgba(15,23,42,0.04),
                                    0 8px 20px rgba(124,106,171,0.08)
                                    `,
                                }}>
                                <div className="text-lg font-bold text-slate-900">
                                    {value}
                                </div>

                                <div className="text-xs text-slate-500">
                                    {label}
                                </div>
                            </div>
                        ))}

                    </div>

                    {/* OUTCOME */}

                    <div
                        className="
        bg-white
        border
        border-green-100
        rounded-2xl
        px-3
        py-2
        flex
        items-center
        gap-3
        mt-7
        "
                        style={{
                            boxShadow: `
            0 4px 12px rgba(15,23,42,0.04),
            0 12px 30px rgba(34,197,94,0.12)
          `,
                        }}
                    >
                        <div className="w-1 rounded-full bg-green-500" />
                        <TrendingUp className="size-8 text-green-600" />

                        <div>

                            <div className="font-semibold text-slate-900 text-sm">
                                Stronger candidates. Less manual screening.
                            </div>

                            <div className="text-xs text-slate-500">
                                Understand candidates beyond keywords.
                            </div>

                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
}
