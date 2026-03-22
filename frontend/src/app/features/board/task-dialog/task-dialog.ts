import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Task, TaskAttachment } from '../../../core/models/task-model';
import { MatIconModule } from '@angular/material/icon';
import { TaskService } from '../../../core/services/task.service';
import { Observable, switchMap, take } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { MatDividerModule } from '@angular/material/divider';
import { MatCardModule } from '@angular/material/card';
import { MatSpinner } from '@angular/material/progress-spinner';
import { StorageService } from '../../../core/services/storage.service';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-task-dialog',
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatCardModule,
    MatSpinner,
    MatTooltipModule
  ],
  templateUrl: './task-dialog.html',
  styleUrl: './task-dialog.scss',
})
export class TaskDialog {
  task: Partial<Task>;
  isEditMode: boolean;
  showConfirmDelete = false;
  isLoadingDetails = false;
  
  newCommentContent = '';

  constructor(
    public dialogRef: MatDialogRef<TaskDialog>,
    @Inject(MAT_DIALOG_DATA) public data: { task?: Task, columnId: string },
    private taskService: TaskService,
    private authService: AuthService,
    private storageService: StorageService
  ) {
    this.isEditMode = !!data.task;
    // Basis-Daten übernehmen
    this.task = data.task ? { ...data.task } : { columnId: data.columnId, priority: 'MEDIUM', description: '' };
  }

  ngOnInit(): void {
    // Wenn wir editieren, laden wir sofort die vollständigen Details nach
    if (this.isEditMode && this.task.id) {
      this.isLoadingDetails = true;
      this.taskService.getTaskDetail(this.task.id).subscribe({
        next: (fullTask) => {
          this.task = { ...this.task, ...fullTask }; // Daten mergen
          this.isLoadingDetails = false;
        },
        error: () => this.isLoadingDetails = false
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    this.dialogRef.close(this.task);
  }

  onDelete(): void {
    if (!this.showConfirmDelete) {
      this.showConfirmDelete = true;
    } else {
      this.dialogRef.close({ delete: true, id: this.task.id });
    }
  }

  resetDelete(): void {
    this.showConfirmDelete = false;
  }

  // Comments

  addComment(): void {
    if (!this.newCommentContent.trim() || !this.task.id) return;

    // 1. Wir rufen die Funktion auf: getCurrentUser()
    // 2. Wir nehmen nur den aktuellen Wert: pipe(take(1))
    // 3. Wir "switchen" zum Kommentar-Request: switchMap
    this.authService.getCurrentUser().pipe(
      take(1), 
      switchMap(user => {
        if (!user?.id) throw new Error('Kein User eingeloggt');
        
        return this.taskService.addComment(
          this.task.id!, 
          this.newCommentContent, 
          user.id
        );
      })
    ).subscribe({
      next: (newComment) => {
        if (!this.task.comments) this.task.comments = [];
        this.task.comments.push(newComment);
        this.newCommentContent = '';
      },
      error: (err) => console.error('Kommentar konnte nicht gesendet werden:', err)
    });
  }

  // Attachments
  async onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (!file || !this.task.id) return;

    this.isLoadingDetails = true;

    try {
      // Schritt 1: Datei zu Supabase (S3) hochladen
      const publicUrl = await this.storageService.uploadFile(file, this.task.id);
      console.log('Upload zu Supabase erfolgreich:', publicUrl);

      // Schritt 2: Die URL an dein Java-Backend senden
      this.taskService.addAttachmentUrl(this.task.id, file.name, publicUrl).subscribe({
        next: (newAttachment: any) => {
          // Schritt 3: UI aktualisieren
          if (!this.task.attachments) this.task.attachments = [];
          this.task.attachments.push(newAttachment);
          this.isLoadingDetails = false;
        },
        error: (err: any) => {
          console.error('Backend-Update fehlgeschlagen:', err);
          this.isLoadingDetails = false;
          alert('Die Datei wurde hochgeladen, aber der Link konnte nicht im Task gespeichert werden.');
        }
      });

    } catch (err: any) {
      alert('Fehler beim Supabase-Upload: ' + err.message);
      this.isLoadingDetails = false;
    }
  }

  onDeleteAttachment(attachment: TaskAttachment): void {
    // 1. Sicherheitsabfrage
    if (!confirm(`Möchtest du "${attachment.fileName}" wirklich unwiderruflich löschen?`)) {
      return;
    }

    // 2. Schritt: Aus der Datenbank löschen (Java Backend)
    this.taskService.deleteAttachment(attachment.id).subscribe({
      next: async () => {
        console.log('DB-Eintrag erfolgreich gelöscht');
        
        try {
          // 3. Schritt: Aus dem Supabase Storage löschen
          // Wir übergeben die URL, der StorageService extrahiert den Pfad
          await this.storageService.deleteFile(attachment.fileUrl);
          console.log('Datei aus Storage gelöscht');
        } catch (err) {
          // Falls S3/Supabase fehlschlägt, loggen wir es nur, 
          // da der DB-Eintrag eh schon weg ist.
          console.warn('Hinweis: Datei konnte nicht aus Storage gelöscht werden (evtl. schon weg)', err);
        } finally {
          // 4. Schritt: UI aktualisieren (egal ob S3-Löschen klappte oder nicht)
          this.task.attachments = this.task.attachments?.filter(a => a.id !== attachment.id);
        }
      },
      error: (err: any) => {
        console.error('Konnte Datenbankeintrag nicht löschen', err);
        alert('Fehler: Der Anhang konnte nicht gelöscht werden.');
      }
    });
  }

  // Prüft, ob die Datei ein Bild ist
  isImage(fileName: string): boolean {
    const extensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    return extensions.some(ext => fileName.toLowerCase().endsWith(ext));
  }

  // Öffnet das Bild in einem neuen Tab (Full Size)
  openFullImage(url: string) {
    window.open(url, '_blank');
  }

  downloadFile(file: TaskAttachment): void {
    console.log(`Starte echten Download für: ${file.fileName}`);

    // 1. Die Datei per HTTP als Blob (Binärdaten) anfordern
    fetch(file.fileUrl)
      .then(response => response.blob())
      .then(blob => {
        // 2. Eine lokale URL für diesen Datenstrom erzeugen
        const blobUrl = window.URL.createObjectURL(blob);
        
        // 3. Den "unsichtbaren Link" Trick anwenden
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = file.fileName; // Jetzt MUSS der Browser den Namen nehmen
        
        document.body.appendChild(link);
        link.click();
        
        // 4. Aufräumen
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl); 
        
        console.log('Download erfolgreich getriggert');
      })
      .catch(err => {
        console.error('Download fehlgeschlagen:', err);
        // Fallback: Falls Blob fehlschlägt, zumindest im neuen Tab öffnen
        window.open(file.fileUrl, '_blank');
      });
  }
}
