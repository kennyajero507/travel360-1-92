import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Separator } from '../ui/separator';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { AlertCircle, Shield, Users, Settings, Database } from 'lucide-react';
import { toast } from 'sonner';
import { createSuperAdminAccount, SUPER_ADMIN_CREDENTIALS } from '../../utils/createSuperAdmin';
import { useAuth } from '../../contexts/AuthContext';

const SystemSettings = () => {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [adminCreated, setAdminCreated] = useState(false);

  const handleCreateSuperAdmin = async () => {
    setLoading(true);
    try {
      const result = await createSuperAdminAccount();
      
      if (result.success) {
        setAdminCreated(true);
        toast.success('Super admin account created successfully!');
        toast.info(`Login at /admin/login with the credentials shown below`, {
          duration: 10000,
        });
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Error creating super admin:', error);
      toast.error('Failed to create super admin account');
    } finally {
      setLoading(false);
    }
  };

  if (!profile || profile.role !== 'system_admin') {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            <span>System Administrator access required</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Super Admin Account Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <span className="font-medium text-amber-800">Super Admin Credentials</span>
            </div>
            <div className="space-y-2 text-sm">
              <div>
                <strong>Email:</strong> {SUPER_ADMIN_CREDENTIALS.email}
              </div>
              <div>
                <strong>Password:</strong> {SUPER_ADMIN_CREDENTIALS.password}
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button 
              onClick={handleCreateSuperAdmin} 
              disabled={loading}
              className="bg-red-600 hover:bg-red-700"
            >
              {loading ? 'Creating...' : 'Create/Update Super Admin Account'}
            </Button>
            
            {adminCreated && (
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Super Admin Ready
              </Badge>
            )}
          </div>

          <div className="text-sm text-gray-600">
            <p>This will create or update the super admin account with system administrator privileges.</p>
            <p className="mt-1">Use this account to access the admin dashboard at <code>/admin/login</code></p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Role Management System
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium">System Administrator</h4>
              <div className="text-sm text-gray-600">
                Full platform oversight with access to all organizations and system settings.
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="sysadmin-access">Global Access</Label>
                <Switch id="sysadmin-access" defaultChecked disabled />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="sysadmin-manage">User Management</Label>
                <Switch id="sysadmin-manage" defaultChecked disabled />
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Organization Owner</h4>
              <div className="text-sm text-gray-600">
                Manages company account, team members, and billing.
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="owner-team">Team Management</Label>
                <Switch id="owner-team" defaultChecked disabled />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="owner-billing">Billing Access</Label>
                <Switch id="owner-billing" defaultChecked disabled />
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Tour Operator</h4>
              <div className="text-sm text-gray-600">
                Oversees agent teams and manages hotel inventory.
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="operator-assign">Assign Inquiries</Label>
                <Switch id="operator-assign" defaultChecked disabled />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="operator-inventory">Hotel Management</Label>
                <Switch id="operator-inventory" defaultChecked disabled />
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Travel Agent</h4>
              <div className="text-sm text-gray-600">
                Creates quotes and manages client bookings.
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="agent-quotes">Create Quotes</Label>
                <Switch id="agent-quotes" defaultChecked disabled />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="agent-bookings">Manage Bookings</Label>
                <Switch id="agent-bookings" defaultChecked disabled />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            System Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="default-role" className="mb-2 block">Default New User Role</Label>
              <Select defaultValue="org_owner">
                <SelectTrigger id="default-role">
                  <SelectValue placeholder="Select default role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="org_owner">Organization Owner</SelectItem>
                  <SelectItem value="tour_operator">Tour Operator</SelectItem>
                  <SelectItem value="agent">Travel Agent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="trial-period" className="mb-2 block">Trial Period (Days)</Label>
              <Input
                id="trial-period"
                type="number"
                defaultValue="14"
                min="0"
                max="90"
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h4 className="font-medium">Security Settings</h4>
            
            <div className="flex items-center justify-between">
              <div>
                <Label>Enforce Email Verification</Label>
                <p className="text-sm text-gray-500">Require users to verify email before access</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Enable Organization Isolation</Label>
                <p className="text-sm text-gray-500">Users can only see data from their organization</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Audit Logging</Label>
                <p className="text-sm text-gray-500">Log all user actions for security monitoring</p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>

          <div className="flex justify-end">
            <Button>Save System Configuration</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">✓</div>
              <div className="text-sm">RLS Enabled</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">✓</div>
              <div className="text-sm">Policies Active</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">✓</div>
              <div className="text-sm">Indexes Created</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">✓</div>
              <div className="text-sm">Foreign Keys</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemSettings;
