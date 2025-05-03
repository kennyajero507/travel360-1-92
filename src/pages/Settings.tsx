import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { useRole, UserRole } from "../contexts/RoleContext";
import { useCurrency } from "../contexts/CurrencyContext";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../components/ui/select";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Separator } from "../components/ui/separator";
import { Badge } from "../components/ui/badge";
import AdminSettings from "../components/AdminSettings";

const Settings = () => {
  const { role, setRole, tier, setTier, permissions } = useRole();
  const { currency, setCurrency, currencies } = useCurrency();

  const handleRoleChange = (selectedRole: UserRole) => {
    setRole(selectedRole);
    toast.success(`Role changed to ${selectedRole}`);
  };

  const handleTierChange = (selectedTier: string) => {
    setTier(selectedTier as 'basic' | 'pro' | 'enterprise');
    toast.success(`Subscription tier changed to ${selectedTier}`);
  };

  const handleCurrencyChange = (code: string) => {
    const selectedCurrency = currencies.find(c => c.code === code);
    if (selectedCurrency) {
      setCurrency(selectedCurrency);
      toast.success(`Currency changed to ${selectedCurrency.name}`);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-gray-500 mt-2">Manage your account and application preferences</p>
      </div>

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
          {permissions.canAccessSystemSettings && (
            <TabsTrigger value="admin">Administration</TabsTrigger>
          )}
        </TabsList>
        
        <TabsContent value="general" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Currency Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <label className="font-medium">Default Currency</label>
                <Select value={currency.code} onValueChange={handleCurrencyChange}>
                  <SelectTrigger className="w-full md:w-72">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((curr) => (
                      <SelectItem key={curr.code} value={curr.code}>
                        {curr.symbol} - {curr.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-500">
                  This currency will be used as default for all quotes and invoices.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Display Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="font-medium mb-2 block">Date Format</label>
                  <Select defaultValue="MM/DD/YYYY">
                    <SelectTrigger className="w-full md:w-72">
                      <SelectValue placeholder="Select date format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="account" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Role Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <label className="font-medium">Current Role</label>
                <Select value={role} onValueChange={handleRoleChange}>
                  <SelectTrigger className="w-full md:w-72">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="agent">Travel Agent</SelectItem>
                    <SelectItem value="operator">Tour Operator</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-500">
                  Your role determines what actions you can perform in the system.
                </p>

                <div className="mt-4 border rounded p-4">
                  <h3 className="font-medium mb-2">Role Permissions:</h3>
                  <ul className="space-y-1 text-sm">
                    <li><strong>Travel Agent:</strong> Create/edit quotes for assigned inquiries.</li>
                    <li><strong>Tour Operator:</strong> Assign inquiries, view team quote metrics.</li>
                    <li><strong>Admin:</strong> Manage subscriptions, billing, and access.</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscription" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Subscription Plan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center">
                  <h3 className="font-medium">Current Plan:</h3>
                  <Badge variant="outline" className="ml-2">
                    {tier.charAt(0).toUpperCase() + tier.slice(1)}
                  </Badge>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <Card className={`border ${tier === 'basic' ? 'border-primary' : 'border-border'} h-full`}>
                    <CardHeader>
                      <CardTitle className="flex justify-between">
                        Basic
                        {tier === 'basic' && <Badge>Current</Badge>}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="text-2xl font-bold">$29<span className="text-sm font-normal">/month</span></div>
                        <ul className="space-y-2 text-sm">
                          <li>✓ 500 quotes/month</li>
                          <li>✓ Basic templates</li>
                          <li>✓ Single user</li>
                        </ul>
                        <Button 
                          className="w-full" 
                          variant={tier === 'basic' ? 'outline' : 'default'}
                          onClick={() => handleTierChange('basic')}
                        >
                          {tier === 'basic' ? 'Current Plan' : 'Select Plan'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className={`border ${tier === 'pro' ? 'border-primary' : 'border-border'} h-full`}>
                    <CardHeader>
                      <CardTitle className="flex justify-between">
                        Pro
                        {tier === 'pro' && <Badge>Current</Badge>}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="text-2xl font-bold">$79<span className="text-sm font-normal">/month</span></div>
                        <ul className="space-y-2 text-sm">
                          <li>✓ 10,000 quotes/month</li>
                          <li>✓ Premium branding</li>
                          <li>✓ Up to 5 users</li>
                          <li>✓ API access</li>
                        </ul>
                        <Button 
                          className="w-full" 
                          variant={tier === 'pro' ? 'outline' : 'default'}
                          onClick={() => handleTierChange('pro')}
                        >
                          {tier === 'pro' ? 'Current Plan' : 'Select Plan'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className={`border ${tier === 'enterprise' ? 'border-primary' : 'border-border'} h-full`}>
                    <CardHeader>
                      <CardTitle className="flex justify-between">
                        Enterprise
                        {tier === 'enterprise' && <Badge>Current</Badge>}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="text-2xl font-bold">Custom</div>
                        <ul className="space-y-2 text-sm">
                          <li>✓ Unlimited quotes</li>
                          <li>✓ Premium branding</li>
                          <li>✓ Unlimited users</li>
                          <li>✓ API access</li>
                          <li>✓ Dedicated support</li>
                          <li>✓ Custom integrations</li>
                        </ul>
                        <Button 
                          className="w-full" 
                          variant={tier === 'enterprise' ? 'outline' : 'default'}
                          onClick={() => handleTierChange('enterprise')}
                        >
                          {tier === 'enterprise' ? 'Current Plan' : 'Select Plan'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {permissions.canAccessSystemSettings && (
          <TabsContent value="admin" className="space-y-4 mt-4">
            <AdminSettings />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default Settings;
