
import { toast } from "sonner";

export interface ErrorLog {
  id: string;
  user_id?: string;
  error_type: string;
  error_message: string;
  stack_trace?: string;
  context?: any;
  resolved: boolean;
  created_at: string;
}

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

class EnhancedErrorService {
  private errorQueue: ErrorLog[] = [];
  private isOnline = navigator.onLine;

  constructor() {
    // Listen for online/offline events
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));
    
    // Set up global error handlers
    this.setupGlobalErrorHandlers();
    
    // Load any stored errors from localStorage
    this.loadFromLocalStorage();
  }

  private setupGlobalErrorHandlers() {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.logError({
        type: 'unhandled_promise_rejection',
        message: event.reason?.message || 'Unhandled promise rejection',
        stack: event.reason?.stack,
        context: { reason: event.reason },
        severity: 'high'
      });
    });

    // Handle JavaScript errors
    window.addEventListener('error', (event) => {
      this.logError({
        type: 'javascript_error',
        message: event.message,
        stack: event.error?.stack,
        context: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno
        },
        severity: 'medium'
      });
    });
  }

  private handleOnline() {
    this.isOnline = true;
    // Note: We'll implement database sync when tables are available
    console.log('[EnhancedErrorService] Back online - database sync pending table creation');
  }

  private handleOffline() {
    this.isOnline = false;
  }

  async logError({
    type,
    message,
    stack,
    context,
    severity = 'medium'
  }: {
    type: string;
    message: string;
    stack?: string;
    context?: any;
    severity?: ErrorSeverity;
  }): Promise<void> {
    const errorLog: ErrorLog = {
      id: crypto.randomUUID(),
      error_type: type,
      error_message: message,
      stack_trace: stack,
      context: context ? JSON.stringify(context) : undefined,
      resolved: false,
      created_at: new Date().toISOString()
    };

    // Store in localStorage until database tables are available
    this.errorQueue.push(errorLog);
    this.saveToLocalStorage();

    // Show user-friendly notifications based on severity
    this.showUserNotification(severity, message);
    
    // Log to console for development
    console.error('[EnhancedErrorService] Error logged:', errorLog);
  }

  private showUserNotification(severity: ErrorSeverity, message: string) {
    switch (severity) {
      case 'critical':
        toast.error('Critical error occurred. Please refresh the page.');
        break;
      case 'high':
        toast.error('An error occurred. Please try again.');
        break;
      case 'medium':
        toast.warning('Something went wrong. Please try again.');
        break;
      case 'low':
        // Don't show toast for low severity errors
        console.warn('Low severity error:', message);
        break;
    }
  }

  private saveToLocalStorage() {
    try {
      localStorage.setItem('errorQueue', JSON.stringify(this.errorQueue));
    } catch (error) {
      console.error('Failed to save error queue to localStorage:', error);
    }
  }

  private clearLocalStorage() {
    try {
      localStorage.removeItem('errorQueue');
    } catch (error) {
      console.error('Failed to clear error queue from localStorage:', error);
    }
  }

  private loadFromLocalStorage() {
    try {
      const stored = localStorage.getItem('errorQueue');
      if (stored) {
        this.errorQueue = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load error queue from localStorage:', error);
    }
  }

  async getErrorLogs(limit: number = 50): Promise<ErrorLog[]> {
    try {
      // Return from localStorage until database is available
      return this.errorQueue.slice(0, limit);
    } catch (error) {
      console.error('Failed to fetch error logs:', error);
      return [];
    }
  }

  async markErrorResolved(errorId: string): Promise<boolean> {
    try {
      // Update in localStorage
      const errorIndex = this.errorQueue.findIndex(e => e.id === errorId);
      if (errorIndex !== -1) {
        this.errorQueue[errorIndex].resolved = true;
        this.saveToLocalStorage();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to mark error as resolved:', error);
      return false;
    }
  }
}

export const enhancedErrorService = new EnhancedErrorService();
