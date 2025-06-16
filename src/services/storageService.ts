
import { supabase } from '../integrations/supabase/client';
import { toast } from 'sonner';

export class StorageService {
  
  static async uploadFile(
    bucket: string,
    path: string,
    file: File,
    options?: { upsert?: boolean }
  ): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      console.log(`Uploading file to ${bucket}/${path}`);
      
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file, {
          upsert: options?.upsert || false
        });
      
      if (error) {
        console.error('Storage upload error:', error);
        return { success: false, error: error.message };
      }
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(path);
      
      return {
        success: true,
        url: urlData.publicUrl
      };
      
    } catch (error) {
      console.error('Error uploading file:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed'
      };
    }
  }
  
  static async deleteFile(bucket: string, path: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([path]);
      
      if (error) {
        return { success: false, error: error.message };
      }
      
      return { success: true };
      
    } catch (error) {
      console.error('Error deleting file:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Delete failed'
      };
    }
  }
  
  static async listFiles(bucket: string, folder?: string): Promise<{
    success: boolean;
    files?: any[];
    error?: string;
  }> {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .list(folder);
      
      if (error) {
        return { success: false, error: error.message };
      }
      
      return { success: true, files: data };
      
    } catch (error) {
      console.error('Error listing files:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'List failed'
      };
    }
  }
  
  static getPublicUrl(bucket: string, path: string): string {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);
    
    return data.publicUrl;
  }
}

export default StorageService;
