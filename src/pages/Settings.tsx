
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { ProfileSettings } from "../components/settings/ProfileSettings";
import { DestinationManagement } from "../components/settings/DestinationManagement";
import { PackageTemplates } from "../components/settings/PackageTemplates";
import { QuoteSettings } from "../components/settings/QuoteSettings";
import { TransferSettings } from "../components/settings/TransferSettings";
import { BrandingSettings } from "../components/settings/BrandingSettings";
import InvitationManager from "../components/InvitationManager";
import SubscriptionSettings from "../components/settings/SubscriptionSettings";
import { useAuth } from "../contexts/AuthContext";
import { AlertCircle } from "lucide-react";
import { Card, CardContent } from "../components/ui/card";
import { useRLSGuard } from "../hooks/useRLSGuard";

const Settings = () => {
  const { profile, error } = useAuth();
  const { rlsError } = useRLSGuard();

  const isOrgOwner = profile?.role === 'org_owner';
  const isTourOperator = profile?.role === 'tour_operator';
  const isSystemAdmin = profile?.role === 'system_admin';

  // If user's org_id is unset or forbidden by RLS, show a warning
  const orgDataForbidden = (!profile?.org_id && !isSystemAdmin);

  // Check if user can manage business settings
  const canManageBusinessSettings = isOrgOwner || isTourOperator || isSystemAdmin;

  // If user is forbidden by RLS or has critical error
  if (orgDataForbidden || rlsError || error) {
    return (
      <div className="p-8 max-w-xl mx-auto">
        <Card>
          <CardContent className="flex flex-col items-center text-center gap-3 py-8">
            <AlertCircle className="h-8 w-8 text-red-500 mb-1" />
            <span className="font-semibold text-lg text-red-700">
              {rlsError
                ? "Access Denied"
                : "Organization Setup Required"
              }
            </span>
            <p className="text-sm text-gray-600 mb-3">
              {rlsError
                ? rlsError
                : "You must be part of an organization to access these settings. Please contact your administrator, or create a new organization from your account."
              }
            </p>
            {error && (
              <div className="text-xs text-gray-400">System message: {error}</div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

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
          
          {(isOrgOwner || isSystemAdmin) && (
            <TabsTrigger value="branding">Branding</TabsTrigger>
          )}
          
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

        {(isOrgOwner || isSystemAdmin) && (
          <TabsContent value="branding" className="space-y-6">
            <BrandingSettings />
          </TabsContent>
        )}

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

