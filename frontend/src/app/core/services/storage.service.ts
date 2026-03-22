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

  async deleteFile(fileUrl: string): Promise<void> {
    const parts = fileUrl.split('/task-attachments/');
    if (parts.length < 2) return;

    const filePath = parts[1];

    const { error } = await this.supabase.storage
      .from('task-attachments')
      .remove([filePath]);

    if (error) {
      console.error('Fehler beim Löschen in Supabase:', error);
      throw error;
    }
  }
}
