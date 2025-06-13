
import React from 'react';
import { toast } from 'sonner';
import { auditService } from './auditService';
import { enhancedErrorService } from './enhancedErrorService';

export interface SystemError {
  code: string;
  message: string;
  component?: string;
  userId?: string;
  context?: any;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

class SystemErrorHandler {
  async handleError(error: SystemError): Promise<void> {
    console.error('[SystemErrorHandler]', error);

    // Log to enhanced error service
    await enhancedErrorService.logError({
      type: 'system_error',
      message: error.message,
      context: {
        code: error.code,
        component: error.component,
        userId: error.userId,
        ...error.context
      },
      severity: error.severity
    });

    // Log to audit service if user is involved
    if (error.userId) {
      await auditService.logAction(
        'ERROR',
        'system_errors',
        undefined,
        undefined,
        {
          errorCode: error.code,
          component: error.component,
          severity: error.severity,
          timestamp: new Date().toISOString()
        }
      );
    }

    // Show user-friendly toast based on severity
    this.showUserNotification(error);
  }

  private showUserNotification(error: SystemError): void {
    const userFriendlyMessages = {
      AUTH_FAILED: 'Authentication failed. Please try logging in again.',
      NETWORK_ERROR: 'Network connection issue. Please check your internet connection.',
      DATABASE_ERROR: 'Unable to save data. Please try again.',
      PERMISSION_DENIED: 'You do not have permission to perform this action.',
      VALIDATION_ERROR: 'Please check your input and try again.',
      SESSION_EXPIRED: 'Your session has expired. Please log in again.',
      UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.'
    };

    const message = userFriendlyMessages[error.code as keyof typeof userFriendlyMessages] || error.message;

    switch (error.severity) {
      case 'critical':
      case 'high':
        toast.error(message);
        break;
      case 'medium':
        toast.warning(message);
        break;
      case 'low':
        toast.info(message);
        break;
    }
  }

  createErrorBoundary(component: string) {
    return (error: Error, errorInfo: React.ErrorInfo) => {
      this.handleError({
        code: 'REACT_ERROR',
        message: error.message,
        component,
        context: {
          stack: error.stack,
          componentStack: errorInfo.componentStack
        },
        severity: 'high'
      });
    };
  }

  async handleApiError(error: any, context: string): Promise<void> {
    let errorCode = 'UNKNOWN_ERROR';
    let severity: SystemError['severity'] = 'medium';

    if (error?.code) {
      errorCode = error.code;
    } else if (error?.message?.includes('network')) {
      errorCode = 'NETWORK_ERROR';
    } else if (error?.message?.includes('auth')) {
      errorCode = 'AUTH_FAILED';
      severity = 'high';
    } else if (error?.status === 403) {
      errorCode = 'PERMISSION_DENIED';
    } else if (error?.status === 401) {
      errorCode = 'SESSION_EXPIRED';
      severity = 'high';
    }

    await this.handleError({
      code: errorCode,
      message: error?.message || 'Unknown API error',
      context: { 
        apiContext: context,
        status: error?.status,
        response: error?.response
      },
      severity
    });
  }
}

export const systemErrorHandler = new SystemErrorHandler();
