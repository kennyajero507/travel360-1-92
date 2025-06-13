
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { auditService } from '../services/auditService';

interface ErrorState {
  message: string;
  code?: string;
  details?: any;
}

export const useErrorHandling = () => {
  const [error, setError] = useState<ErrorState | null>(null);

  const handleError = useCallback(async (
    error: Error | any,
    context?: string,
    showToast: boolean = true
  ) => {
    console.error('Error caught:', error, 'Context:', context);

    const errorState: ErrorState = {
      message: error?.message || 'An unexpected error occurred',
      code: error?.code,
      details: error,
    };

    setError(errorState);

    // Log error to audit service
    try {
      await auditService.logAction(
        'ERROR',
        'system',
        undefined,
        undefined,
        {
          error: errorState,
          context,
          timestamp: new Date().toISOString(),
        }
      );
    } catch (auditError) {
      console.error('Failed to log error to audit service:', auditError);
    }

    // Show toast notification
    if (showToast) {
      if (error?.code === 'auth/invalid-credential') {
        toast.error('Invalid email or password');
      } else if (error?.code === 'auth/too-many-requests') {
        toast.error('Too many failed attempts. Please try again later.');
      } else if (error?.message?.includes('Network')) {
        toast.error('Network error. Please check your connection.');
      } else {
        toast.error(errorState.message);
      }
    }

    return errorState;
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const retryWithErrorHandling = useCallback(async (
    operation: () => Promise<any>,
    maxRetries: number = 3,
    context?: string
  ) => {
    let lastError: any;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        console.warn(`Attempt ${attempt}/${maxRetries} failed:`, error);
        
        if (attempt === maxRetries) {
          return handleError(error, context);
        }
        
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }, [handleError]);

  return {
    error,
    handleError,
    clearError,
    retryWithErrorHandling,
  };
};
