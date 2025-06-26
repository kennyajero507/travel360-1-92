
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { User, Mail, Calendar, Building } from 'lucide-react';
import { Badge } from '../components/ui/badge';

const Profile = () => {
  const { profile, organization } = useAuth();

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-600 mt-2">Manage your account information and preferences</p>
      </div>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              <CardTitle>Personal Information</CardTitle>
            </div>
            <CardDescription>Your account details and contact information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <User className="h-4 w-4 text-gray-500" />
              <div>
                <p className="font-medium">{profile?.full_name || 'Not set'}</p>
                <p className="text-sm text-gray-600">Full Name</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-gray-500" />
              <div>
                <p className="font-medium">{profile?.email || 'Not set'}</p>
                <p className="text-sm text-gray-600">Email Address</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Badge variant="secondary">{profile?.role || 'No Role'}</Badge>
              <p className="text-sm text-gray-600">Account Role</p>
            </div>
            
            {profile?.created_at && (
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="font-medium">
                    {new Date(profile.created_at).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-600">Member Since</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {organization && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Building className="h-5 w-5 text-green-600" />
                <CardTitle>Organization</CardTitle>
              </div>
              <CardDescription>Your organization details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Building className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="font-medium">{organization.name}</p>
                  <p className="text-sm text-gray-600">Organization Name</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Profile;
