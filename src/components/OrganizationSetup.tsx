
import React, { useState } from "react";
import { useSimpleAuth } from "../contexts/SimpleAuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import OrganizationForm from "./auth/OrganizationForm";
import { Building, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";

const OrganizationSetup = () => {
  const { profile, loading: authLoading, refreshProfile, createOrganization, error: authError } = useSimpleAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleCreateOrganization = async (organizationName: string) => {
    if (!organizationName.trim()) {
      setError("Organization name is required");
      return;
    }
    
    setError(null);
    setLoading(true);
    
    try {
      console.log('[OrganizationSetup] Creating organization:', organizationName);
      
      const success = await createOrganization(organizationName);
      
      if (success) {
        console.log('[OrganizationSetup] Organization created successfully');
        setSuccess(true);
        
        // Refresh profile to get updated organization info
        await refreshProfile();
        
        // Navigate to dashboard after successful creation
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      } else {
        const errorMsg = authError || "Failed to create organization. Please try again.";
        setError(errorMsg);
      }
    } catch (error: any) {
      console.error('[OrganizationSetup] Error creating organization:', error);
      setError(error.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleSkipForNow = () => {
    // Navigate directly to dashboard without creating organization
    navigate('/dashboard');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Setting up your account...</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-green-800">Organization Created!</CardTitle>
            <CardDescription>
              Your organization has been set up successfully. Redirecting you to the dashboard...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-teal-100 flex items-center justify-center">
            <Building className="h-8 w-8 text-teal-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800">
            Set Up Your Organization
          </CardTitle>
          <CardDescription className="text-gray-600">
            Welcome {profile?.full_name}! Let's create your travel business organization.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {profile?.role !== 'org_owner' && (
            <Alert className="mb-6">
              <Clock className="h-4 w-4" />
              <AlertDescription>
                It looks like you're joining as a {profile?.role}. You can skip this step for now.
              </AlertDescription>
            </Alert>
          )}
          
          {authError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{authError}</AlertDescription>
            </Alert>
          )}
          
          {profile?.role === 'org_owner' && (
            <>
              <OrganizationForm
                onSubmit={handleCreateOrganization}
                loading={loading}
                error={error}
              />
              
              <div className="pt-4 border-t">
                <Button
                  variant="ghost"
                  onClick={handleSkipForNow}
                  className="w-full text-sm text-gray-500 hover:text-gray-700"
                  disabled={loading}
                >
                  Skip for now - I'll set this up later
                </Button>
              </div>
            </>
          )}
          
          {profile?.role !== 'org_owner' && (
            <div className="pt-4">
              <Button
                onClick={handleSkipForNow}
                className="w-full"
                variant="outline"
              >
                Continue to Dashboard
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OrganizationSetup;
