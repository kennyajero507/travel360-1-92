
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { ProfileSettings } from "../components/settings/ProfileSettings";
import { DestinationManagement } from "../components/settings/DestinationManagement";
import { PackageTemplates } from "../components/settings/PackageTemplates";
import { QuoteSettings } from "../components/settings/QuoteSettings";
import { TransferSettings } from "../components/settings/TransferSettings";
import { InvitationManager } from "../components/InvitationManager";
import { SubscriptionSettings } from "../components/settings/SubscriptionSettings";
import { useAuth } from "../contexts/AuthContext";

const Settings = () => {
  const { userProfile } = useAuth();
  
  const isOrgOwner = userProfile?.role === 'org_owner';
  const isTourOperator = userProfile?.role === 'tour_operator';
  const isSystemAdmin = userProfile?.role === 'system_admin';
  
  // Check if user can manage business settings
  const canManageBusinessSettings = isOrgOwner || isTourOperator || isSystemAdmin;
  
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account preferences and system settings.
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          
          {canManageBusinessSettings && (
            <>
              <TabsTrigger value="destinations">Destinations</TabsTrigger>
              <TabsTrigger value="packages">Packages</TabsTrigger>
              <TabsTrigger value="quotes">Quote Settings</TabsTrigger>
            </>
          )}
          
          {isOrgOwner && (
            <>
              <TabsTrigger value="transfers">Transfers</TabsTrigger>
              <TabsTrigger value="team">Team</TabsTrigger>
              <TabsTrigger value="billing">Billing</TabsTrigger>
            </>
          )}
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <ProfileSettings />
        </TabsContent>

        {canManageBusinessSettings && (
          <>
            <TabsContent value="destinations" className="space-y-6">
              <DestinationManagement />
            </TabsContent>

            <TabsContent value="packages" className="space-y-6">
              <PackageTemplates />
            </TabsContent>

            <TabsContent value="quotes" className="space-y-6">
              <QuoteSettings />
            </TabsContent>
          </>
        )}

        {isOrgOwner && (
          <>
            <TabsContent value="transfers" className="space-y-6">
              <TransferSettings />
            </TabsContent>

            <TabsContent value="team" className="space-y-6">
              <InvitationManager />
            </TabsContent>

            <TabsContent value="billing" className="space-y-6">
              <SubscriptionSettings />
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
};

export default Settings;
