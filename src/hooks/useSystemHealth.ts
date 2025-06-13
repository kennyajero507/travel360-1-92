
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../integrations/supabase/client';
import { systemErrorHandler } from '../services/systemErrorHandler';
import { realCurrencyService } from '../services/realCurrencyService';

interface SystemHealthStatus {
  database: 'healthy' | 'degraded' | 'down';
  auth: 'healthy' | 'degraded' | 'down';
  currency: 'healthy' | 'degraded' | 'down';
  overall: 'healthy' | 'degraded' | 'down';
  lastChecked: Date;
}

export const useSystemHealth = () => {
  const [healthStatus, setHealthStatus] = useState<SystemHealthStatus>({
    database: 'healthy',
    auth: 'healthy',
    currency: 'healthy',
    overall: 'healthy',
    lastChecked: new Date()
  });

  const [isChecking, setIsChecking] = useState(false);

  const checkDatabaseHealth = async (): Promise<'healthy' | 'degraded' | 'down'> => {
    try {
      const { error } = await supabase.from('profiles').select('id').limit(1);
      return error ? 'degraded' : 'healthy';
    } catch {
      return 'down';
    }
  };

  const checkAuthHealth = async (): Promise<'healthy' | 'degraded' | 'down'> => {
    try {
      const { error } = await supabase.auth.getSession();
      return error ? 'degraded' : 'healthy';
    } catch {
      return 'down';
    }
  };

  const checkCurrencyHealth = async (): Promise<'healthy' | 'degraded' | 'down'> => {
    try {
      const rates = await realCurrencyService.getExchangeRates();
      return Object.keys(rates).length > 0 ? 'healthy' : 'degraded';
    } catch {
      return 'down';
    }
  };

  const checkSystemHealth = useCallback(async () => {
    setIsChecking(true);
    
    try {
      const [database, auth, currency] = await Promise.all([
        checkDatabaseHealth(),
        checkAuthHealth(),
        checkCurrencyHealth()
      ]);

      const services = [database, auth, currency];
      const downCount = services.filter(status => status === 'down').length;
      const degradedCount = services.filter(status => status === 'degraded').length;

      let overall: 'healthy' | 'degraded' | 'down';
      if (downCount > 0) {
        overall = 'down';
      } else if (degradedCount > 0) {
        overall = 'degraded';
      } else {
        overall = 'healthy';
      }

      const newStatus: SystemHealthStatus = {
        database,
        auth,
        currency,
        overall,
        lastChecked: new Date()
      };

      setHealthStatus(newStatus);

      // Log health issues
      if (overall !== 'healthy') {
        await systemErrorHandler.handleError({
          code: 'SYSTEM_HEALTH_ISSUE',
          message: `System health check failed: ${overall}`,
          context: {
            database,
            auth,
            currency,
            timestamp: new Date().toISOString()
          },
          severity: overall === 'down' ? 'critical' : 'high'
        });
      }

      return newStatus;
    } catch (error) {
      await systemErrorHandler.handleError({
        code: 'HEALTH_CHECK_FAILED',
        message: 'Failed to perform system health check',
        context: { error },
        severity: 'high'
      });

      return healthStatus;
    } finally {
      setIsChecking(false);
    }
  }, [healthStatus]);

  // Perform health check on mount and periodically
  useEffect(() => {
    checkSystemHealth();
    
    // Check every 5 minutes
    const interval = setInterval(checkSystemHealth, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [checkSystemHealth]);

  const initializeSystem = useCallback(async () => {
    try {
      // Initialize fallback exchange rates
      await realCurrencyService.initializeFallbackRates();
      
      console.log('System initialization completed');
    } catch (error) {
      await systemErrorHandler.handleError({
        code: 'SYSTEM_INIT_FAILED',
        message: 'Failed to initialize system',
        context: { error },
        severity: 'critical'
      });
    }
  }, []);

  return {
    healthStatus,
    isChecking,
    checkSystemHealth,
    initializeSystem
  };
};
