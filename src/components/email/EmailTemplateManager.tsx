
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { 
  Mail, Save, Eye, Send, Settings, FileText, 
  Plus, Edit, Trash2, Copy 
} from 'lucide-react';
import { supabase } from '../../integrations/supabase/client';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';

interface EmailTemplate {
  id: string;
  template_type: string;
  subject: string;
  content: string;
  variables: string[];
  created_at: string;
  updated_at: string;
}

interface EmailSettings {
  smtp_host: string;
  smtp_port: number;
  smtp_username: string;
  smtp_password: string;
  from_email: string;
  from_name: string;
}

const EmailTemplateManager = () => {
  const { profile } = useAuth();
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('templates');
  
  const [templateForm, setTemplateForm] = useState({
    template_type: '',
    subject: '',
    content: '',
  });

  const [emailSettings, setEmailSettings] = useState<EmailSettings>({
    smtp_host: '',
    smtp_port: 587,
    smtp_username: '',
    smtp_password: '',
    from_email: '',
    from_name: '',
  });

  const templateTypes = [
    { value: 'welcome', label: 'Welcome Email' },
    { value: 'quote', label: 'Quote Email' },
    { value: 'booking_confirmation', label: 'Booking Confirmation' },
    { value: 'booking_reminder', label: 'Booking Reminder' },
    { value: 'payment_confirmation', label: 'Payment Confirmation' },
    { value: 'voucher', label: 'Travel Voucher' },
  ];

  const commonVariables = [
    '{{organization_name}}',
    '{{client_name}}',
    '{{booking_reference}}',
    '{{quote_number}}',
    '{{travel_dates}}',
    '{{destination}}',
    '{{total_amount}}',
    '{{agent_name}}',
    '{{contact_email}}',
    '{{contact_phone}}',
  ];

  useEffect(() => {
    fetchTemplates();
  }, [profile?.org_id]);

  const fetchTemplates = async () => {
    if (!profile?.org_id) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .eq('org_id', profile.org_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const processedTemplates = data?.map(template => ({
        ...template,
        variables: typeof template.variables === 'string' 
          ? JSON.parse(template.variables) 
          : template.variables || []
      })) || [];
      
      setTemplates(processedTemplates);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast.error('Failed to load email templates');
    } finally {
      setLoading(false);
    }
  };

  const saveTemplate = async () => {
    if (!profile?.org_id || !templateForm.template_type || !templateForm.subject) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    setLoading(true);
    try {
      const templateData = {
        org_id: profile.org_id,
        template_type: templateForm.template_type,
        subject: templateForm.subject,
        content: templateForm.content,
        variables: JSON.stringify(extractVariables(templateForm.content)),
      };

      let result;
      if (selectedTemplate) {
        result = await supabase
          .from('email_templates')
          .update(templateData)
          .eq('id', selectedTemplate.id)
          .select()
          .single();
      } else {
        result = await supabase
          .from('email_templates')
          .insert([templateData])
          .select()
          .single();
      }

      if (result.error) throw result.error;
      
      toast.success(selectedTemplate ? 'Template updated successfully' : 'Template created successfully');
      
      // Reset form
      setTemplateForm({ template_type: '', subject: '', content: '' });
      setSelectedTemplate(null);
      
      // Refresh templates
      await fetchTemplates();
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error('Failed to save template');
    } finally {
      setLoading(false);
    }
  };

  const deleteTemplate = async (templateId: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('email_templates')
        .delete()
        .eq('id', templateId);

      if (error) throw error;
      
      toast.success('Template deleted successfully');
      await fetchTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
      toast.error('Failed to delete template');
    } finally {
      setLoading(false);
    }
  };

  const extractVariables = (content: string): string[] => {
    const regex = /\{\{([^}]+)\}\}/g;
    const matches = [];
    let match;
    
    while ((match = regex.exec(content)) !== null) {
      if (!matches.includes(match[1])) {
        matches.push(match[1]);
      }
    }
    
    return matches;
  };

  const insertVariable = (variable: string) => {
    setTemplateForm({
      ...templateForm,
      content: templateForm.content + variable
    });
  };

  const editTemplate = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setTemplateForm({
      template_type: template.template_type,
      subject: template.subject,
      content: template.content,
    });
    setActiveTab('editor');
  };

  const previewTemplate = (template: EmailTemplate) => {
    // Implementation for template preview
    toast.info('Template preview functionality coming soon');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Email Management</h1>
        <p className="text-gray-600">Manage email templates and SMTP settings</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="editor">Template Editor</TabsTrigger>
          <TabsTrigger value="settings">SMTP Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Email Templates</h2>
            <Button onClick={() => {
              setSelectedTemplate(null);
              setTemplateForm({ template_type: '', subject: '', content: '' });
              setActiveTab('editor');
            }}>
              <Plus className="h-4 w-4 mr-2" />
              New Template
            </Button>
          </div>

          <div className="grid gap-4">
            {templates.map((template) => (
              <Card key={template.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        {templateTypes.find(t => t.value === template.template_type)?.label || template.template_type}
                      </CardTitle>
                      <CardDescription>{template.subject}</CardDescription>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => previewTemplate(template)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => editTemplate(template)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => deleteTemplate(template.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-1">
                      {template.variables.map((variable, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {variable}
                        </Badge>
                      ))}
                    </div>
                    
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {template.content.substring(0, 100)}...
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="editor" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>
                {selectedTemplate ? 'Edit Template' : 'Create New Template'}
              </CardTitle>
              <CardDescription>
                Design your email template with dynamic variables
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="template_type">Template Type</Label>
                <Select 
                  value={templateForm.template_type} 
                  onValueChange={(value) => setTemplateForm({ ...templateForm, template_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select template type" />
                  </SelectTrigger>
                  <SelectContent>
                    {templateTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="subject">Subject Line</Label>
                <Input
                  id="subject"
                  value={templateForm.subject}
                  onChange={(e) => setTemplateForm({ ...templateForm, subject: e.target.value })}
                  placeholder="Enter email subject"
                />
              </div>
              
              <div>
                <Label htmlFor="content">Email Content</Label>
                <Textarea
                  id="content"
                  value={templateForm.content}
                  onChange={(e) => setTemplateForm({ ...templateForm, content: e.target.value })}
                  placeholder="Enter email content with variables like {{client_name}}"
                  rows={12}
                />
              </div>
              
              <div>
                <Label>Available Variables</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {commonVariables.map((variable, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="cursor-pointer hover:bg-blue-50"
                      onClick={() => insertVariable(variable)}
                    >
                      {variable}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Click on a variable to insert it into your template
                </p>
              </div>
              
              <div className="flex gap-2">
                <Button onClick={saveTemplate} disabled={loading}>
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? 'Saving...' : 'Save Template'}
                </Button>
                
                <Button variant="outline" onClick={() => {
                  setTemplateForm({ template_type: '', subject: '', content: '' });
                  setSelectedTemplate(null);
                }}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>SMTP Configuration</CardTitle>
              <CardDescription>
                Configure your email server settings for sending emails
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="smtp_host">SMTP Host</Label>
                  <Input
                    id="smtp_host"
                    value={emailSettings.smtp_host}
                    onChange={(e) => setEmailSettings({ ...emailSettings, smtp_host: e.target.value })}
                    placeholder="smtp.gmail.com"
                  />
                </div>
                
                <div>
                  <Label htmlFor="smtp_port">SMTP Port</Label>
                  <Input
                    id="smtp_port"
                    type="number"
                    value={emailSettings.smtp_port}
                    onChange={(e) => setEmailSettings({ ...emailSettings, smtp_port: parseInt(e.target.value) })}
                    placeholder="587"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="smtp_username">SMTP Username</Label>
                  <Input
                    id="smtp_username"
                    value={emailSettings.smtp_username}
                    onChange={(e) => setEmailSettings({ ...emailSettings, smtp_username: e.target.value })}
                    placeholder="your@email.com"
                  />
                </div>
                
                <div>
                  <Label htmlFor="smtp_password">SMTP Password</Label>
                  <Input
                    id="smtp_password"
                    type="password"
                    value={emailSettings.smtp_password}
                    onChange={(e) => setEmailSettings({ ...emailSettings, smtp_password: e.target.value })}
                    placeholder="Your email password or app password"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="from_email">From Email</Label>
                  <Input
                    id="from_email"
                    value={emailSettings.from_email}
                    onChange={(e) => setEmailSettings({ ...emailSettings, from_email: e.target.value })}
                    placeholder="noreply@yourcompany.com"
                  />
                </div>
                
                <div>
                  <Label htmlFor="from_name">From Name</Label>
                  <Input
                    id="from_name"
                    value={emailSettings.from_name}
                    onChange={(e) => setEmailSettings({ ...emailSettings, from_name: e.target.value })}
                    placeholder="Your Company Name"
                  />
                </div>
              </div>
              
              <Separator />
              
              <div className="flex gap-2">
                <Button>
                  <Save className="h-4 w-4 mr-2" />
                  Save Settings
                </Button>
                
                <Button variant="outline">
                  <Send className="h-4 w-4 mr-2" />
                  Test Connection
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EmailTemplateManager;
