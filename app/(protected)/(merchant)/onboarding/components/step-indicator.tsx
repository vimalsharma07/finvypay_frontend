'use client';

import { Check } from 'lucide-react';

interface Step {
  number: number;
  title: string;
  subtitle: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="rounded-2xl border border-sky-100 bg-card p-5 shadow-sm ring-1 ring-sky-500/5 dark:border-sky-900/40">
      <p className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-sky-700/80 dark:text-sky-300/80">
        Setup path
      </p>
      <ol className="space-y-0">
        {steps.map((step, index) => {
          const isActive = step.number === currentStep;
          const isCompleted = step.number < currentStep;

          return (
            <li key={step.number} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-semibold transition-colors ${
                    isActive
                      ? 'bg-sky-500 text-white shadow-sm shadow-sky-500/30'
                      : isCompleted
                        ? 'bg-sky-500/15 text-sky-700 ring-1 ring-sky-500/25 dark:text-sky-300'
                        : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {isCompleted ? <Check className="h-4 w-4" /> : step.number}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`my-1 w-0.5 flex-1 min-h-8 rounded-full ${
                      isCompleted ? 'bg-sky-400/70' : 'bg-sky-100 dark:bg-sky-900/50'
                    }`}
                  />
                )}
              </div>

              <div className={`pb-5 ${index === steps.length - 1 ? 'pb-0' : ''}`}>
                <h3
                  className={`text-sm font-semibold leading-tight ${
                    isActive
                      ? 'text-foreground'
                      : isCompleted
                        ? 'text-sky-800 dark:text-sky-200'
                        : 'text-muted-foreground'
                  }`}
                >
                  {step.title}
                </h3>
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                  {step.subtitle}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
