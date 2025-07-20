import { supabase } from '../integrations/supabase/client';
import { runAuthHealthCheck } from './authHealthCheck';

export interface SystemHealthReport {
  timestamp: string;
  auth: {
    healthy: boolean;
    issues: string[];
  };
  database: {
    healthy: boolean;
    issues: string[];
  };
  security: {
    healthy: boolean;
    issues: string[];
  };
  overall: 'healthy' | 'warning' | 'critical';
}

export const generateSystemHealthReport = async (): Promise<SystemHealthReport> => {
  const report: SystemHealthReport = {
    timestamp: new Date().toISOString(),
    auth: { healthy: true, issues: [] },
    database: { healthy: true, issues: [] },
    security: { healthy: true, issues: [] },
    overall: 'healthy'
  };

  try {
    // Run auth health check
    const authHealth = await runAuthHealthCheck();
    report.auth.healthy = authHealth.overall === 'healthy';
    report.auth.issues = authHealth.errors;

    // Test database connectivity
    try {
      const { error: dbError } = await supabase.from('profiles').select('id').limit(1);
      if (dbError) {
        report.database.healthy = false;
        report.database.issues.push(`Database connectivity error: ${dbError.message}`);
      }
    } catch (err: any) {
      report.database.healthy = false;
      report.database.issues.push(`Database test failed: ${err.message}`);
    }

    // Security checks
    try {
      const { data: user } = await supabase.auth.getUser();
      if (user.user) {
        // Test RLS policies
        const { error: rlsError } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user.user.id)
          .limit(1);
        
        if (rlsError) {
          report.security.healthy = false;
          report.security.issues.push(`RLS policy error: ${rlsError.message}`);
        }
      }
    } catch (err: any) {
      report.security.healthy = false;
      report.security.issues.push(`Security test failed: ${err.message}`);
    }

    // Determine overall health
    const healthySystems = [report.auth.healthy, report.database.healthy, report.security.healthy];
    const healthyCount = healthySystems.filter(Boolean).length;
    
    if (healthyCount === 3) {
      report.overall = 'healthy';
    } else if (healthyCount >= 2) {
      report.overall = 'warning';
    } else {
      report.overall = 'critical';
    }

  } catch (err: any) {
    report.overall = 'critical';
    report.auth.issues.push(`System health check failed: ${err.message}`);
  }

  return report;
};

export const logSystemHealthReport = (report: SystemHealthReport) => {
  console.group('🏥 System Health Report');
  console.log(`Generated: ${report.timestamp}`);
  console.log(`Overall Status: ${report.overall.toUpperCase()}`);
  
  console.group('🔐 Authentication');
  console.log(`Status: ${report.auth.healthy ? '✅ Healthy' : '❌ Issues Found'}`);
  if (report.auth.issues.length > 0) {
    report.auth.issues.forEach(issue => console.log(`• ${issue}`));
  }
  console.groupEnd();
  
  console.group('🗄️ Database');
  console.log(`Status: ${report.database.healthy ? '✅ Healthy' : '❌ Issues Found'}`);
  if (report.database.issues.length > 0) {
    report.database.issues.forEach(issue => console.log(`• ${issue}`));
  }
  console.groupEnd();
  
  console.group('🔒 Security');
  console.log(`Status: ${report.security.healthy ? '✅ Healthy' : '❌ Issues Found'}`);
  if (report.security.issues.length > 0) {
    report.security.issues.forEach(issue => console.log(`• ${issue}`));
  }
  console.groupEnd();
  
  console.groupEnd();
};