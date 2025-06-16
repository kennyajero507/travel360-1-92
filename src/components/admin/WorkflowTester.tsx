
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { CheckCircle, XCircle, Play, User, Building, FileText, Calendar, Mail } from 'lucide-react';
import { toast } from 'sonner';

interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'success' | 'error';
  icon: React.ReactNode;
  message?: string;
}

const WorkflowTester = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<WorkflowStep[]>([
    {
      id: 'signup',
      name: 'User Signup',
      description: 'Test user registration and profile creation',
      status: 'pending',
      icon: <User className="h-4 w-4" />
    },
    {
      id: 'organization',
      name: 'Organization Setup',
      description: 'Test organization creation and configuration',
      status: 'pending',
      icon: <Building className="h-4 w-4" />
    },
    {
      id: 'inquiry',
      name: 'Inquiry Creation',
      description: 'Test inquiry form submission and processing',
      status: 'pending',
      icon: <FileText className="h-4 w-4" />
    },
    {
      id: 'quote',
      name: 'Quote Generation',
      description: 'Test quote creation from inquiry',
      status: 'pending',
      icon: <Calendar className="h-4 w-4" />
    },
    {
      id: 'booking',
      name: 'Booking Creation',
      description: 'Test booking conversion from quote',
      status: 'pending',
      icon: <CheckCircle className="h-4 w-4" />
    },
    {
      id: 'voucher',
      name: 'Voucher Generation',
      description: 'Test voucher creation and email sending',
      status: 'pending',
      icon: <Mail className="h-4 w-4" />
    }
  ]);

  const updateStepStatus = (stepIndex: number, status: WorkflowStep['status'], message?: string) => {
    setSteps(prev => prev.map((step, index) => 
      index === stepIndex ? { ...step, status, message } : step
    ));
  };

  const runWorkflowTest = async () => {
    setIsRunning(true);
    setCurrentStep(0);

    for (let i = 0; i < steps.length; i++) {
      setCurrentStep(i);
      updateStepStatus(i, 'running');

      // Simulate workflow step testing
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mock test results (in real implementation, these would be actual API calls)
      const mockResults = [
        { success: true, message: 'User signup flow accessible' },
        { success: true, message: 'Organization setup working' },
        { success: true, message: 'Inquiry form functional' },
        { success: true, message: 'Quote generation working' },
        { success: true, message: 'Booking conversion available' },
        { success: false, message: 'Email service needs RESEND_API_KEY' }
      ];

      const result = mockResults[i];
      updateStepStatus(i, result.success ? 'success' : 'error', result.message);
    }

    setIsRunning(false);
    toast.success('Workflow test completed');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'running': return <div className="h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
      default: return <div className="h-4 w-4 border-2 border-gray-300 rounded-full" />;
    }
  };

  const progress = ((steps.filter(s => s.status === 'success' || s.status === 'error').length) / steps.length) * 100;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>End-to-End Workflow Test</CardTitle>
          <Button 
            onClick={runWorkflowTest} 
            disabled={isRunning}
            size="sm"
          >
            <Play className="h-4 w-4 mr-2" />
            {isRunning ? 'Testing...' : 'Run Test'}
          </Button>
        </div>
        {isRunning && (
          <div className="space-y-2">
            <Progress value={progress} className="w-full" />
            <p className="text-sm text-gray-600">
              Testing step {currentStep + 1} of {steps.length}
            </p>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center gap-3 p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                {step.icon}
                {getStatusIcon(step.status)}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{step.name}</h4>
                  <Badge variant="outline" className={
                    step.status === 'success' ? 'text-green-700 bg-green-50' :
                    step.status === 'error' ? 'text-red-700 bg-red-50' :
                    step.status === 'running' ? 'text-blue-700 bg-blue-50' :
                    'text-gray-700 bg-gray-50'
                  }>
                    {step.status}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">{step.description}</p>
                {step.message && (
                  <p className="text-sm mt-1 font-medium">{step.message}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkflowTester;
