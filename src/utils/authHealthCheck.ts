import { supabase } from '../integrations/supabase/client';

export interface AuthHealthCheckResult {
  overall: 'healthy' | 'warning' | 'critical';
  checks: {
    sessionValid: boolean;
    profileAccessible: boolean;
    rlsPoliciesWorking: boolean;
    userFunctionsWorking: boolean;
  };
  errors: string[];
  recommendations: string[];
}

export const runAuthHealthCheck = async (): Promise<AuthHealthCheckResult> => {
  const result: AuthHealthCheckResult = {
    overall: 'healthy',
    checks: {
      sessionValid: false,
      profileAccessible: false,
      rlsPoliciesWorking: false,
      userFunctionsWorking: false,
    },
    errors: [],
    recommendations: []
  };

  try {
    // Check 1: Session validity
    const { data: session, error: sessionError } = await supabase.auth.getSession();
    result.checks.sessionValid = !!session.session && !sessionError;
    
    if (!result.checks.sessionValid) {
      result.errors.push('Invalid or missing session');
      result.recommendations.push('User needs to sign in again');
    }

    if (session.session?.user) {
      const userId = session.session.user.id;

      // Check 2: Profile accessibility
      try {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();

        result.checks.profileAccessible = !profileError;
        
        if (profileError) {
          result.errors.push(`Profile access error: ${profileError.message}`);
          if (profileError.code === '42P17') {
            result.errors.push('RLS infinite recursion detected');
            result.recommendations.push('Database RLS policies need to be fixed');
          }
        }
      } catch (err: any) {
        result.checks.profileAccessible = false;
        result.errors.push(`Profile fetch failed: ${err.message}`);
      }

      // Check 3: User functions working
      try {
        const { data: debugData, error: debugError } = await supabase.rpc('debug_auth_status', {
          target_user_id: userId
        });

        result.checks.userFunctionsWorking = !debugError;
        
        if (debugError) {
          result.errors.push(`Auth functions error: ${debugError.message}`);
        }
      } catch (err: any) {
        result.checks.userFunctionsWorking = false;
        result.errors.push(`Auth functions failed: ${err.message}`);
      }

      // Check 4: RLS policies working (test with a safe query)
      try {
        const { error: rlsError } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', userId)
          .limit(1);

        result.checks.rlsPoliciesWorking = !rlsError;
        
        if (rlsError) {
          result.errors.push(`RLS policy error: ${rlsError.message}`);
          result.recommendations.push('Review and fix RLS policies');
        }
      } catch (err: any) {
        result.checks.rlsPoliciesWorking = false;
        result.errors.push(`RLS test failed: ${err.message}`);
      }
    }

    // Determine overall health
    const allChecks = Object.values(result.checks);
    const healthyChecks = allChecks.filter(Boolean).length;
    
    if (healthyChecks === allChecks.length) {
      result.overall = 'healthy';
    } else if (healthyChecks >= allChecks.length / 2) {
      result.overall = 'warning';
    } else {
      result.overall = 'critical';
    }

    // Add general recommendations
    if (result.overall !== 'healthy') {
      result.recommendations.push('Run this health check again after implementing fixes');
    }

  } catch (err: any) {
    result.overall = 'critical';
    result.errors.push(`Health check failed: ${err.message}`);
    result.recommendations.push('Contact system administrator');
  }

  return result;
};

export const logHealthCheckResult = (result: AuthHealthCheckResult) => {
  console.group('🏥 Auth Health Check Results');
  console.log(`Overall Status: ${result.overall.toUpperCase()}`);
  console.log('Checks:', result.checks);
  
  if (result.errors.length > 0) {
    console.group('❌ Errors:');
    result.errors.forEach(error => console.log(`• ${error}`));
    console.groupEnd();
  }
  
  if (result.recommendations.length > 0) {
    console.group('💡 Recommendations:');
    result.recommendations.forEach(rec => console.log(`• ${rec}`));
    console.groupEnd();
  }
  
  console.groupEnd();
};