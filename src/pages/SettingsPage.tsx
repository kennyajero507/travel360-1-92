import { useState, useEffect } from 'react';
import { useSimpleAuth } from '../contexts/SimpleAuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { Textarea } from '../components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Separator } from '../components/ui/separator';
import { Badge } from '../components/ui/badge';
import { 
  Settings, 
  User, 
  Building, 
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  CreditCard,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Save,
  Upload
} from 'lucide-react';
import { supabase } from '../integrations/supabase/client';
import { toast } from 'sonner';

const SettingsPage = () => {
  const { profile, signOut } = useSimpleAuth();
  const [loading, setLoading] = useState(false);
  const [organizationSettings, setOrganizationSettings] = useState({
    name: '',
    tagline: '',
    primary_color: '#0d9488',
    secondary_color: '#64748b',
    logo_url: '',
    default_country: 'Kenya',
    default_currency: 'KES',
    default_regions: ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret']
  });
  
  const [profileSettings, setProfileSettings] = useState({
    full_name: profile?.full_name || '',
    email: profile?.email || '',
    phone: profile?.phone || '',
    country: 'Kenya',
    currency: profile?.currency || 'USD',
    email_notifications: profile?.email_notifications ?? true,
    sms_notifications: profile?.sms_notifications ?? false
  });

  const [notificationSettings, setNotificationSettings] = useState({
    email_inquiries: true,
    email_quotes: true,
    email_bookings: true,
    email_payments: true,
    sms_urgent: false,
    sms_daily_summary: false,
    push_notifications: true
  });

  const currencies = [
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh' },
    { code: 'TZS', name: 'Tanzanian Shilling', symbol: 'TSh' },
    { code: 'UGX', name: 'Ugandan Shilling', symbol: 'USh' },
    { code: 'RWF', name: 'Rwandan Franc', symbol: 'RF' }
  ];

  const countries = [
    'Kenya', 'Tanzania', 'Uganda', 'Rwanda', 'Ethiopia', 'Botswana', 
    'South Africa', 'Namibia', 'Zambia', 'Zimbabwe', 'United States', 
    'United Kingdom', 'Canada', 'Australia'
  ];

  useEffect(() => {
    fetchOrganizationSettings();
  }, []);

  const fetchOrganizationSettings = async () => {
    if (!profile?.org_id) return;
    
    try {
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', profile.org_id)
        .single();

      if (orgError) throw orgError;

      const { data: settingsData, error: settingsError } = await supabase
        .from('organization_settings')
        .select('*')
        .eq('org_id', profile.org_id)
        .single();

      if (settingsError && settingsError.code !== 'PGRST116') {
        throw settingsError;
      }

      if (orgData) {
        setOrganizationSettings(prev => ({
          ...prev,
          name: orgData.name || '',
          tagline: orgData.tagline || '',
          primary_color: orgData.primary_color || '#0d9488',
          secondary_color: orgData.secondary_color || '#64748b',
          logo_url: orgData.logo_url || ''
        }));
      }

      if (settingsData) {
        setOrganizationSettings(prev => ({
          ...prev,
          default_country: settingsData.default_country || 'Kenya',
          default_currency: settingsData.default_currency || 'KES',
          default_regions: Array.isArray(settingsData.default_regions) 
            ? settingsData.default_regions as string[]
            : ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret']
        }));
      }
    } catch (error: any) {
      console.error('Error fetching organization settings:', error);
      toast.error('Failed to load organization settings');
    }
  };

  const saveProfileSettings = async () => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profileSettings.full_name,
          phone: profileSettings.phone,
          country: profileSettings.country,
          currency: profileSettings.currency,
          email_notifications: profileSettings.email_notifications,
          sms_notifications: profileSettings.sms_notifications
        })
        .eq('id', profile?.id);

      if (error) throw error;
      toast.success('Profile settings updated successfully');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile settings');
    } finally {
      setLoading(false);
    }
  };

  const saveOrganizationSettings = async () => {
    if (!profile?.org_id) {
      toast.error('No organization found');
      return;
    }

    try {
      setLoading(true);
      
      // Update organization table
      const { error: orgError } = await supabase
        .from('organizations')
        .update({
          name: organizationSettings.name,
          tagline: organizationSettings.tagline,
          primary_color: organizationSettings.primary_color,
          secondary_color: organizationSettings.secondary_color,
          logo_url: organizationSettings.logo_url
        })
        .eq('id', profile.org_id);

      if (orgError) throw orgError;

      // Update or insert organization settings
      const { error: settingsError } = await supabase
        .from('organization_settings')
        .upsert({
          org_id: profile.org_id,
          default_country: organizationSettings.default_country,
          default_currency: organizationSettings.default_currency,
          default_regions: organizationSettings.default_regions
        });

      if (settingsError) throw settingsError;

      toast.success('Organization settings updated successfully');
    } catch (error: any) {
      console.error('Error updating organization settings:', error);
      toast.error('Failed to update organization settings');
    } finally {
      setLoading(false);
    }
  };

  const handleRegionChange = (index: number, value: string) => {
    const newRegions = [...organizationSettings.default_regions];
    newRegions[index] = value;
    setOrganizationSettings(prev => ({ ...prev, default_regions: newRegions }));
  };

  const addRegion = () => {
    setOrganizationSettings(prev => ({
      ...prev,
      default_regions: [...prev.default_regions, '']
    }));
  };

  const removeRegion = (index: number) => {
    setOrganizationSettings(prev => ({
      ...prev,
      default_regions: prev.default_regions.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="flex items-center gap-2 mb-8">
        <Settings className="h-8 w-8 text-gray-700" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-2">Manage your account and organization preferences</p>
        </div>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="organization" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Organization
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Appearance
          </TabsTrigger>
          <TabsTrigger value="billing" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Billing
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Settings
              </CardTitle>
              <CardDescription>
                Update your personal information and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    value={profileSettings.full_name}
                    onChange={(e) => setProfileSettings(prev => ({ ...prev, full_name: e.target.value }))}
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileSettings.email}
                    disabled
                    className="bg-gray-50"
                  />
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={profileSettings.phone}
                    onChange={(e) => setProfileSettings(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+254 700 000 000"
                  />
                </div>
                <div>
                  <Label htmlFor="country">Country</Label>
                  <select
                    id="country"
                    value={profileSettings.country}
                    onChange={(e) => setProfileSettings(prev => ({ ...prev, country: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    {countries.map(country => (
                      <option key={country} value={country}>{country}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="currency">Preferred Currency</Label>
                <select
                  id="currency"
                  value={profileSettings.currency}
                  onChange={(e) => setProfileSettings(prev => ({ ...prev, currency: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  {currencies.map(currency => (
                    <option key={currency.code} value={currency.code}>
                      {currency.name} ({currency.symbol})
                    </option>
                  ))}
                </select>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Communication Preferences</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="email_notifications">Email Notifications</Label>
                    <p className="text-sm text-gray-500">Receive notifications via email</p>
                  </div>
                  <Switch
                    id="email_notifications"
                    checked={profileSettings.email_notifications}
                    onCheckedChange={(checked) => setProfileSettings(prev => ({ ...prev, email_notifications: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="sms_notifications">SMS Notifications</Label>
                    <p className="text-sm text-gray-500">Receive urgent notifications via SMS</p>
                  </div>
                  <Switch
                    id="sms_notifications"
                    checked={profileSettings.sms_notifications}
                    onCheckedChange={(checked) => setProfileSettings(prev => ({ ...prev, sms_notifications: checked }))}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={saveProfileSettings} disabled={loading}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Profile Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="organization">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Organization Settings
              </CardTitle>
              <CardDescription>
                Configure your organization's settings and defaults
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="org_name">Organization Name</Label>
                  <Input
                    id="org_name"
                    value={organizationSettings.name}
                    onChange={(e) => setOrganizationSettings(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Your organization name"
                  />
                </div>
                <div>
                  <Label htmlFor="tagline">Tagline</Label>
                  <Input
                    id="tagline"
                    value={organizationSettings.tagline}
                    onChange={(e) => setOrganizationSettings(prev => ({ ...prev, tagline: e.target.value }))}
                    placeholder="Your organization tagline"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="logo_url">Logo URL</Label>
                <div className="flex gap-2">
                  <Input
                    id="logo_url"
                    value={organizationSettings.logo_url}
                    onChange={(e) => setOrganizationSettings(prev => ({ ...prev, logo_url: e.target.value }))}
                    placeholder="https://example.com/logo.png"
                  />
                  <Button variant="outline">
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Default Settings</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="default_country">Default Country</Label>
                    <select
                      id="default_country"
                      value={organizationSettings.default_country}
                      onChange={(e) => setOrganizationSettings(prev => ({ ...prev, default_country: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      {countries.map(country => (
                        <option key={country} value={country}>{country}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="default_currency">Default Currency</Label>
                    <select
                      id="default_currency"
                      value={organizationSettings.default_currency}
                      onChange={(e) => setOrganizationSettings(prev => ({ ...prev, default_currency: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      {currencies.map(currency => (
                        <option key={currency.code} value={currency.code}>
                          {currency.name} ({currency.symbol})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <Label>Default Regions</Label>
                  <div className="space-y-2 mt-2">
                    {organizationSettings.default_regions.map((region, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={region}
                          onChange={(e) => handleRegionChange(index, e.target.value)}
                          placeholder="Region name"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeRegion(index)}
                          disabled={organizationSettings.default_regions.length <= 1}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                    <Button variant="outline" onClick={addRegion}>
                      Add Region
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={saveOrganizationSettings} disabled={loading}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Organization Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Settings
              </CardTitle>
              <CardDescription>
                Choose what notifications you want to receive
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Email Notifications</h3>
                <div className="space-y-3">
                  {[
                    { key: 'email_inquiries', label: 'New Inquiries', description: 'Get notified when new inquiries are received' },
                    { key: 'email_quotes', label: 'Quote Updates', description: 'Get notified about quote status changes' },
                    { key: 'email_bookings', label: 'Booking Confirmations', description: 'Get notified when bookings are confirmed' },
                    { key: 'email_payments', label: 'Payment Notifications', description: 'Get notified about payment updates' }
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between">
                      <div>
                        <Label>{item.label}</Label>
                        <p className="text-sm text-gray-500">{item.description}</p>
                      </div>
                      <Switch
                        checked={notificationSettings[item.key as keyof typeof notificationSettings]}
                        onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, [item.key]: checked }))}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">SMS Notifications</h3>
                <div className="space-y-3">
                  {[
                    { key: 'sms_urgent', label: 'Urgent Alerts', description: 'Receive urgent notifications via SMS' },
                    { key: 'sms_daily_summary', label: 'Daily Summary', description: 'Daily summary of activities via SMS' }
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between">
                      <div>
                        <Label>{item.label}</Label>
                        <p className="text-sm text-gray-500">{item.description}</p>
                      </div>
                      <Switch
                        checked={notificationSettings[item.key as keyof typeof notificationSettings]}
                        onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, [item.key]: checked }))}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end">
                <Button disabled={loading}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Notification Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Appearance Settings
              </CardTitle>
              <CardDescription>
                Customize the look and feel of your organization's interface
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="primary_color">Primary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="primary_color"
                      type="color"
                      value={organizationSettings.primary_color}
                      onChange={(e) => setOrganizationSettings(prev => ({ ...prev, primary_color: e.target.value }))}
                      className="w-16 h-10"
                    />
                    <Input
                      value={organizationSettings.primary_color}
                      onChange={(e) => setOrganizationSettings(prev => ({ ...prev, primary_color: e.target.value }))}
                      placeholder="#0d9488"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="secondary_color">Secondary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="secondary_color"
                      type="color"
                      value={organizationSettings.secondary_color}
                      onChange={(e) => setOrganizationSettings(prev => ({ ...prev, secondary_color: e.target.value }))}
                      className="w-16 h-10"
                    />
                    <Input
                      value={organizationSettings.secondary_color}
                      onChange={(e) => setOrganizationSettings(prev => ({ ...prev, secondary_color: e.target.value }))}
                      placeholder="#64748b"
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 border rounded-lg bg-gray-50">
                <h4 className="font-medium mb-2">Preview</h4>
                <div className="flex gap-2">
                  <div 
                    className="w-8 h-8 rounded"
                    style={{ backgroundColor: organizationSettings.primary_color }}
                  ></div>
                  <div 
                    className="w-8 h-8 rounded"
                    style={{ backgroundColor: organizationSettings.secondary_color }}
                  ></div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={saveOrganizationSettings} disabled={loading}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Appearance Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Billing & Subscription
              </CardTitle>
              <CardDescription>
                Manage your subscription and billing information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">Billing management coming soon</p>
                <Badge>Trial Account</Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Settings
              </CardTitle>
              <CardDescription>
                Manage your account security and privacy settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Password</h3>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Change Password</p>
                    <p className="text-sm text-gray-500">Update your account password</p>
                  </div>
                  <Button variant="outline">Change Password</Button>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Account Actions</h3>
                <div className="flex items-center justify-between p-4 border rounded-lg border-red-200 bg-red-50">
                  <div>
                    <p className="font-medium text-red-800">Sign Out</p>
                    <p className="text-sm text-red-600">Sign out from your account</p>
                  </div>
                  <Button variant="destructive" onClick={signOut}>
                    Sign Out
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;