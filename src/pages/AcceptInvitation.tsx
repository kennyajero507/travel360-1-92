
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { Users, Building2 } from 'lucide-react';

const AcceptInvitation = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { acceptInvitation, session, userProfile, loading } = useAuth();
  
  const [accepting, setAccepting] = useState(false);
  const [invitationData, setInvitationData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setError('Invalid invitation link');
      return;
    }

    // If user is not logged in, redirect to login with invitation token
    if (!session) {
      navigate(`/login?invitation=${token}`);
      return;
    }

    // If user has profile and is already part of an org, redirect to dashboard
    if (userProfile && userProfile.org_id) {
      toast.info('You are already part of an organization');
      navigate('/dashboard');
      return;
    }
  }, [token, session, userProfile, navigate]);

  const handleAcceptInvitation = async () => {
    if (!token) {
      setError('Invalid invitation token');
      return;
    }

    setAccepting(true);
    setError(null);

    try {
      const success = await acceptInvitation(token);
      
      if (success) {
        toast.success('Welcome to the team!');
        navigate('/dashboard');
      } else {
        setError('Failed to accept invitation. The invitation may be invalid or expired.');
      }
    } catch (error) {
      console.error('Error accepting invitation:', error);
      setError('An error occurred while accepting the invitation');
    } finally {
      setAccepting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading invitation...</p>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-red-600">Invalid Invitation</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-gray-600 mb-4">
              This invitation link is invalid or malformed.
            </p>
            <Button 
              onClick={() => navigate('/login')} 
              className="w-full"
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-fit mb-4">
            <div className="bg-teal-100 p-3 rounded-full">
              <Users className="h-8 w-8 text-teal-600" />
            </div>
          </div>
          <CardTitle>Join Organization</CardTitle>
          <p className="text-gray-600">
            You've been invited to join a travel organization
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="text-center">
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <Building2 className="h-6 w-6 mx-auto mb-2 text-gray-600" />
              <p className="text-sm text-gray-600">
                Click below to accept the invitation and join your team
              </p>
            </div>

            <Button
              onClick={handleAcceptInvitation}
              disabled={accepting}
              className="w-full bg-teal-600 hover:bg-teal-700"
            >
              {accepting ? 'Accepting...' : 'Accept Invitation'}
            </Button>
          </div>

          <div className="text-center pt-4 border-t">
            <p className="text-sm text-gray-500">
              Don't want to accept?{' '}
              <button
                onClick={() => navigate('/login')}
                className="text-teal-600 hover:underline"
              >
                Go to Login
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AcceptInvitation;
