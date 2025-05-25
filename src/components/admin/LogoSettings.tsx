
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Upload, Save, Eye } from "lucide-react";

const LogoSettings = () => {
  const [logoUrl, setLogoUrl] = useState('/logo.svg');
  const [companyName, setCompanyName] = useState('TravelFlow360');
  const [tagline, setTagline] = useState('The Complete Travel Business Management Platform');

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setLogoUrl(url);
    }
  };

  const handleSave = () => {
    // Save logo settings to database/storage
    console.log('Saving logo settings:', { logoUrl, companyName, tagline });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Brand & Logo Settings</CardTitle>
        <CardDescription>Manage your platform's branding and logo</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="company-name">Company Name</Label>
              <Input
                id="company-name"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Enter company name"
              />
            </div>
            
            <div>
              <Label htmlFor="tagline">Tagline</Label>
              <Input
                id="tagline"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="Enter company tagline"
              />
            </div>
            
            <div>
              <Label htmlFor="logo-upload">Logo Upload</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="logo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="flex-1"
                />
                <Button variant="outline" size="icon">
                  <Upload className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <Label>Logo Preview</Label>
            <div className="border rounded-lg p-6 bg-slate-50 flex flex-col items-center justify-center min-h-[200px]">
              <img 
                src={logoUrl} 
                alt="Logo Preview" 
                className="max-h-16 max-w-32 object-contain mb-2"
              />
              <h3 className="font-bold text-lg">{companyName}</h3>
              <p className="text-sm text-gray-600 text-center">{tagline}</p>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
          <Button variant="outline">
            <Eye className="h-4 w-4 mr-2" />
            Preview on Site
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default LogoSettings;
