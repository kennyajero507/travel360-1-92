
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import GeneralSettings from "../components/settings/GeneralSettings";
import AccountSettings from "../components/settings/AccountSettings";
import SubscriptionSettings from "../components/settings/SubscriptionSettings";
import InvitationManager from "../components/InvitationManager";
import { useAuth } from "../contexts/AuthContext";

const Settings = () => {
  const { userProfile } = useAuth();
  
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account preferences and organization settings.
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
          {userProfile?.role === 'org_owner' && (
            <TabsTrigger value="team">Team</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <GeneralSettings />
        </TabsContent>

        <TabsContent value="account" className="space-y-6">
          <AccountSettings />
        </TabsContent>

        <TabsContent value="subscription" className="space-y-6">
          <SubscriptionSettings />
        </TabsContent>

        {userProfile?.role === 'org_owner' && (
          <TabsContent value="team" className="space-y-6">
            <InvitationManager />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default Settings;
