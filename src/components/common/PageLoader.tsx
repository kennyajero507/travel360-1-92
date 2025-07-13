
import React from 'react';
import { LoadingSpinner } from './LoadingSpinner';

interface PageLoaderProps {
  text?: string;
  variant?: 'default' | 'dots' | 'pulse';
  showProgress?: boolean;
}

const PageLoader: React.FC<PageLoaderProps> = ({ 
  text = 'Loading...', 
  variant = 'default',
  showProgress = false 
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4 p-8">
        <LoadingSpinner size="lg" text={text} variant={variant} />
        {showProgress && (
          <div className="w-48 bg-muted rounded-full h-2 mx-auto">
            <div className="bg-primary h-2 rounded-full animate-pulse" style={{ width: '60%' }} />
          </div>
        )}
      </div>
    </div>
  );
};

export default PageLoader;
