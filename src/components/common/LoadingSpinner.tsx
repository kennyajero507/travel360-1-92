
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

export const LoadingSpinner = ({ size = 'md', text, className = '' }: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Loader2 className={`animate-spin ${sizeClasses[size]}`} />
      {text && <span className="ml-2 text-sm text-gray-600">{text}</span>}
    </div>
  );
};

export const LoadingCard = ({ text = 'Loading...' }: { text?: string }) => (
  <div className="flex items-center justify-center p-8">
    <LoadingSpinner size="lg" text={text} />
  </div>
);

export const LoadingPage = ({ text = 'Loading...' }: { text?: string }) => (
  <div className="min-h-screen flex items-center justify-center">
    <LoadingSpinner size="lg" text={text} />
  </div>
);
