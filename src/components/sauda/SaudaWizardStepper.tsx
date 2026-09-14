import React from 'react';
import { Check } from 'lucide-react';

interface StepItem {
  number: number;
  title: string;
  subtitle: string;
}

interface SaudaWizardStepperProps {
  currentStep: number;
  onStepClick: (step: number) => void;
  maxAllowedStep?: number;
}

const STEPS: StepItem[] = [
  {
    number: 1,
    title: 'Item & Quantity',
    subtitle: 'Item & Quantity Details',
  },
  {
    number: 2,
    title: 'Seller',
    subtitle: 'Seller Information',
  },
  {
    number: 3,
    title: 'Buyer',
    subtitle: 'Buyer Information',
  },
];

export const SaudaWizardStepper: React.FC<SaudaWizardStepperProps> = ({
  currentStep,
  onStepClick,
  maxAllowedStep = currentStep,
}) => {
  return (
    <div className="w-full p-4 sm:p-5 rounded-3xl bg-white/70 dark:bg-[#111827]/70 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 shadow-glass-card">
      <div className="relative flex items-start justify-between max-w-xl mx-auto">
        {/* Continuous Horizontal Connecting Line Behind the Circles */}
        <div className="absolute top-[18px] sm:top-[22px] left-[16%] right-[16%] -translate-y-1/2 h-[3px] bg-slate-200 dark:bg-slate-700/80 z-0">
          <div
            className="h-full bg-blue-600 dark:bg-blue-500 transition-all duration-300"
            style={{
              width:
                currentStep === 1
                  ? '0%'
                  : currentStep === 2
                  ? '50%'
                  : '100%',
            }}
          />
        </div>

        {/* Step Nodes */}
        {STEPS.map((step) => {
          const isCompleted = currentStep > step.number;
          const isCurrent = currentStep === step.number;
          const isClickable = step.number <= maxAllowedStep;

          return (
            <div
              key={step.number}
              className="flex-1 flex flex-col items-center relative z-10"
            >
              {/* Circular Node */}
              <button
                type="button"
                onClick={() => isClickable && onStepClick(step.number)}
                disabled={!isClickable}
                aria-label={`Step ${step.number}: ${step.title}`}
                className={`w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center font-black text-xs sm:text-sm transition-all ${
                  isCurrent
                    ? 'bg-blue-600 dark:bg-blue-600 text-white ring-4 ring-blue-500/25 scale-105 shadow-md shadow-blue-500/30'
                    : isCompleted
                    ? 'bg-blue-600 dark:bg-blue-600 text-white cursor-pointer hover:scale-105'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                } ${isClickable ? 'cursor-pointer' : 'cursor-default'}`}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4 sm:w-5 sm:h-5 stroke-[3]" />
                ) : (
                  <span>{step.number}</span>
                )}
              </button>

              {/* Text Description Centered Below */}
              <div className="mt-2.5 text-center px-1 max-w-[110px] sm:max-w-[140px]">
                <p
                  className={`text-[11px] sm:text-xs leading-tight ${
                    isCurrent
                      ? 'text-blue-600 dark:text-blue-400 font-black'
                      : isCompleted
                      ? 'text-slate-900 dark:text-slate-100 font-extrabold'
                      : 'text-slate-400 dark:text-slate-500 font-semibold'
                  }`}
                >
                  {step.subtitle}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
