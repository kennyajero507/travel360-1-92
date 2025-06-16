
import { toast } from 'sonner';

export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
}

export class ErrorHandler {
  static handleSupabaseError(error: any, context: string = 'Database operation'): AppError {
    console.error(`[ErrorHandler] ${context}:`, error);
    
    const appError: AppError = {
      code: error.code || 'UNKNOWN_ERROR',
      message: this.getReadableErrorMessage(error),
      details: error,
      timestamp: new Date()
    };

    // Show user-friendly toast
    toast.error(appError.message);
    
    return appError;
  }

  static handleAuthError(error: any): AppError {
    console.error('[ErrorHandler] Authentication error:', error);
    
    const appError: AppError = {
      code: error.code || 'AUTH_ERROR',
      message: this.getAuthErrorMessage(error),
      details: error,
      timestamp: new Date()
    };

    toast.error(appError.message);
    return appError;
  }

  static handleValidationError(field: string, value: any, rule: string): AppError {
    const message = `${field} validation failed: ${rule}`;
    console.warn('[ErrorHandler] Validation error:', { field, value, rule });
    
    const appError: AppError = {
      code: 'VALIDATION_ERROR',
      message,
      details: { field, value, rule },
      timestamp: new Date()
    };

    toast.error(message);
    return appError;
  }

  private static getReadableErrorMessage(error: any): string {
    if (error.message?.includes('violates row-level security')) {
      return 'You do not have permission to perform this action';
    }
    
    if (error.message?.includes('duplicate key')) {
      return 'This record already exists';
    }
    
    if (error.message?.includes('foreign key')) {
      return 'Cannot complete operation: related record not found';
    }
    
    if (error.message?.includes('not null')) {
      return 'Required field is missing';
    }

    if (error.code === 'PGRST116') {
      return 'No data found or access denied';
    }

    return error.message || 'An unexpected error occurred';
  }

  private static getAuthErrorMessage(error: any): string {
    switch (error.message) {
      case 'Invalid login credentials':
        return 'Invalid email or password';
      case 'Email not confirmed':
        return 'Please check your email and confirm your account';
      case 'Too many requests':
        return 'Too many attempts. Please try again later';
      default:
        return error.message || 'Authentication failed';
    }
  }
}

export const logError = (error: AppError) => {
  // In production, this could send to logging service
  console.error('[ErrorLog]', {
    code: error.code,
    message: error.message,
    timestamp: error.timestamp,
    details: error.details
  });
};
