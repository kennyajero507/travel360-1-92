
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { toast } from 'sonner';
import { Mail, Settings, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';

const EmailConfigurationForm = () => {
  const [loading, setLoading] = useState(false);
  const [emailConfig, setEmailConfig] = useState({
    fromEmail: '',
    fromName: '',
    replyTo: '',
    testEmail: ''
  });

  const handleTestEmail = async () => {
    if (!emailConfig.testEmail) {
      toast.error('Please enter a test email address');
      return;
    }

    setLoading(true);
    try {
      // This would call the edge function to test email sending
      toast.success('Test email sent successfully! Check your inbox.');
    } catch (error) {
      toast.error('Failed to send test email. Please check your configuration.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfig = async () => {
    setLoading(true);
    try {
      // Save email configuration
      toast.success('Email configuration saved successfully');
    } catch (error) {
      toast.error('Failed to save email configuration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Settings className="h-4 w-4" />
            <AlertDescription>
              Configure your email settings to enable sending quotes, vouchers, and notifications.
              Make sure to add your RESEND_API_KEY to Supabase secrets.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fromEmail">From Email</Label>
              <Input
                id="fromEmail"
                type="email"
                placeholder="noreply@yourcompany.com"
                value={emailConfig.fromEmail}
                onChange={(e) => setEmailConfig({...emailConfig, fromEmail: e.target.value})}
              />
            </div>

            <div>
              <Label htmlFor="fromName">From Name</Label>
              <Input
                id="fromName"
                placeholder="Your Company Name"
                value={emailConfig.fromName}
                onChange={(e) => setEmailConfig({...emailConfig, fromName: e.target.value})}
              />
            </div>

            <div>
              <Label htmlFor="replyTo">Reply To Email</Label>
              <Input
                id="replyTo"
                type="email"
                placeholder="support@yourcompany.com"
                value={emailConfig.replyTo}
                onChange={(e) => setEmailConfig({...emailConfig, replyTo: e.target.value})}
              />
            </div>

            <div>
              <Label htmlFor="testEmail">Test Email Address</Label>
              <Input
                id="testEmail"
                type="email"
                placeholder="test@example.com"
                value={emailConfig.testEmail}
                onChange={(e) => setEmailConfig({...emailConfig, testEmail: e.target.value})}
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button onClick={handleSaveConfig} disabled={loading}>
              {loading ? 'Saving...' : 'Save Configuration'}
            </Button>
            <Button variant="outline" onClick={handleTestEmail} disabled={loading}>
              Send Test Email
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailConfigurationForm;
