import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Upload, Image as ImageIcon, Trash2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "../ui/alert";
import { toast } from "sonner";
import { supabase } from "../../integrations/supabase/client";
import { useAuth } from "../../contexts/AuthContext";
import { errorHandler } from "../../services/errorHandlingService";

interface OrganizationSettings {
  logo_url?: string;
  company_name?: string;
  tagline?: string;
  name?: string;
}

export const LogoSettings = () => {
  const { profile } = useAuth();
  const [settings, setSettings] = useState<OrganizationSettings>({});
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loadingSettings, setLoadingSettings] = useState(true);

  useEffect(() => {
    loadOrganizationSettings();
  }, [profile?.org_id]);

  const loadOrganizationSettings = async () => {
    if (!profile?.org_id) {
      setLoadingSettings(false);
      return;
    }

    try {
      setLoadingSettings(true);
      // Only fetch organization name for now
      const { data, error } = await supabase
        .from('organizations')
        .select('name')
        .eq('id', profile.org_id)
        .single();

      if (error) {
        console.error('Error loading organization settings:', error);
        errorHandler.handleError(error, 'LogoSettings.loadOrganizationSettings');
        setSettings({});
        return;
      }
      setSettings(data || {});
    } catch (error) {
      console.error('Error in loadOrganizationSettings:', error);
      errorHandler.handleError(error, 'LogoSettings.loadOrganizationSettings');
      setSettings({});
    } finally {
      setLoadingSettings(false);
    }
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !profile?.org_id) {
      toast.error('Please select a file and ensure you are logged in');
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a valid image file (JPEG, PNG, GIF, WebP, or SVG)');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5242880) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile.org_id}/logo-${Date.now()}.${fileExt}`;

      console.log('Uploading file:', fileName);

      const { error: uploadError } = await supabase.storage
        .from('organization-logos')
        .upload(fileName, file, { 
          upsert: true,
          contentType: file.type
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        errorHandler.handleError(uploadError, 'LogoSettings.handleLogoUpload');
        return;
      }

      const { data } = supabase.storage
        .from('organization-logos')
        .getPublicUrl(fileName);

      const newLogoUrl = data.publicUrl;
      console.log('Generated public URL:', newLogoUrl);

      // Update organization settings
      const { error: updateError } = await supabase
        .from('organizations')
        .update({  } as any)
        .eq('id', profile.org_id);

      if (updateError) {
        console.error('Update error:', updateError);
        errorHandler.handleError(updateError, 'LogoSettings.handleLogoUpload');
        return;
      }

      setSettings(prev => ({ ...prev, logo_url: newLogoUrl }));
      toast.success('Logo uploaded successfully');
    } catch (error) {
      console.error('Error uploading logo:', error);
      errorHandler.handleError(error, 'LogoSettings.handleLogoUpload');
    } finally {
      setUploading(false);
      // Reset the input
      event.target.value = '';
    }
  };

  const handleRemoveLogo = async () => {
    if (!profile?.org_id) return;

    setLoading(true);
    try {
      // Remove from storage if exists
      if (settings.logo_url) {
        const fileName = settings.logo_url.split('/').pop();
        if (fileName) {
          await supabase.storage
            .from('organization-logos')
            .remove([`${profile.org_id}/${fileName}`]);
        }
      }

      const { error } = await supabase
        .from('organizations')
        .update({ } as any)
        .eq('id', profile.org_id);

      if (error) {
        console.error('Error removing logo:', error);
        errorHandler.handleError(error, 'LogoSettings.handleRemoveLogo');
        return;
      }

      setSettings(prev => ({ ...prev, logo_url: undefined }));
      toast.success('Logo removed successfully');
    } catch (error) {
      console.error('Error in handleRemoveLogo:', error);
      errorHandler.handleError(error, 'LogoSettings.handleRemoveLogo');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!profile?.org_id) {
      toast.error('Organization information missing');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('organizations')
        .update({
        } as any)
        .eq('id', profile.org_id);

      if (error) {
        console.error('Error saving settings:', error);
        errorHandler.handleError(error, 'LogoSettings.handleSaveSettings');
        return;
      }

      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Error in handleSaveSettings:', error);
      errorHandler.handleError(error, 'LogoSettings.handleSaveSettings');
    } finally {
      setLoading(false);
    }
  };

  if (loadingSettings) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
            <span className="ml-2">Loading settings...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!profile?.org_id) {
    return (
      <Card>
        <CardContent className="p-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You need to be part of an organization to manage branding settings.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Organization Info
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="py-4">
          <p className="text-lg font-bold">{settings.name ?? "No organization name found"}</p>
          <p className="text-sm text-gray-500">Branding and logo management coming soon.</p>
        </div>
      </CardContent>
    </Card>
  );
};
