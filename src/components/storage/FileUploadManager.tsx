
import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Upload, File, X, Download } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../../integrations/supabase/client';
import { useAuth } from '../../contexts/AuthContext';

interface FileUploadManagerProps {
  bucketName: string;
  allowedTypes?: string[];
  maxFileSize?: number; // in MB
  onFileUploaded?: (fileUrl: string, fileName: string) => void;
}

const FileUploadManager = ({ 
  bucketName, 
  allowedTypes = ['image/*', 'application/pdf'], 
  maxFileSize = 10,
  onFileUploaded 
}: FileUploadManagerProps) => {
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ name: string; url: string; size: number }>>([]);
  const [uploading, setUploading] = useState(false);
  const { profile } = useAuth();

  const handleFileUpload = useCallback(async (files: FileList) => {
    if (!profile?.org_id) {
      toast.error('Organization not found');
      return;
    }

    setUploading(true);

    try {
      for (const file of Array.from(files)) {
        // Validate file size
        if (file.size > maxFileSize * 1024 * 1024) {
          toast.error(`File ${file.name} is too large. Maximum size is ${maxFileSize}MB`);
          continue;
        }

        // Validate file type
        const isValidType = allowedTypes.some(type => {
          if (type.endsWith('/*')) {
            return file.type.startsWith(type.slice(0, -1));
          }
          return file.type === type;
        });

        if (!isValidType) {
          toast.error(`File type ${file.type} is not allowed`);
          continue;
        }

        // Create unique filename
        const fileExt = file.name.split('.').pop();
        const fileName = `${profile.org_id}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
          .from(bucketName)
          .upload(fileName, file);

        if (error) {
          toast.error(`Failed to upload ${file.name}: ${error.message}`);
          continue;
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from(bucketName)
          .getPublicUrl(fileName);

        const newFile = {
          name: file.name,
          url: publicUrl,
          size: file.size
        };

        setUploadedFiles(prev => [...prev, newFile]);
        onFileUploaded?.(publicUrl, file.name);
        toast.success(`${file.name} uploaded successfully`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload files');
    } finally {
      setUploading(false);
    }
  }, [bucketName, allowedTypes, maxFileSize, profile?.org_id, onFileUploaded]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files);
    }
  }, [handleFileUpload]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files);
    }
  }, [handleFileUpload]);

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          File Upload
        </CardTitle>
        <CardDescription>
          Upload files to {bucketName}. Max size: {maxFileSize}MB
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Drop Zone */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            uploading ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
          }`}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onDragEnter={(e) => e.preventDefault()}
        >
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <div className="space-y-2">
            <p className="text-lg font-medium">
              {uploading ? 'Uploading...' : 'Drop files here or click to select'}
            </p>
            <p className="text-sm text-gray-500">
              Supported formats: {allowedTypes.join(', ')}
            </p>
            <input
              type="file"
              multiple
              accept={allowedTypes.join(',')}
              onChange={handleFileInput}
              disabled={uploading}
              className="hidden"
              id="file-input"
            />
            <Button 
              asChild 
              variant="outline" 
              disabled={uploading}
              className="mt-4"
            >
              <label htmlFor="file-input" className="cursor-pointer">
                Select Files
              </label>
            </Button>
          </div>
        </div>

        {/* Uploaded Files List */}
        {uploadedFiles.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">Uploaded Files</h4>
            <div className="space-y-2">
              {uploadedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <File className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="font-medium text-sm">{file.name}</p>
                      <p className="text-xs text-gray-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(file.url, '_blank')}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removeFile(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FileUploadManager;
