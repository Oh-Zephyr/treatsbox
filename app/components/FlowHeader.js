"use client";

import Link from "next/link";

const STEPS = ["Choose", "Details", "Review", "Payment", "Done"];

export default function FlowHeader({ step }) {
  return (
    <header className="sticky top-0 z-40 bg-paper/90 backdrop-blur border-b border-line">
      <div className="max-w-3xl mx-auto px-5 md:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="font-display text-lg font-semibold text-ink tracking-tight">
          Treatsbox
        </Link>
        <div className="hidden sm:flex items-center gap-2">
          {STEPS.map((label, i) => {
            const n = i + 1;
            const state = n < step ? "done" : n === step ? "active" : "todo";
            return (
              <div key={label} className="flex items-center gap-2">
                <div
                  className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
                    state === "active"
                      ? "bg-oxblood text-white"
                      : state === "done"
                      ? "text-forest"
                      : "text-ink2/40"
                  }`}
                >
                  {label}
                </div>
                {n < STEPS.length && <span className="w-3 h-px bg-line" />}
              </div>
            );
          })}
        </div>
        <span className="sm:hidden text-xs font-semibold text-ink2 bg-paper2 rounded-full px-3 py-1.5">
          Step {step} of {STEPS.length}
        </span>
      </div>
    </header>
  );
}
