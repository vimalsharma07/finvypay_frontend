'use client';

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
    <div className="flex flex-col items-center gap-4 py-8">
      {steps.map((step, index) => {
        const isActive = step.number === currentStep;
        const isCompleted = step.number < currentStep;
        const isUpcoming = step.number > currentStep;

        return (
          <div key={step.number} className="flex items-start gap-4 w-full max-w-md">
            {/* Step Number Badge */}
            <div className="flex flex-col items-center flex-shrink-0">
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center font-semibold transition-colors ${
                  isActive
                    ? 'bg-primary text-white'
                    : isCompleted
                    ? 'bg-success text-white'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {isCompleted ? (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  step.number
                )}
              </div>
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div
                  className={`w-0.5 h-16 mt-2 ${
                    isCompleted || isActive
                      ? 'bg-success'
                      : 'bg-muted'
                  }`}
                />
              )}
            </div>

            {/* Step Content */}
            <div className="flex-1 pt-1">
              <h3
                className={`font-semibold mb-1 ${
                  isActive ? 'text-foreground' : 'text-muted-foreground'
                }`}
              >
                {step.title}
              </h3>
              <p className="text-sm text-muted-foreground">{step.subtitle}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

