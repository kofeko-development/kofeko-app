"use client";

import {
    CheckCircle2,
    Clock3,
    TrendingUp,
    AlertTriangle,
} from "lucide-react";

export default function HiringFeedbackSlide() {
    return (<div className="h-full w-full flex items-start justify-center px-4 -mt-4">

        <div className="grid grid-cols-[220px_1fr] gap-5 items-center w-full scale-[0.80] origin-left">

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
      h-[380px]
      "
            >

                <div className="text-sm font-semibold text-slate-500 mb-4">
                    Hiring Intelligence
                </div>

                {/* Metrics */}

                <div className="grid grid-cols-2 gap-3 -mt-3 mb-4">
                    <div>
                        <div className="text-2xl font-bold text-slate-900">
                            12
                        </div>

                        <div className="text-xs text-slate-500">
                            Pending Reviews
                        </div>
                    </div>

                    <div>
                        <div className="text-2xl font-bold text-amber-600">
                            3
                        </div>

                        <div className="text-xs text-slate-500">
                            Overdue Feedback
                        </div>
                    </div>

                    <div
                        className="
  bg-primary/5
  border
  border-primary/10
  rounded-xl
  px-3
  py-2
  mb-4
  min-w-[180px]
  "
                    >
                        <div className="text-xl font-bold text-slate-900">
                            4.2
                        </div>

                        <div className="text-xs text-slate-500">
                            Avg Decision Days
                        </div>
                    </div>

                </div>

                {/* Bottleneck */}

                <div
                    className="
        bg-amber-50
        border
        border-amber-200
        rounded-2xl
        p-3
        mb-4
        -mt-5
        "
                >
                    <div className="flex items-center gap-2 mb-2">

                        <AlertTriangle className="size-4 text-amber-600" />

                        <span className="text-xs font-semibold text-amber-700">
                            Bottleneck Detected
                        </span>

                    </div>

                    <div className="text-sm font-semibold text-slate-900">
                        Hiring Manager Review
                    </div>

                    <div className="text-xs text-slate-500 mt-1">
                        2.8 Days Delay
                    </div>
                </div>

                {/* Trend Chart */}

                <div>

                    <div className="text-xs text-slate-500 mb-2">
                        Time-to-Hire Trend
                    </div>

                    <svg
                        viewBox="0 0 120 40"
                        className="w-full h-12"
                    >
                        <path
                            d="M0 30 L20 28 L40 25 L60 20 L80 15 L100 18 L120 10"
                            stroke="#7C6AAB"
                            strokeWidth="2"
                            fill="none"
                        />
                    </svg>

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
      p-4
      h-[400px]
      min-w-[340px]
      "
            >

                {/* Header */}

                <div className="flex justify-between items-start mb-3">

                    <div>

                        <div className="font-bold text-slate-900">
                            Sarah Chen
                        </div>

                        <div className="text-sm text-slate-500">
                            Senior Backend Engineer
                        </div>

                    </div>

                    <div
                        className="
          bg-amber-50
          text-amber-700
          px-3
          py-1
          rounded-full
          text-xs
          font-semibold
          "
                    >
                        Decision Waiting
                    </div>

                </div>

                {/* Feedback Status */}

                <div
                    className="
        bg-slate-50
        rounded-2xl
        p-3
        mb-3
        "
                >

                    <div className="font-semibold text-slate-900 -mt-4 mb-3">
                        Feedback Status
                    </div>

                    <div className="space-y-2">

                        <div className="flex items-center justify-between">

                            <span className="text-sm text-slate-600">
                                Recruiter Feedback
                            </span>

                            <CheckCircle2 className="size-4 text-green-600" />

                        </div>

                        <div className="flex items-center justify-between">

                            <span className="text-sm text-slate-600">
                                Hiring Manager
                            </span>

                            <Clock3 className="size-4 text-amber-600" />

                        </div>

                        <div className="flex items-center justify-between">

                            <span className="text-sm text-slate-600">
                                Interview Feedback
                            </span>

                            <CheckCircle2 className="size-4 text-green-600" />

                        </div>

                    </div>

                </div>

                {/* Insight Generated */}

                <div
                    className="
        bg-primary/10
        border
        border-primary/20
        rounded-2xl
        p-4
        -mt-3
        mb-3
        "
                >

                    <div className="font-semibold text-slate-900 mb-2">
                        Insight Generated
                    </div>

                    <div className="text-sm text-slate-600 leading-relaxed">
                        Hiring Manager feedback is currently the primary source of delay for this role.
                    </div>

                    <div className="mt-3 text-xs font-medium text-primary">
                        Average response time: 2.8 days
                    </div>

                </div>

                {/* Decision Readiness */}

                <div className="mb-3">

                    <div className="flex justify-between text-sm mb-2">

                        <span className="text-slate-600">
                            Decision Readiness
                        </span>

                        <span className="font-semibold text-slate-900">
                            72%
                        </span>

                    </div>

                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">

                        <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: "72%" }}
                        />

                    </div>

                </div>

                {/* Outcome Banner */}

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
                            Keep hiring moving. Eliminate bottlenecks.
                        </div>

                        <div className="text-xs text-slate-500">
                            See exactly where decisions are waiting.
                        </div>

                    </div>

                </div>

            </div>

        </div>

    </div>

    );
}
