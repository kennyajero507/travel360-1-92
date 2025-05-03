
import { useState } from "react";
import { useRole } from "../contexts/RoleContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import GeneralSettings from "../components/settings/GeneralSettings";
import AccountSettings from "../components/settings/AccountSettings";
import SubscriptionSettings from "../components/settings/SubscriptionSettings";
import AdminSettings from "../components/AdminSettings";

const Settings = () => {
  const { role } = useRole();
  
  // Only system admins can access admin settings
  const canAccessAdmin = role === 'system_admin';

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
          {canAccessAdmin && (
            <TabsTrigger value="admin">Administration</TabsTrigger>
          )}
        </TabsList>
        
        <TabsContent value="general" className="space-y-4 mt-4">
          <GeneralSettings />
        </TabsContent>

        <TabsContent value="account" className="space-y-4 mt-4">
          <AccountSettings />
        </TabsContent>

        <TabsContent value="subscription" className="space-y-4 mt-4">
          <SubscriptionSettings />
        </TabsContent>
        
        {canAccessAdmin && (
          <TabsContent value="admin" className="space-y-4 mt-4">
            <AdminSettings />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default Settings;
