
import { supabase } from "../integrations/supabase/client";
import { auditService } from "./auditService";
import { enhancedErrorService } from "./enhancedErrorService";

class SessionService {
  private sessionTimeout: NodeJS.Timeout | null = null;
  private readonly SESSION_WARNING_TIME = 5 * 60 * 1000; // 5 minutes before expiry
  private readonly SESSION_CLEANUP_INTERVAL = 60 * 1000; // Check every minute

  constructor() {
    this.startSessionMonitoring();
  }

  private startSessionMonitoring() {
    // Monitor session state changes
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        await this.handleSessionStart(session);
      } else if (event === 'SIGNED_OUT') {
        await this.handleSessionEnd();
      } else if (event === 'TOKEN_REFRESHED' && session) {
        await this.handleTokenRefresh(session);
      }
    });

    // Set up periodic session validation
    setInterval(this.validateSession.bind(this), this.SESSION_CLEANUP_INTERVAL);
  }

  private async handleSessionStart(session: any) {
    try {
      console.log('[SessionService] Session started');
      
      await auditService.logUserActivity(
        'session_started',
        'User session started',
        {
          sessionId: session.access_token.substring(0, 10) + '...',
          expiresAt: new Date(session.expires_at * 1000).toISOString()
        }
      );

      this.scheduleSessionWarning(session.expires_at);
    } catch (error) {
      await enhancedErrorService.logError({
        type: 'session_start_error',
        message: 'Failed to handle session start',
        context: { error },
        severity: 'low'
      });
    }
  }

  private async handleSessionEnd() {
    try {
      console.log('[SessionService] Session ended');
      
      if (this.sessionTimeout) {
        clearTimeout(this.sessionTimeout);
        this.sessionTimeout = null;
      }

      await auditService.logUserActivity(
        'session_ended',
        'User session ended',
        { endTime: new Date().toISOString() }
      );
    } catch (error) {
      await enhancedErrorService.logError({
        type: 'session_end_error',
        message: 'Failed to handle session end',
        context: { error },
        severity: 'low'
      });
    }
  }

  private async handleTokenRefresh(session: any) {
    try {
      console.log('[SessionService] Token refreshed');
      
      await auditService.logUserActivity(
        'token_refreshed',
        'Authentication token refreshed',
        {
          newExpiresAt: new Date(session.expires_at * 1000).toISOString()
        }
      );

      // Reschedule session warning
      this.scheduleSessionWarning(session.expires_at);
    } catch (error) {
      await enhancedErrorService.logError({
        type: 'token_refresh_error',
        message: 'Failed to handle token refresh',
        context: { error },
        severity: 'low'
      });
    }
  }

  private scheduleSessionWarning(expiresAt: number) {
    if (this.sessionTimeout) {
      clearTimeout(this.sessionTimeout);
    }

    const expiryTime = expiresAt * 1000;
    const warningTime = expiryTime - this.SESSION_WARNING_TIME;
    const timeUntilWarning = warningTime - Date.now();

    if (timeUntilWarning > 0) {
      this.sessionTimeout = setTimeout(() => {
        this.showSessionWarning();
      }, timeUntilWarning);
    }
  }

  private showSessionWarning() {
    // This could be enhanced with a modal dialog
    console.warn('Session will expire soon');
    
    // You could add a toast notification here
    // toast.warning('Your session will expire in 5 minutes. Please save your work.');
  }

  private async validateSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        await enhancedErrorService.logError({
          type: 'session_validation_error',
          message: 'Failed to validate session',
          context: { error: error.message },
          severity: 'medium'
        });
        return;
      }

      if (session) {
        const expiryTime = session.expires_at * 1000;
        const now = Date.now();
        
        // If session expires within 2 minutes, attempt refresh
        if (expiryTime - now < 2 * 60 * 1000) {
          console.log('[SessionService] Attempting to refresh session');
          await supabase.auth.refreshSession();
        }
      }
    } catch (error) {
      await enhancedErrorService.logError({
        type: 'session_validation_error',
        message: 'Session validation failed',
        context: { error },
        severity: 'low'
      });
    }
  }

  async forceSessionRefresh(): Promise<boolean> {
    try {
      const { error } = await supabase.auth.refreshSession();
      
      if (error) {
        await enhancedErrorService.logError({
          type: 'forced_refresh_error',
          message: 'Forced session refresh failed',
          context: { error: error.message },
          severity: 'medium'
        });
        return false;
      }

      await auditService.logUserActivity(
        'forced_session_refresh',
        'User manually refreshed session'
      );

      return true;
    } catch (error) {
      await enhancedErrorService.logError({
        type: 'forced_refresh_error',
        message: 'Failed to force session refresh',
        context: { error },
        severity: 'medium'
      });
      return false;
    }
  }
}

export const sessionService = new SessionService();
