import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Switch } from "./ui/switch";
import { Separator } from "./ui/separator";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { toast } from "sonner";
import { useRole } from "../contexts/RoleContext";

interface AdminSettingsProps {
  className?: string;
}

const AdminSettings: React.FC<AdminSettingsProps> = ({ className }) => {
  const { permissions, role } = useRole();

  const handleSaveSettings = () => {
    toast.success("Settings saved successfully");
  };

  // Check if it's system_admin role - only system admins should access this
  const canAccessAdmin = role === 'system_admin';

  if (!canAccessAdmin) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-lg font-semibold mb-2">Admin Access Required</h2>
        <p className="text-gray-500">You don't have permission to access system settings.</p>
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>System Administration</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="users">
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="system">Platform Settings</TabsTrigger>
            <TabsTrigger value="billing">Billing & Payments</TabsTrigger>
          </TabsList>
          
          <TabsContent value="users" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">User Management</h3>
              <Button>+ Add New User</Button>
            </div>
            
            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium">Jane Cooper</h4>
                  <p className="text-sm text-gray-500">jane.cooper@example.com</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge>Travel Agent</Badge>
                  <Button variant="outline" size="sm">Edit</Button>
                </div>
              </div>
              
              <Separator />
              
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium">Robert Fox</h4>
                  <p className="text-sm text-gray-500">robert.fox@example.com</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge>Tour Operator</Badge>
                  <Button variant="outline" size="sm">Edit</Button>
                </div>
              </div>
              
              <Separator />
              
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium">Wade Warren</h4>
                  <p className="text-sm text-gray-500">wade.warren@example.com</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge>Admin</Badge>
                  <Button variant="outline" size="sm">Edit</Button>
                </div>
              </div>
            </div>
            
            <div className="mt-4">
              <h3 className="text-lg font-medium mb-4">Role Permissions</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-medium">Travel Agent</h4>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="agent-quotes">Create/Edit Quotes</Label>
                    <Switch id="agent-quotes" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="agent-bookings">Manage Bookings</Label>
                    <Switch id="agent-bookings" defaultChecked />
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-medium">Tour Operator</h4>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="operator-assign">Assign Inquiries</Label>
                    <Switch id="operator-assign" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="operator-metrics">View Team Metrics</Label>
                    <Switch id="operator-metrics" defaultChecked />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-4">
              <Button onClick={handleSaveSettings}>Save Changes</Button>
            </div>
          </TabsContent>

          <TabsContent value="system" className="space-y-4">
            <h3 className="text-lg font-medium">Global Settings</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="system-timezone" className="mb-2 block">Default Timezone</Label>
                <Select defaultValue="Africa/Nairobi">
                  <SelectTrigger id="system-timezone">
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Africa/Nairobi">Nairobi (GMT+3)</SelectItem>
                    <SelectItem value="Africa/Johannesburg">Johannesburg (GMT+2)</SelectItem>
                    <SelectItem value="Europe/London">London (GMT)</SelectItem>
                    <SelectItem value="America/New_York">New York (GMT-5)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="system-language" className="mb-2 block">Default Language</Label>
                <Select defaultValue="en">
                  <SelectTrigger id="system-language">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="sw">Swahili</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <h3 className="text-lg font-medium mt-6">Branding</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="company-name" className="mb-2 block">Company Name</Label>
                <Input id="company-name" defaultValue="TravelFlow360" />
              </div>
              
              <div>
                <Label htmlFor="primary-color" className="mb-2 block">Primary Color</Label>
                <div className="flex gap-2">
                  <Input id="primary-color" defaultValue="#0066cc" />
                  <div className="w-10 h-10 rounded bg-blue-600" />
                </div>
              </div>
            </div>
            
            <div className="mt-4">
              <div className="flex items-center space-x-2">
                <Switch id="white-label" />
                <Label htmlFor="white-label">Enable White Label Mode (Pro and Enterprise only)</Label>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Remove all TravelFlow360 branding from client-facing documents
              </p>
            </div>

            <div className="flex justify-end mt-4">
              <Button onClick={handleSaveSettings}>Save Changes</Button>
            </div>
          </TabsContent>

          <TabsContent value="billing" className="space-y-4">
            <h3 className="text-lg font-medium">Payment Gateways</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="bg-gray-100 p-2 rounded mr-3">
                      <div className="h-6 w-12 bg-gray-400 rounded" />
                    </div>
                    <h4 className="font-medium">M-Pesa</h4>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="mpesa-id" className="mb-1 block text-sm">Business Short Code</Label>
                    <Input id="mpesa-id" placeholder="174379" />
                  </div>
                  <div>
                    <Label htmlFor="mpesa-key" className="mb-1 block text-sm">API Key</Label>
                    <Input id="mpesa-key" type="password" value="••••••••••••••••" />
                  </div>
                </div>
              </div>
              
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="bg-gray-100 p-2 rounded mr-3">
                      <div className="h-6 w-12 bg-blue-500 rounded" />
                    </div>
                    <h4 className="font-medium">Stripe</h4>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="stripe-public" className="mb-1 block text-sm">Public Key</Label>
                    <Input id="stripe-public" placeholder="pk_test_51H..." />
                  </div>
                  <div>
                    <Label htmlFor="stripe-secret" className="mb-1 block text-sm">Secret Key</Label>
                    <Input id="stripe-secret" type="password" value="••••••••••••••••" />
                  </div>
                </div>
              </div>
            </div>

            <h3 className="text-lg font-medium mt-6">Subscription Plans</h3>
            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium">Basic Plan</h4>
                  <p className="text-sm text-gray-500">$29 per user/month</p>
                </div>
                <Button variant="outline" size="sm">Edit</Button>
              </div>
              
              <Separator />
              
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium">Pro Plan</h4>
                  <p className="text-sm text-gray-500">$79 per user/month</p>
                </div>
                <Button variant="outline" size="sm">Edit</Button>
              </div>
              
              <Separator />
              
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium">Enterprise Plan</h4>
                  <p className="text-sm text-gray-500">Custom pricing</p>
                </div>
                <Button variant="outline" size="sm">Edit</Button>
              </div>
            </div>

            <div className="flex justify-end mt-4">
              <Button onClick={handleSaveSettings}>Save Changes</Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AdminSettings;
