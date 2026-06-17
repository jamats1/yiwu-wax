import { Check, User, MapPin, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";

const steps = [
  { id: "details", label: "Your Details", icon: User },
  { id: "shipping", label: "Shipping", icon: MapPin },
  { id: "payment", label: "Payment", icon: CreditCard },
];

interface CheckoutStepsProps {
  currentStep: number; // 0 = details, 1 = shipping, 2 = payment
}

export function CheckoutSteps({ currentStep }: CheckoutStepsProps) {
  return (
    <div className="flex items-center gap-0 mb-6">
      {steps.map((step, i) => {
        const isComplete = i < currentStep;
        const isCurrent = i === currentStep;
        const Icon = step.icon;
        return (
          <div key={step.id} className="flex items-center flex-1">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors",
                  isComplete
                    ? "border-primary bg-primary text-white"
                    : isCurrent
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-gray-200 bg-gray-50 text-gray-400",
                )}
              >
                {isComplete ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
              </div>
              <span
                className={cn(
                  "hidden text-xs font-semibold sm:block",
                  isCurrent ? "text-primary" : isComplete ? "text-primary" : "text-gray-400",
                )}
              >
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={cn(
                  "flex-1 h-0.5 mx-2 sm:mx-3 rounded-full",
                  i < currentStep ? "bg-primary" : "bg-gray-200",
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
