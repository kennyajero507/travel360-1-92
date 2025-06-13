
import { auditService } from './auditService';

export interface ErrorLogEntry {
  type: string;
  message: string;
  stack?: string;
  context?: any;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp?: string;
}

class EnhancedErrorService {
  async logError(error: ErrorLogEntry): Promise<void> {
    try {
      console.error('[EnhancedErrorService]', error);
      
      // Log to audit service
      await auditService.logAction(
        'ERROR',
        'system_errors',
        undefined,
        undefined,
        {
          ...error,
          timestamp: error.timestamp || new Date().toISOString()
        }
      );
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }
  }

  async logUserError(
    userId: string,
    action: string,
    error: Error,
    context?: any
  ): Promise<void> {
    await this.logError({
      type: 'user_error',
      message: `User ${userId} encountered error during ${action}: ${error.message}`,
      stack: error.stack,
      context: { userId, action, ...context },
      severity: 'medium'
    });
  }

  async logSystemError(
    component: string,
    error: Error,
    context?: any
  ): Promise<void> {
    await this.logError({
      type: 'system_error',
      message: `System error in ${component}: ${error.message}`,
      stack: error.stack,
      context: { component, ...context },
      severity: 'high'
    });
  }
}

export const enhancedErrorService = new EnhancedErrorService();
