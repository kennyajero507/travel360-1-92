
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Building, Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';

const OrganizationSetup = () => {
  const { createOrganization, userProfile, refreshProfile } = useAuth();
  const [organizationName, setOrganizationName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!organizationName.trim()) {
      setError("Organization name is required");
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      console.log('[OrgSetup] Creating organization:', organizationName.trim());
      
      const success = await createOrganization(organizationName.trim());
      
      if (success) {
        console.log('[OrgSetup] Organization created successfully');
        
        // Refresh profile to get updated organization info
        setTimeout(async () => {
          await refreshProfile();
        }, 1000);
      } else {
        setError("Failed to create organization. Please try again.");
      }
    } catch (error) {
      console.error('[OrgSetup] Error creating organization:', error);
      setError("An error occurred while creating the organization. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Don't show if user already has an organization
  if (userProfile?.org_id) {
    console.log('[OrgSetup] User already has organization, not showing setup');
    return null;
  }

  // Only show for org_owner role
  if (userProfile?.role !== 'org_owner') {
    console.log('[OrgSetup] User is not org_owner, not showing setup');
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mb-4">
            <Building className="w-6 h-6 text-teal-600" />
          </div>
          <CardTitle className="text-2xl">Setup Your Organization</CardTitle>
          <p className="text-slate-600">
            Create your organization to start managing your travel business
          </p>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="organizationName">Organization Name</Label>
              <Input
                id="organizationName"
                type="text"
                placeholder="e.g., Acme Travel Agency"
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
                required
                disabled={loading}
              />
              <p className="text-xs text-gray-500">
                This will be the name of your travel business in TravelFlow360
              </p>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-md border border-blue-200 text-sm">
              <p className="font-semibold text-blue-700">What happens next:</p>
              <ul className="list-disc ml-5 mt-2 text-blue-700">
                <li>2-week free trial automatically included</li>
                <li>Access to your organization dashboard</li>
                <li>Ability to invite team members</li>
                <li>Manage hotels and create quotes</li>
              </ul>
            </div>
            
            <Button
              type="submit"
              className="w-full bg-teal-600 hover:bg-teal-700"
              disabled={loading || !organizationName.trim()}
            >
              {loading ? (
                <div className="flex items-center">
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Organization...
                </div>
              ) : (
                'Create Organization'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrganizationSetup;
