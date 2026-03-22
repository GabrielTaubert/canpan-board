import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private supabase: SupabaseClient

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey)
  }

  async uploadFile(file: File, taskId: string): Promise<string> {
    // Ein eindeutiger Pfad im Bucket: taskId/timestamp_filename
    const filePath = `${taskId}/${Date.now()}_${file.name}`;

    const { data, error } = await this.supabase.storage
      .from('task-attachments')
      .upload(filePath, file);

    if (error) {
      throw error;
    }

    const { data: urlData } = this.supabase.storage
      .from('task-attachments')
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  }

  async deleteFile(fileUrl: string) {
    const bucketName = 'task-attachments';
    const urlParts = fileUrl.split(`${bucketName}/`);
    
    if (urlParts.length < 2) return;

    const encodedPath = urlParts[1];
    const filePath = decodeURIComponent(encodedPath); 

    console.log("Versuche physisch zu löschen:", filePath);

    const { data, error } = await this.supabase.storage
      .from(bucketName)
      .remove([filePath]);

    if (error) {
      console.error("Supabase Storage Fehler:", error);
      throw error;
    }

    if (data && data.length === 0) {
      console.warn("Datei wurde im Storage nicht gefunden. Pfad-Check erforderlich!");
    }

    return data;
  }
}
