
import React from 'react';
import { cn } from '../../lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
  variant?: 'default' | 'dots' | 'pulse';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  text, 
  className,
  variant = 'default'
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  const renderSpinner = () => {
    if (variant === 'dots') {
      return (
        <div className="flex space-x-1">
          <div className={cn("bg-primary rounded-full animate-bounce", 
            size === 'sm' ? 'h-2 w-2' : size === 'md' ? 'h-3 w-3' : 'h-4 w-4'
          )} style={{ animationDelay: '0ms' }} />
          <div className={cn("bg-primary rounded-full animate-bounce", 
            size === 'sm' ? 'h-2 w-2' : size === 'md' ? 'h-3 w-3' : 'h-4 w-4'
          )} style={{ animationDelay: '150ms' }} />
          <div className={cn("bg-primary rounded-full animate-bounce", 
            size === 'sm' ? 'h-2 w-2' : size === 'md' ? 'h-3 w-3' : 'h-4 w-4'
          )} style={{ animationDelay: '300ms' }} />
        </div>
      );
    }

    if (variant === 'pulse') {
      return (
        <div className={cn(
          "rounded-full bg-primary animate-pulse",
          sizeClasses[size]
        )} />
      );
    }

    return (
      <div className={cn(
        "animate-spin rounded-full border-2 border-muted border-t-primary",
        sizeClasses[size]
      )} />
    );
  };

  return (
    <div className={cn("flex flex-col items-center justify-center gap-3", className)}>
      {renderSpinner()}
      {text && (
        <p className="text-sm text-muted-foreground animate-fade-in">{text}</p>
      )}
    </div>
  );
};
