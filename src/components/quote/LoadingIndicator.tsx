
import { Loader2 } from "lucide-react";

interface LoadingIndicatorProps {
  message?: string;
}

const LoadingIndicator = ({ message = "Loading..." }: LoadingIndicatorProps) => {
  return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      <span className="ml-2">{message}</span>
    </div>
  );
};

export default LoadingIndicator;
