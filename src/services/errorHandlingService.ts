
import { toast } from "sonner";

export type ErrorType = 'network' | 'validation' | 'authentication' | 'permission' | 'not_found' | 'server' | 'unknown';

export interface ErrorDetails {
  type: ErrorType;
  message: string;
  code?: string;
  details?: any;
  context?: string;
  timestamp?: string; // Added timestamp to interface
}

class ErrorHandlingService {
  private errorLog: ErrorDetails[] = [];

  logError(error: ErrorDetails) {
    this.errorLog.push({
      ...error,
      timestamp: new Date().toISOString()
    });
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('[ErrorHandling]', error);
    }
  }

  handleError(error: any, context?: string): ErrorDetails {
    const errorDetails = this.parseError(error, context);
    this.logError(errorDetails);
    this.showUserFriendlyMessage(errorDetails);
    return errorDetails;
  }

  private parseError(error: any, context?: string): ErrorDetails {
    // Handle Supabase errors
    if (error?.code) {
      switch (error.code) {
        case '23505':
          return {
            type: 'validation',
            message: 'This record already exists',
            code: error.code,
            context
          };
        case '42501':
          return {
            type: 'permission',
            message: 'You do not have permission to perform this action',
            code: error.code,
            context
          };
        case 'PGRST116':
          return {
            type: 'not_found',
            message: 'The requested resource was not found',
            code: error.code,
            context
          };
        default:
          return {
            type: 'server',
            message: error.message || 'A server error occurred',
            code: error.code,
            context
          };
      }
    }

    // Handle network errors
    if (error.name === 'NetworkError' || error.message?.includes('fetch')) {
      return {
        type: 'network',
        message: 'Network connection error. Please check your internet connection.',
        context
      };
    }

    // Handle validation errors
    if (error.name === 'ValidationError' || error.message?.includes('validation')) {
      return {
        type: 'validation',
        message: error.message || 'Please check your input and try again',
        context
      };
    }

    // Handle authentication errors
    if (error.message?.includes('auth') || error.status === 401) {
      return {
        type: 'authentication',
        message: 'Please log in to continue',
        context
      };
    }

    // Default error
    return {
      type: 'unknown',
      message: error.message || 'An unexpected error occurred',
      details: error,
      context
    };
  }

  private showUserFriendlyMessage(error: ErrorDetails) {
    const messages = {
      network: "Connection issue. Please check your internet and try again.",
      validation: error.message,
      authentication: "Please log in to continue.",
      permission: "You don't have permission for this action.",
      not_found: "The requested item was not found.",
      server: "Server error. Please try again later.",
      unknown: "Something went wrong. Please try again."
    };

    const message = messages[error.type] || error.message;
    
    switch (error.type) {
      case 'network':
      case 'server':
      case 'unknown':
        toast.error(message);
        break;
      case 'validation':
        toast.error(message);
        break;
      case 'authentication':
        toast.error(message);
        break;
      case 'permission':
        toast.warning(message);
        break;
      case 'not_found':
        toast.info(message);
        break;
    }
  }

  getErrorHistory(): ErrorDetails[] {
    return [...this.errorLog];
  }

  clearErrorHistory() {
    this.errorLog = [];
  }
}

export const errorHandler = new ErrorHandlingService();
