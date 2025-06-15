
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Upload, Save, Eye, Trash2, Palette } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "../../integrations/supabase/client";
import { useAuth } from "../../contexts/AuthContext";
import { errorHandler } from "../../services/errorHandlingService";

interface BrandingData {
  logo_url?: string;
  company_name?: string;
  tagline?: string;
  primary_color?: string;
  secondary_color?: string;
}

export const BrandingSettings = () => {
  const { profile } = useAuth();
  const [settings, setSettings] = useState<BrandingData>({});
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loadingSettings, setLoadingSettings] = useState(true);

  useEffect(() => {
    loadBrandingSettings();
  }, [profile?.org_id]);

  const loadBrandingSettings = async () => {
    if (!profile?.org_id) {
      setLoadingSettings(false);
      return;
    }

    try {
      setLoadingSettings(true);
      const { data, error } = await supabase
        .from('organizations')
        .select('name, logo_url, tagline, primary_color, secondary_color')
        .eq('id', profile.org_id)
        .single();

      if (error) {
        console.error('Error loading branding settings:', error);
        errorHandler.handleError(error, 'BrandingSettings.loadBrandingSettings');
        return;
      }

      if (data) {
        setSettings({
          company_name: data.name || '',
          logo_url: data.logo_url || '',
          tagline: data.tagline || '',
          primary_color: data.primary_color || '#0d9488',
          secondary_color: data.secondary_color || '#64748b'
        });
      }
    } catch (error) {
      console.error('Error in loadBrandingSettings:', error);
      errorHandler.handleError(error, 'BrandingSettings.loadBrandingSettings');
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

    // Validate file type and size
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a valid image file (JPEG, PNG, GIF, WebP, or SVG)');
      return;
    }

    if (file.size > 5242880) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile.org_id}/logo-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('organization-logos')
        .upload(fileName, file, { 
          upsert: true,
          contentType: file.type
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        errorHandler.handleError(uploadError, 'BrandingSettings.handleLogoUpload');
        return;
      }

      const { data } = supabase.storage
        .from('organization-logos')
        .getPublicUrl(fileName);

      const newLogoUrl = data.publicUrl;
      setSettings(prev => ({ ...prev, logo_url: newLogoUrl }));
      toast.success('Logo uploaded successfully');
    } catch (error) {
      console.error('Error uploading logo:', error);
      errorHandler.handleError(error, 'BrandingSettings.handleLogoUpload');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const handleRemoveLogo = async () => {
    if (!profile?.org_id || !settings.logo_url) return;

    setLoading(true);
    try {
      // Remove from storage
      const fileName = settings.logo_url.split('/').pop();
      if (fileName) {
        await supabase.storage
          .from('organization-logos')
          .remove([`${profile.org_id}/${fileName}`]);
      }

      setSettings(prev => ({ ...prev, logo_url: '' }));
      toast.success('Logo removed successfully');
    } catch (error) {
      console.error('Error removing logo:', error);
      errorHandler.handleError(error, 'BrandingSettings.handleRemoveLogo');
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
          name: settings.company_name,
          logo_url: settings.logo_url,
          tagline: settings.tagline,
          primary_color: settings.primary_color,
          secondary_color: settings.secondary_color
        })
        .eq('id', profile.org_id);

      if (error) {
        console.error('Error saving settings:', error);
        errorHandler.handleError(error, 'BrandingSettings.handleSaveSettings');
        return;
      }

      toast.success('Branding settings saved successfully');
    } catch (error) {
      console.error('Error in handleSaveSettings:', error);
      errorHandler.handleError(error, 'BrandingSettings.handleSaveSettings');
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
            <span className="ml-2">Loading branding settings...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Brand & Logo Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="company-name">Company Name</Label>
              <Input
                id="company-name"
                value={settings.company_name || ''}
                onChange={(e) => setSettings(prev => ({ ...prev, company_name: e.target.value }))}
                placeholder="Enter company name"
              />
            </div>
            
            <div>
              <Label htmlFor="tagline">Tagline</Label>
              <Textarea
                id="tagline"
                value={settings.tagline || ''}
                onChange={(e) => setSettings(prev => ({ ...prev, tagline: e.target.value }))}
                placeholder="Enter company tagline"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="primary-color">Primary Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="primary-color"
                    type="color"
                    value={settings.primary_color || '#0d9488'}
                    onChange={(e) => setSettings(prev => ({ ...prev, primary_color: e.target.value }))}
                    className="w-16 h-10 p-1 border rounded"
                  />
                  <Input
                    value={settings.primary_color || '#0d9488'}
                    onChange={(e) => setSettings(prev => ({ ...prev, primary_color: e.target.value }))}
                    placeholder="#0d9488"
                    className="flex-1"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="secondary-color">Secondary Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="secondary-color"
                    type="color"
                    value={settings.secondary_color || '#64748b'}
                    onChange={(e) => setSettings(prev => ({ ...prev, secondary_color: e.target.value }))}
                    className="w-16 h-10 p-1 border rounded"
                  />
                  <Input
                    value={settings.secondary_color || '#64748b'}
                    onChange={(e) => setSettings(prev => ({ ...prev, secondary_color: e.target.value }))}
                    placeholder="#64748b"
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
            
            <div>
              <Label htmlFor="logo-upload">Logo Upload</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="logo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  disabled={uploading}
                  className="flex-1"
                />
                <Button variant="outline" size="icon" disabled={uploading}>
                  <Upload className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <Label>Brand Preview</Label>
            <div 
              className="border rounded-lg p-6 flex flex-col items-center justify-center min-h-[200px]"
              style={{ 
                backgroundColor: `${settings.primary_color}10`,
                borderColor: settings.primary_color
              }}
            >
              {settings.logo_url ? (
                <div className="relative group">
                  <img 
                    src={settings.logo_url} 
                    alt="Logo Preview" 
                    className="max-h-16 max-w-32 object-contain mb-3"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={handleRemoveLogo}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <div className="w-16 h-16 bg-gray-200 rounded mb-3 flex items-center justify-center">
                  <Upload className="h-6 w-6 text-gray-400" />
                </div>
              )}
              
              <h3 
                className="font-bold text-lg mb-2"
                style={{ color: settings.primary_color }}
              >
                {settings.company_name || 'Your Company Name'}
              </h3>
              
              <p 
                className="text-sm text-center"
                style={{ color: settings.secondary_color }}
              >
                {settings.tagline || 'Your company tagline will appear here'}
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={handleSaveSettings} disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
          <Button variant="outline" onClick={loadBrandingSettings}>
            <Eye className="h-4 w-4 mr-2" />
            Preview Changes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
