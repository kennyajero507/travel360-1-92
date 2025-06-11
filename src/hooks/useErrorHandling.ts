
import { useCallback } from 'react';
import { enhancedErrorService } from '../services/enhancedErrorService';
import { toast } from 'sonner';

export const useErrorHandling = () => {
  const handleError = useCallback(async (
    error: any,
    context?: string,
    showToast: boolean = true
  ) => {
    console.error('Error handled by useErrorHandling:', error);

    const errorType = error?.name || 'unknown_error';
    const errorMessage = error?.message || 'An unexpected error occurred';
    const errorStack = error?.stack;

    await enhancedErrorService.logError({
      type: errorType,
      message: errorMessage,
      stack: errorStack,
      context: { context, originalError: error },
      severity: 'medium'
    });

    if (showToast) {
      toast.error('Something went wrong. Please try again.');
    }
  }, []);

  const handleAsyncOperation = useCallback(async <T>(
    operation: () => Promise<T>,
    context?: string,
    showErrorToast: boolean = true
  ): Promise<T | null> => {
    try {
      return await operation();
    } catch (error) {
      await handleError(error, context, showErrorToast);
      return null;
    }
  }, [handleError]);

  return {
    handleError,
    handleAsyncOperation
  };
};
