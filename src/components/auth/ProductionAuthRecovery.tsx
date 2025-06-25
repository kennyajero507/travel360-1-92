
import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { RefreshCw, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '../../integrations/supabase/client';

interface RecoveryStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'running' | 'success' | 'error';
  error?: string;
}

const ProductionAuthRecovery = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [steps, setSteps] = useState<RecoveryStep[]>([
    {
      id: 'session',
      title: 'Check Session',
      description: 'Verify current authentication session',
      status: 'pending'
    },
    {
      id: 'profile',
      title: 'Verify Profile',
      description: 'Check if user profile exists',
      status: 'pending'
    },
    {
      id: 'repair',
      title: 'Repair Profile',
      description: 'Create missing profile if needed',
      status: 'pending'
    },
    {
      id: 'organization',
      title: 'Check Organization',
      description: 'Verify organization membership',
      status: 'pending'
    }
  ]);

  const updateStep = (id: string, updates: Partial<RecoveryStep>) => {
    setSteps(prev => prev.map(step => 
      step.id === id ? { ...step, ...updates } : step
    ));
  };

  const runRecovery = async () => {
    setIsRunning(true);
    
    try {
      // Step 1: Check Session
      updateStep('session', { status: 'running' });
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        updateStep('session', { status: 'error', error: sessionError.message });
        return;
      }
      
      if (!session) {
        updateStep('session', { status: 'error', error: 'No active session found' });
        return;
      }
      
      updateStep('session', { status: 'success' });
      
      // Step 2: Check Profile
      updateStep('profile', { status: 'running' });
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();
      
      if (profileError && profileError.code !== 'PGRST116') {
        updateStep('profile', { status: 'error', error: profileError.message });
        return;
      }
      
      if (profile) {
        updateStep('profile', { status: 'success' });
        updateStep('repair', { status: 'success', description: 'Profile already exists' });
      } else {
        updateStep('profile', { status: 'error', error: 'Profile not found' });
        
        // Step 3: Repair Profile
        updateStep('repair', { status: 'running' });
        
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: session.user.id,
            email: session.user.email,
            full_name: session.user.user_metadata?.full_name || 'User',
            role: 'org_owner',
            created_at: new Date().toISOString(),
            trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
          })
          .select()
          .single();
        
        if (createError) {
          updateStep('repair', { status: 'error', error: createError.message });
          return;
        }
        
        updateStep('repair', { status: 'success' });
      }
      
      // Step 4: Check Organization
      updateStep('organization', { status: 'running' });
      
      // Get the current profile (either existing or newly created)
      const { data: currentProfile, error: currentProfileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      if (currentProfileError) {
        updateStep('organization', { status: 'error', error: currentProfileError.message });
        return;
      }
      
      if (currentProfile && !currentProfile.org_id) {
        // Create organization for user
        const { data: org, error: orgError } = await supabase
          .from('organizations')
          .insert({
            name: `${currentProfile.full_name || 'User'}'s Organization`,
            owner_id: session.user.id,
            created_at: new Date().toISOString()
          })
          .select()
          .single();
        
        if (orgError) {
          updateStep('organization', { status: 'error', error: orgError.message });
          return;
        }
        
        // Link profile to organization
        await supabase
          .from('profiles')
          .update({ org_id: org.id })
          .eq('id', session.user.id);
      }
      
      updateStep('organization', { status: 'success' });
      
    } catch (error: any) {
      console.error('Recovery error:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const getStepIcon = (status: RecoveryStep['status']) => {
    switch (status) {
      case 'running':
        return <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <div className="h-4 w-4 border-2 border-gray-300 rounded-full" />;
    }
  };

  const allSuccess = steps.every(step => step.status === 'success');
  const hasErrors = steps.some(step => step.status === 'error');

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-600" />
          Authentication Recovery Tool
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <AlertDescription>
            This tool will attempt to diagnose and fix common authentication issues.
            It's safe to run and won't affect existing data.
          </AlertDescription>
        </Alert>
        
        <div className="space-y-3">
          {steps.map((step) => (
            <div key={step.id} className="flex items-start gap-3 p-3 border rounded-lg">
              {getStepIcon(step.status)}
              <div className="flex-1">
                <h4 className="font-medium text-sm">{step.title}</h4>
                <p className="text-xs text-gray-600">{step.description}</p>
                {step.error && (
                  <p className="text-xs text-red-600 mt-1">{step.error}</p>
                )}
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={runRecovery}
            disabled={isRunning}
            className="flex-1"
          >
            {isRunning ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Running Recovery...
              </>
            ) : (
              'Run Recovery'
            )}
          </Button>
          
          {allSuccess && (
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
            >
              Refresh Page
            </Button>
          )}
        </div>
        
        {allSuccess && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription className="text-green-700">
              Recovery completed successfully! Your authentication should now work properly.
            </AlertDescription>
          </Alert>
        )}
        
        {hasErrors && (
          <Alert variant="destructive">
            <AlertDescription>
              Some recovery steps failed. Please contact support if issues persist.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default ProductionAuthRecovery;
