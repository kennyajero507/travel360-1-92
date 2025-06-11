import { supabase } from "../integrations/supabase/client";
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
    this.flushErrorQueue();
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
    const errorLog = {
      id: crypto.randomUUID(),
      error_type: type,
      error_message: message,
      stack_trace: stack,
      context: context ? JSON.stringify(context) : null,
      resolved: false,
      created_at: new Date().toISOString()
    };

    // Add to queue if offline
    if (!this.isOnline) {
      this.errorQueue.push(errorLog as ErrorLog);
      this.saveToLocalStorage();
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('error_logs')
        .insert([{
          ...errorLog,
          user_id: user?.id
        }]);

      if (error) {
        console.error('Failed to log error to database:', error);
        this.errorQueue.push(errorLog as ErrorLog);
        this.saveToLocalStorage();
      }

      // Show user-friendly notifications based on severity
      this.showUserNotification(severity, message);
    } catch (error) {
      console.error('Error logging to database:', error);
      this.errorQueue.push(errorLog as ErrorLog);
      this.saveToLocalStorage();
    }
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

  private async flushErrorQueue() {
    if (this.errorQueue.length === 0) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const errorsToInsert = this.errorQueue.map(error => ({
        ...error,
        user_id: user?.id
      }));

      const { error } = await supabase
        .from('error_logs')
        .insert(errorsToInsert);

      if (!error) {
        this.errorQueue = [];
        this.clearLocalStorage();
      }
    } catch (error) {
      console.error('Failed to flush error queue:', error);
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
      const { data, error } = await supabase
        .from('error_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to fetch error logs:', error);
      return [];
    }
  }

  async markErrorResolved(errorId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('error_logs')
        .update({ resolved: true })
        .eq('id', errorId);

      return !error;
    } catch (error) {
      console.error('Failed to mark error as resolved:', error);
      return false;
    }
  }
}

export const enhancedErrorService = new EnhancedErrorService();
