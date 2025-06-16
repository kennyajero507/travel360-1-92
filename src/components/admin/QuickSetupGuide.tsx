
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';
import { CheckCircle, AlertCircle, Mail, Settings, Users, Building } from 'lucide-react';
import { supabase } from '../../integrations/supabase/client';

interface SetupStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  icon: React.ReactNode;
  action?: () => void;
}

const QuickSetupGuide = () => {
  const [setupSteps, setSetupSteps] = useState<SetupStep[]>([
    {
      id: 'email',
      title: 'Configure Email Service',
      description: 'Set up RESEND_API_KEY for email functionality',
      completed: false,
      icon: <Mail className="h-4 w-4" />
    },
    {
      id: 'admin',
      title: 'Create Admin Account',
      description: 'Ensure you have a system admin account',
      completed: false,
      icon: <Users className="h-4 w-4" />
    },
    {
      id: 'organization',
      title: 'Setup First Organization',
      description: 'Create your first organization to start using the system',
      completed: false,
      icon: <Building className="h-4 w-4" />
    },
    {
      id: 'settings',
      title: 'Configure System Settings',
      description: 'Review and update system configuration',
      completed: false,
      icon: <Settings className="h-4 w-4" />
    }
  ]);

  const checkSetupStatus = async () => {
    // Check email service
    try {
      const { error } = await supabase.functions.invoke('send-email', {
        body: { test: true, to: 'test@example.com', subject: 'Test', html: 'Test' }
      });
      
      setSetupSteps(prev => prev.map(step => 
        step.id === 'email' 
          ? { ...step, completed: !error?.message?.includes('RESEND_API_KEY') }
          : step
      ));
    } catch (error) {
      console.log('Email service check failed');
    }

    // Check admin account
    try {
      const { data } = await supabase.from('profiles').select('role').eq('role', 'system_admin').limit(1);
      setSetupSteps(prev => prev.map(step => 
        step.id === 'admin' 
          ? { ...step, completed: (data && data.length > 0) }
          : step
      ));
    } catch (error) {
      console.log('Admin check failed');
    }

    // Check organizations
    try {
      const { data } = await supabase.from('organizations').select('id').limit(1);
      setSetupSteps(prev => prev.map(step => 
        step.id === 'organization' 
          ? { ...step, completed: (data && data.length > 0) }
          : step
      ));
    } catch (error) {
      console.log('Organization check failed');
    }

    // Settings is always considered completed for now
    setSetupSteps(prev => prev.map(step => 
      step.id === 'settings' 
        ? { ...step, completed: true }
        : step
    ));
  };

  useEffect(() => {
    checkSetupStatus();
  }, []);

  const completedSteps = setupSteps.filter(step => step.completed).length;
  const progressPercentage = (completedSteps / setupSteps.length) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Setup Guide</CardTitle>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <p className="text-sm text-gray-600">{completedSteps} of {setupSteps.length} steps completed</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {setupSteps.map((step) => (
            <div key={step.id} className="flex items-start gap-3 p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                {step.icon}
                {step.completed ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                )}
              </div>
              <div className="flex-1">
                <h4 className="font-medium">{step.title}</h4>
                <p className="text-sm text-gray-600">{step.description}</p>
                {!step.completed && step.id === 'email' && (
                  <Alert className="mt-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Configure RESEND_API_KEY in Supabase Edge Function secrets to enable email functionality.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6">
          <Button onClick={checkSetupStatus} variant="outline" className="w-full">
            Refresh Setup Status
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickSetupGuide;
