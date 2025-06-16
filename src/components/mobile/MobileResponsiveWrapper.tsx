
import React from 'react';
import { cn } from '../../lib/utils';

interface MobileResponsiveWrapperProps {
  children: React.ReactNode;
  className?: string;
}

const MobileResponsiveWrapper = ({ children, className }: MobileResponsiveWrapperProps) => {
  return (
    <div className={cn(
      "w-full",
      "px-4 sm:px-6 lg:px-8", // Responsive padding
      "py-4 sm:py-6", // Responsive vertical padding
      className
    )}>
      {children}
    </div>
  );
};

export default MobileResponsiveWrapper;
