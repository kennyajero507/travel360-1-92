
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Upload, Image as ImageIcon, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "../../integrations/supabase/client";
import { useAuth } from "../../contexts/AuthContext";

interface OrganizationSettings {
  logo_url?: string;
  company_name?: string;
  tagline?: string;
}

export const LogoSettings = () => {
  const { userProfile } = useAuth();
  const [settings, setSettings] = useState<OrganizationSettings>({});
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadOrganizationSettings();
  }, [userProfile?.org_id]);

  const loadOrganizationSettings = async () => {
    if (!userProfile?.org_id) return;

    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('logo_url, company_name, tagline')
        .eq('id', userProfile.org_id)
        .single();

      if (error) {
        console.error('Error loading organization settings:', error);
        return;
      }

      setSettings(data || {});
    } catch (error) {
      console.error('Error in loadOrganizationSettings:', error);
    }
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !userProfile?.org_id) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userProfile.org_id}/logo.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('organization-logos')
        .upload(fileName, file, { upsert: true });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        toast.error('Failed to upload logo');
        return;
      }

      const { data } = supabase.storage
        .from('organization-logos')
        .getPublicUrl(fileName);

      const newLogoUrl = data.publicUrl;

      // Update organization settings
      const { error: updateError } = await supabase
        .from('organizations')
        .update({ logo_url: newLogoUrl })
        .eq('id', userProfile.org_id);

      if (updateError) {
        console.error('Update error:', updateError);
        toast.error('Failed to save logo URL');
        return;
      }

      setSettings(prev => ({ ...prev, logo_url: newLogoUrl }));
      toast.success('Logo uploaded successfully');
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast.error('Failed to upload logo');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveLogo = async () => {
    if (!userProfile?.org_id) return;

    try {
      const { error } = await supabase
        .from('organizations')
        .update({ logo_url: null })
        .eq('id', userProfile.org_id);

      if (error) {
        console.error('Error removing logo:', error);
        toast.error('Failed to remove logo');
        return;
      }

      setSettings(prev => ({ ...prev, logo_url: undefined }));
      toast.success('Logo removed successfully');
    } catch (error) {
      console.error('Error in handleRemoveLogo:', error);
      toast.error('Failed to remove logo');
    }
  };

  const handleSaveSettings = async () => {
    if (!userProfile?.org_id) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('organizations')
        .update({
          company_name: settings.company_name,
          tagline: settings.tagline
        })
        .eq('id', userProfile.org_id);

      if (error) {
        console.error('Error saving settings:', error);
        toast.error('Failed to save settings');
        return;
      }

      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Error in handleSaveSettings:', error);
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

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
              />
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Current logo</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleRemoveLogo}
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
            </div>
          )}

          <div>
            <input
              type="file"
              id="logo-upload"
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
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
