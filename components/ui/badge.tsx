import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
        {
          "border-transparent bg-primary text-white": variant === "default",
          "border-transparent bg-secondary text-white": variant === "secondary",
          "border-transparent bg-red-500 text-white": variant === "destructive",
          "text-gray-700": variant === "outline",
        },
        className
      )}
      {...props}
    />
  );
}
