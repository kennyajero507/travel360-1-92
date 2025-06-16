
import { useCallback } from 'react';
import { ErrorHandler, AppError } from '../utils/errorHandler';

export const useErrorHandler = () => {
  const handleError = useCallback((error: any, context?: string): AppError => {
    if (error.code?.startsWith('PGRST') || error.message?.includes('postgres')) {
      return ErrorHandler.handleSupabaseError(error, context);
    }
    
    if (error.code?.startsWith('auth')) {
      return ErrorHandler.handleAuthError(error);
    }
    
    // Generic error handling
    console.error('[useErrorHandler] Unhandled error:', error);
    return {
      code: 'UNKNOWN_ERROR',
      message: error.message || 'An unexpected error occurred',
      details: error,
      timestamp: new Date()
    };
  }, []);

  const handleAsyncOperation = useCallback(async <T>(
    operation: () => Promise<T>,
    context?: string,
    onError?: (error: AppError) => void
  ): Promise<T | null> => {
    try {
      return await operation();
    } catch (error) {
      const appError = handleError(error, context);
      if (onError) {
        onError(appError);
      }
      return null;
    }
  }, [handleError]);

  return {
    handleError,
    handleAsyncOperation
  };
};
