import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const steps = [
  { label: 'Upload BOM', number: 1 },
  { label: 'Project Info', number: 2 },
  { label: 'Hardware Schedule', number: 3 },
  { label: 'Preview & Edit', number: 4 },
  { label: 'Export', number: 5 },
];

interface StepIndicatorProps {
  currentStep: number;
  onStepClick: (step: number) => void;
  completedSteps: Set<number>;
}

export default function StepIndicator({ currentStep, onStepClick, completedSteps }: StepIndicatorProps) {
  return (
    <nav className="flex items-center justify-between w-full max-w-3xl mx-auto mb-8">
      {steps.map((step, i) => {
        const isActive = currentStep === step.number;
        const isCompleted = completedSteps.has(step.number);
        const isClickable = isCompleted || step.number <= currentStep;

        return (
          <div key={step.number} className="flex items-center flex-1 last:flex-none">
            <button
              onClick={() => isClickable && onStepClick(step.number)}
              disabled={!isClickable}
              className={cn(
                'flex flex-col items-center gap-1.5 group',
                isClickable ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
              )}
            >
              <div
                className={cn(
                  'w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-colors border-2',
                  isActive && 'bg-primary text-primary-foreground border-primary',
                  isCompleted && !isActive && 'bg-primary/10 text-primary border-primary',
                  !isActive && !isCompleted && 'bg-muted text-muted-foreground border-border'
                )}
              >
                {isCompleted ? <Check className="w-4 h-4" /> : step.number}
              </div>
              <span
                className={cn(
                  'text-xs font-medium whitespace-nowrap',
                  isActive ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                {step.label}
              </span>
            </button>
            {i < steps.length - 1 && (
              <div
                className={cn(
                  'flex-1 h-0.5 mx-2 mt-[-1rem]',
                  completedSteps.has(step.number) ? 'bg-primary/40' : 'bg-border'
                )}
              />
            )}
          </div>
        );
      })}
    </nav>
  );
}
