
import { useState } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Separator } from "../components/ui/separator";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Switch } from "../components/ui/switch";
import { toast } from "sonner";

const Settings = () => {
  // Company profile state
  const [companyProfile, setCompanyProfile] = useState({
    name: "TravelFlow360",
    email: "contact@travelflow360.com",
    phone: "+1 (555) 123-4567",
    address: "123 Travel Street, Suite 200, New York, NY 10001",
    website: "https://travelflow360.com",
    logo: "/logo.svg"
  });

  // Quote settings state
  const [quoteSettings, setQuoteSettings] = useState({
    defaultMarkupType: "percentage",
    defaultMarkupValue: 15,
    defaultCurrency: "USD",
    validityPeriod: 30,
    termsAndConditions: "Standard terms apply. Quote valid for 30 days. 50% deposit required to confirm booking."
  });

  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    quoteCreated: true,
    quoteViewed: true,
    quoteAccepted: true,
    quoteExpiringSoon: true,
    dailySummary: false
  });

  // Handle company profile form submission
  const handleCompanyProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would update the profile via an API call
    console.log("Updated company profile:", companyProfile);
    toast.success("Company profile updated successfully!");
  };

  // Handle quote settings form submission
  const handleQuoteSettingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would update the settings via an API call
    console.log("Updated quote settings:", quoteSettings);
    toast.success("Quote settings updated successfully!");
  };

  // Handle notification settings form submission
  const handleNotificationSettingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would update the notification settings via an API call
    console.log("Updated notification settings:", notificationSettings);
    toast.success("Notification settings updated successfully!");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-gray-500 mt-2">Manage your account and system preferences</p>
      </div>

      <Tabs defaultValue="company" className="space-y-6">
        <TabsList>
          <TabsTrigger value="company">Company Profile</TabsTrigger>
          <TabsTrigger value="quotes">Quote Settings</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="users">Users & Permissions</TabsTrigger>
        </TabsList>

        {/* Company Profile Tab */}
        <TabsContent value="company" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Company Profile</CardTitle>
              <CardDescription>
                Manage your company information that appears on quotes and client communications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCompanyProfileSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="company-name">Company Name</Label>
                    <Input
                      id="company-name"
                      value={companyProfile.name}
                      onChange={(e) => setCompanyProfile({...companyProfile, name: e.target.value})}
                      placeholder="Enter company name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="company-email">Email Address</Label>
                    <Input
                      id="company-email"
                      type="email"
                      value={companyProfile.email}
                      onChange={(e) => setCompanyProfile({...companyProfile, email: e.target.value})}
                      placeholder="Enter email address"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="company-phone">Phone Number</Label>
                    <Input
                      id="company-phone"
                      value={companyProfile.phone}
                      onChange={(e) => setCompanyProfile({...companyProfile, phone: e.target.value})}
                      placeholder="Enter phone number"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="company-website">Website</Label>
                    <Input
                      id="company-website"
                      value={companyProfile.website}
                      onChange={(e) => setCompanyProfile({...companyProfile, website: e.target.value})}
                      placeholder="https://example.com"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="company-address">Address</Label>
                    <Input
                      id="company-address"
                      value={companyProfile.address}
                      onChange={(e) => setCompanyProfile({...companyProfile, address: e.target.value})}
                      placeholder="Enter company address"
                    />
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <Label htmlFor="company-logo">Company Logo</Label>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="h-16 w-16 bg-gray-100 rounded-md flex items-center justify-center overflow-hidden">
                      <img 
                        src={companyProfile.logo} 
                        alt="Company Logo" 
                        className="max-h-full max-w-full"
                      />
                    </div>
                    <div>
                      <Input
                        id="company-logo"
                        type="file"
                        className="max-w-sm"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Recommended size: 200x200px. Max file size: 2MB.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button type="submit">Save Company Profile</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Quote Settings Tab */}
        <TabsContent value="quotes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quote Settings</CardTitle>
              <CardDescription>
                Configure default settings for your quotes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleQuoteSettingsSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="default-markup-type">Default Markup Type</Label>
                    <Select
                      value={quoteSettings.defaultMarkupType}
                      onValueChange={(value) => setQuoteSettings({...quoteSettings, defaultMarkupType: value})}
                    >
                      <SelectTrigger id="default-markup-type">
                        <SelectValue placeholder="Select markup type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Percentage (%)</SelectItem>
                        <SelectItem value="fixed">Fixed Amount</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="default-markup-value">
                      Default {quoteSettings.defaultMarkupType === "percentage" ? "Percentage" : "Amount"}
                    </Label>
                    <div className="flex items-center">
                      <Input
                        id="default-markup-value"
                        type="number"
                        min="0"
                        value={quoteSettings.defaultMarkupValue}
                        onChange={(e) => setQuoteSettings({...quoteSettings, defaultMarkupValue: parseFloat(e.target.value)})}
                        required
                      />
                      <span className="ml-2">
                        {quoteSettings.defaultMarkupType === "percentage" ? "%" : "$"}
                      </span>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="default-currency">Default Currency</Label>
                    <Select
                      value={quoteSettings.defaultCurrency}
                      onValueChange={(value) => setQuoteSettings({...quoteSettings, defaultCurrency: value})}
                    >
                      <SelectTrigger id="default-currency">
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD - US Dollar</SelectItem>
                        <SelectItem value="EUR">EUR - Euro</SelectItem>
                        <SelectItem value="GBP">GBP - British Pound</SelectItem>
                        <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                        <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="validity-period">Quote Validity Period (Days)</Label>
                    <Input
                      id="validity-period"
                      type="number"
                      min="1"
                      value={quoteSettings.validityPeriod}
                      onChange={(e) => setQuoteSettings({...quoteSettings, validityPeriod: parseInt(e.target.value)})}
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="terms-conditions">Default Terms & Conditions</Label>
                    <textarea
                      id="terms-conditions"
                      className="w-full min-h-[100px] p-3 border rounded-md mt-2"
                      value={quoteSettings.termsAndConditions}
                      onChange={(e) => setQuoteSettings({...quoteSettings, termsAndConditions: e.target.value})}
                      placeholder="Enter default terms and conditions for quotes"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button type="submit">Save Quote Settings</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Configure how and when you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleNotificationSettingsSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="email-notifications" className="text-base">Email Notifications</Label>
                      <p className="text-sm text-gray-500">Enable or disable all email notifications</p>
                    </div>
                    <Switch
                      id="email-notifications"
                      checked={notificationSettings.emailNotifications}
                      onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, emailNotifications: checked})}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Notification Events</h3>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="quote-created">Quote Created</Label>
                      <Switch
                        id="quote-created"
                        checked={notificationSettings.quoteCreated}
                        onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, quoteCreated: checked})}
                        disabled={!notificationSettings.emailNotifications}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="quote-viewed">Quote Viewed by Client</Label>
                      <Switch
                        id="quote-viewed"
                        checked={notificationSettings.quoteViewed}
                        onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, quoteViewed: checked})}
                        disabled={!notificationSettings.emailNotifications}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="quote-accepted">Quote Accepted</Label>
                      <Switch
                        id="quote-accepted"
                        checked={notificationSettings.quoteAccepted}
                        onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, quoteAccepted: checked})}
                        disabled={!notificationSettings.emailNotifications}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="quote-expiring">Quote Expiring Soon</Label>
                      <Switch
                        id="quote-expiring"
                        checked={notificationSettings.quoteExpiringSoon}
                        onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, quoteExpiringSoon: checked})}
                        disabled={!notificationSettings.emailNotifications}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="daily-summary">Daily Summary Report</Label>
                      <Switch
                        id="daily-summary"
                        checked={notificationSettings.dailySummary}
                        onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, dailySummary: checked})}
                        disabled={!notificationSettings.emailNotifications}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button type="submit">Save Notification Settings</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users & Permissions Tab */}
        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Users & Permissions</CardTitle>
              <CardDescription>
                Manage user accounts and their access levels
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-gray-500">
                  Manage team members and their roles within the application.
                </p>
                
                <div className="border rounded-md p-6 text-center bg-gray-50">
                  <h3 className="text-lg font-medium">User Management</h3>
                  <p className="text-gray-500 mt-2">
                    User management is available on the Professional and Enterprise plans.
                  </p>
                  <Button className="mt-4">Upgrade Plan</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
