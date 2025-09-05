// Centralized error handling service to ensure consistency across the app
import { toast } from 'sonner';

export interface AppError {
  message: string;
  code?: string;
  details?: any;
  context?: string;
  timestamp: Date;
}

export class ErrorHandler {
  private static instance: ErrorHandler;
  private errorLog: AppError[] = [];

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  logError(error: any, context?: string): AppError {
    const appError: AppError = {
      message: error?.message || 'Unknown error occurred',
      code: error?.code || error?.status,
      details: error?.details || error?.hint,
      context,
      timestamp: new Date()
    };

    this.errorLog.push(appError);
    console.error('[ErrorHandler]', appError);
    
    // Keep only last 100 errors to prevent memory issues
    if (this.errorLog.length > 100) {
      this.errorLog = this.errorLog.slice(-100);
    }

    return appError;
  }

  handleError(error: any, context?: string, showToast = true): AppError {
    const appError = this.logError(error, context);
    
    if (showToast) {
      this.showUserFriendlyError(appError);
    }

    return appError;
  }

  private showUserFriendlyError(error: AppError): void {
    // Map common database errors to user-friendly messages
    let userMessage = error.message;

    if (error.code === '23505') {
      userMessage = 'This item already exists. Please use a different name.';
    } else if (error.code === '23503') {
      userMessage = 'Cannot delete this item as it is being used elsewhere.';
    } else if (error.code === 'PGRST301') {
      userMessage = 'You do not have permission to perform this action.';
    } else if (error.message.includes('JWT')) {
      userMessage = 'Your session has expired. Please log in again.';
    } else if (error.message.includes('network')) {
      userMessage = 'Network error. Please check your connection and try again.';
    } else if (error.code === '42501') {
      userMessage = 'Access denied. You do not have the required permissions.';
    }

    toast.error(userMessage, {
      description: error.context ? `Context: ${error.context}` : undefined,
    });
  }

  getErrorLog(): AppError[] {
    return [...this.errorLog];
  }

  clearErrorLog(): void {
    this.errorLog = [];
  }
}

export const errorHandler = ErrorHandler.getInstance();
