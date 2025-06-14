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
      const { data, error } = await supabase
        .from('organizations')
        .select('logo_url, company_name, tagline')
        .eq('id', profile.org_id)
        .single();

      if (error) {
        console.error('Error loading organization settings:', error);
        errorHandler.handleError(error, 'LogoSettings.loadOrganizationSettings');
        return;
      }

      setSettings(data || {});
    } catch (error) {
      console.error('Error in loadOrganizationSettings:', error);
      errorHandler.handleError(error, 'LogoSettings.loadOrganizationSettings');
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
        .update({ logo_url: newLogoUrl })
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
        .update({ logo_url: null })
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
          company_name: settings.company_name,
          tagline: settings.tagline
        })
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
          <ImageIcon className="h-5 w-5" />
          Organization Branding
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Logo Upload */}
        <div className="space-y-4">
          <Label>Organization Logo</Label>
          
          {settings.logo_url ? (
            <div className="flex items-center gap-4">
              <img 
                src={settings.logo_url} 
                alt="Organization Logo" 
                className="w-20 h-20 object-contain border rounded-lg"
                onError={(e) => {
                  console.error('Failed to load logo image');
                  e.currentTarget.style.display = 'none';
                }}
              />
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Current logo</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleRemoveLogo}
                  disabled={loading}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remove Logo
                </Button>
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">No logo uploaded</p>
              <p className="text-sm text-gray-500">Supported formats: JPEG, PNG, GIF, WebP, SVG (max 5MB)</p>
            </div>
          )}

          <div>
            <input
              type="file"
              id="logo-upload"
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
              disabled={uploading}
            />
            <Label htmlFor="logo-upload">
              <Button 
                variant="outline" 
                disabled={uploading}
                className="cursor-pointer"
                asChild
              >
                <span>
                  <Upload className="h-4 w-4 mr-2" />
                  {uploading ? 'Uploading...' : settings.logo_url ? 'Replace Logo' : 'Upload Logo'}
                </span>
              </Button>
            </Label>
          </div>
        </div>

        {/* Company Information */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="company-name">Company Name</Label>
            <Input
              id="company-name"
              value={settings.company_name || ''}
              onChange={(e) => setSettings(prev => ({ ...prev, company_name: e.target.value }))}
              placeholder="Enter your company name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tagline">Tagline</Label>
            <Textarea
              id="tagline"
              value={settings.tagline || ''}
              onChange={(e) => setSettings(prev => ({ ...prev, tagline: e.target.value }))}
              placeholder="Enter your company tagline or description"
              rows={3}
            />
          </div>
        </div>

        <Button 
          onClick={handleSaveSettings} 
          disabled={loading}
          className="w-full"
        >
          {loading ? 'Saving...' : 'Save Settings'}
        </Button>
      </CardContent>
    </Card>
  );
};
