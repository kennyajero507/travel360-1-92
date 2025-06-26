
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Separator } from '../ui/separator';
import { Badge } from '../ui/badge';
import { CheckCircle, Circle, Upload, Settings, Users, Mail } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../integrations/supabase/client';
import { toast } from 'sonner';

interface SetupStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  completed: boolean;
}

const OrganizationSetupWizard = () => {
  const { profile, organization, refreshProfile } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  
  const [orgData, setOrgData] = useState({
    name: organization?.name || '',
    tagline: organization?.tagline || '',
    primary_color: organization?.primary_color || '#0d9488',
    secondary_color: organization?.secondary_color || '#64748b',
    logo_url: organization?.logo_url || '',
  });

  const [settingsData, setSettingsData] = useState({
    default_country: 'Kenya',
    default_currency: 'KES',
    default_regions: ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret'],
  });

  const [emailData, setEmailData] = useState({
    welcome_subject: 'Welcome to {{organization_name}}',
    welcome_content: 'Thank you for choosing {{organization_name}} for your travel needs...',
    quote_subject: 'Your Travel Quote from {{organization_name}}',
    quote_content: 'Please find your travel quote attached...',
  });

  const steps: SetupStep[] = [
    {
      id: 'basic',
      title: 'Basic Information',
      description: 'Set up your organization profile',
      icon: <Settings className="h-5 w-5" />,
      completed: !!organization?.name,
    },
    {
      id: 'settings',
      title: 'Business Settings',
      description: 'Configure default settings',
      icon: <Circle className="h-5 w-5" />,
      completed: false,
    },
    {
      id: 'email',
      title: 'Email Templates',
      description: 'Set up communication templates',
      icon: <Mail className="h-5 w-5" />,
      completed: false,
    },
    {
      id: 'team',
      title: 'Team Setup',
      description: 'Invite team members',
      icon: <Users className="h-5 w-5" />,
      completed: false,
    },
  ];

  const updateOrganization = async () => {
    if (!organization?.id) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('organizations')
        .update(orgData)
        .eq('id', organization.id);

      if (error) throw error;
      
      toast.success('Organization updated successfully');
      await refreshProfile();
    } catch (error) {
      console.error('Error updating organization:', error);
      toast.error('Failed to update organization');
    } finally {
      setLoading(false);
    }
  };

  const createOrganizationSettings = async () => {
    if (!organization?.id) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('organization_settings')
        .upsert({
          org_id: organization.id,
          ...settingsData,
          default_regions: settingsData.default_regions,
        });

      if (error) throw error;
      
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const createEmailTemplates = async () => {
    if (!organization?.id) return;
    
    setLoading(true);
    try {
      const templates = [
        {
          org_id: organization.id,
          template_type: 'welcome',
          subject: emailData.welcome_subject,
          content: emailData.welcome_content,
          variables: JSON.stringify(['organization_name', 'client_name']),
        },
        {
          org_id: organization.id,
          template_type: 'quote',
          subject: emailData.quote_subject,
          content: emailData.quote_content,
          variables: JSON.stringify(['organization_name', 'client_name', 'quote_number']),
        },
      ];

      const { error } = await supabase
        .from('email_templates')
        .upsert(templates);

      if (error) throw error;
      
      toast.success('Email templates created successfully');
    } catch (error) {
      console.error('Error creating email templates:', error);
      toast.error('Failed to create email templates');
    } finally {
      setLoading(false);
    }
  };

  const handleStepAction = async () => {
    const step = steps[currentStep];
    
    switch (step.id) {
      case 'basic':
        await updateOrganization();
        break;
      case 'settings':
        await createOrganizationSettings();
        break;
      case 'email':
        await createEmailTemplates();
        break;
      case 'team':
        // Navigate to team management or skip
        break;
    }
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const renderStepContent = () => {
    const step = steps[currentStep];
    
    switch (step.id) {
      case 'basic':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Organization Name</Label>
              <Input
                id="name"
                value={orgData.name}
                onChange={(e) => setOrgData({ ...orgData, name: e.target.value })}
                placeholder="Enter organization name"
              />
            </div>
            
            <div>
              <Label htmlFor="tagline">Tagline</Label>
              <Input
                id="tagline"
                value={orgData.tagline}
                onChange={(e) => setOrgData({ ...orgData, tagline: e.target.value })}
                placeholder="Your organization's tagline"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="primary_color">Primary Color</Label>
                <Input
                  id="primary_color"
                  type="color"
                  value={orgData.primary_color}
                  onChange={(e) => setOrgData({ ...orgData, primary_color: e.target.value })}
                />
              </div>
              
              <div>
                <Label htmlFor="secondary_color">Secondary Color</Label>
                <Input
                  id="secondary_color"
                  type="color"
                  value={orgData.secondary_color}
                  onChange={(e) => setOrgData({ ...orgData, secondary_color: e.target.value })}
                />
              </div>
            </div>
          </div>
        );
        
      case 'settings':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="country">Default Country</Label>
              <Select value={settingsData.default_country} onValueChange={(value) => 
                setSettingsData({ ...settingsData, default_country: value })
              }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Kenya">Kenya</SelectItem>
                  <SelectItem value="Tanzania">Tanzania</SelectItem>
                  <SelectItem value="Uganda">Uganda</SelectItem>
                  <SelectItem value="Rwanda">Rwanda</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="currency">Default Currency</Label>
              <Select value={settingsData.default_currency} onValueChange={(value) => 
                setSettingsData({ ...settingsData, default_currency: value })
              }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="KES">KES - Kenyan Shilling</SelectItem>
                  <SelectItem value="USD">USD - US Dollar</SelectItem>
                  <SelectItem value="EUR">EUR - Euro</SelectItem>
                  <SelectItem value="GBP">GBP - British Pound</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Default Regions</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {settingsData.default_regions.map((region, index) => (
                  <Badge key={index} variant="outline">
                    {region}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        );
        
      case 'email':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="welcome_subject">Welcome Email Subject</Label>
              <Input
                id="welcome_subject"
                value={emailData.welcome_subject}
                onChange={(e) => setEmailData({ ...emailData, welcome_subject: e.target.value })}
              />
            </div>
            
            <div>
              <Label htmlFor="welcome_content">Welcome Email Content</Label>
              <Textarea
                id="welcome_content"
                value={emailData.welcome_content}
                onChange={(e) => setEmailData({ ...emailData, welcome_content: e.target.value })}
                rows={4}
              />
            </div>
            
            <div>
              <Label htmlFor="quote_subject">Quote Email Subject</Label>
              <Input
                id="quote_subject"
                value={emailData.quote_subject}
                onChange={(e) => setEmailData({ ...emailData, quote_subject: e.target.value })}
              />
            </div>
            
            <div>
              <Label htmlFor="quote_content">Quote Email Content</Label>
              <Textarea
                id="quote_content"
                value={emailData.quote_content}
                onChange={(e) => setEmailData({ ...emailData, quote_content: e.target.value })}
                rows={4}
              />
            </div>
          </div>
        );
        
      case 'team':
        return (
          <div className="space-y-4">
            <div className="text-center">
              <Users className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold">Team Setup Complete!</h3>
              <p className="text-gray-600">
                You can invite team members later from the Team Management page.
              </p>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Organization Setup</CardTitle>
          <CardDescription>
            Complete these steps to set up your organization
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    index === currentStep 
                      ? 'border-blue-500 bg-blue-500 text-white'
                      : step.completed
                      ? 'border-green-500 bg-green-500 text-white'
                      : 'border-gray-300 text-gray-500'
                  }`}>
                    {step.completed ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      step.icon
                    )}
                  </div>
                  
                  {index < steps.length - 1 && (
                    <div className={`w-20 h-0.5 ${
                      step.completed ? 'bg-green-500' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            
            <div className="mt-4">
              <h3 className="font-semibold">{steps[currentStep].title}</h3>
              <p className="text-gray-600">{steps[currentStep].description}</p>
            </div>
          </div>
          
          <Separator className="mb-6" />
          
          {/* Step Content */}
          <div className="mb-8">
            {renderStepContent()}
          </div>
          
          {/* Navigation */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
            >
              Previous
            </Button>
            
            <Button
              onClick={handleStepAction}
              disabled={loading}
            >
              {loading ? 'Processing...' : currentStep === steps.length - 1 ? 'Complete' : 'Next'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrganizationSetupWizard;
