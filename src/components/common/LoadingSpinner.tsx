
import { cn } from "../../lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  text?: string;
}

const LoadingSpinner = ({ size = "md", className, text }: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6", 
    lg: "w-8 h-8"
  };

  return (
    <div className={cn("flex items-center justify-center gap-2", className)}>
      <div 
        className={cn(
          "animate-spin rounded-full border-2 border-slate-200 border-t-government-600",
          sizeClasses[size]
        )}
      />
      {text && (
        <span className="text-sm text-slate-600 font-medium">{text}</span>
      )}
    </div>
  );
};

export default LoadingSpinner;
