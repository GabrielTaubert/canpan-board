import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Task, TaskAttachment, TaskLabel } from '../../../core/models/task-model';
import { MatIconModule } from '@angular/material/icon';
import { TaskService } from '../../../core/services/task.service';
import { AuthService } from '../../../core/services/auth.service';
import { MatDividerModule } from '@angular/material/divider';
import { MatCardModule } from '@angular/material/card';
import { StorageService } from '../../../core/services/storage.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Member } from '../../../core/models/project.model';
import { MemberService } from '../../../core/services/member';
import { UserHelperService } from '../../../core/services/utils/user-helper.service';

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
  members: Member[] = [];
  projectId: string;

  labelInput = { text: '', color: '#3f51b5' };
  existingLabels: TaskLabel[] = [];
  
  newCommentContent = '';

  constructor(
    public dialogRef: MatDialogRef<TaskDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private taskService: TaskService,
    private authService: AuthService,
    private storageService: StorageService,
    private memberService: MemberService,
    public userHelper: UserHelperService
  ) {
    this.isEditMode = !!data.task;
    // Basis-Daten übernehmen
    this.projectId = data.projectId;
    this.task = data.task ? { ...data.task } : { columnId: data.columnId, priority: 'MEDIUM', description: '' };
  }

  ngOnInit(): void {
    if (this.projectId) {
      this.loadMembers();
      this.collectExistingLabels();
    } else {
      console.error('TaskDialog: Keine projectId übergeben!');
    }
    
    // Wenn wir editieren, laden wir sofort die vollständigen Details nach
    if (this.isEditMode && this.task.id) {
      this.isLoadingDetails = true;
      this.taskService.getTaskDetail(this.task.id).subscribe({
        next: (fullTask) => {
          this.task = { ...this.task, ...fullTask }; // Daten mergen
          this.isLoadingDetails = false;
          this.collectExistingLabels();
        },
        error: () => this.isLoadingDetails = false
      });
    }
  }

  loadMembers(): void {
    this.memberService.getMembers(this.projectId).subscribe({
      next: (members) => {
        this.members = members;
      },
      error: (err) => console.error('Fehler beim Laden der Member', err)
    });
  }

  collectExistingLabels(): void {
    const rawTasks = this.data?.allProjectTasks || [];
    console.log('Anzahl Tasks im Dialog:', rawTasks.length);
    
    // Schau dir den ERSTEN Task genau an, ob er ein Label hat
    if (rawTasks.length > 0) {
      console.log('Struktur des ersten Tasks:', rawTasks[0]);
    }

    const labels = rawTasks
      .map((t: any) => {
        // Prüfe, ob das Feld vielleicht anders heißt (z.B. taskLabel statt label)
        return t.label || t.taskLabel || t.labels; 
      })
      .filter((l: any) => {
        const isValid = l && (l.labelText || l.text);
        if (l && !isValid) console.warn('Label gefunden, aber Felder (labelText) fehlen:', l);
        return isValid;
      });

    const uniqueMap = new Map();
    labels.forEach((l: any) => {
      const text = (l.labelText || l.text || '').trim().toLowerCase();
      if (text) uniqueMap.set(text, l);
    });

    this.existingLabels = Array.from(uniqueMap.values());
    console.log('Endergebnis Vorschläge:', this.existingLabels);
  }

  applyLabel(labelText: string, color: string): void {
    if (!this.task.id) return;
    
    this.taskService.setLabel(this.task.id, labelText, color).subscribe(newLabel => {
      this.task.label = newLabel;
      this.labelInput.text = '';
    });
  }

  removeLabel(): void {
    if (!this.task.id) return;
    this.taskService.removeLabel(this.task.id).subscribe(() => {
      this.task.label = undefined;
    });
  }

  selectExistingLabel(label: TaskLabel): void {
    this.applyLabel(label.labelText, label.color);
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
  if (!this.newCommentContent.trim()) return;

  // TypeScript-Fix für die ID (falls noch nicht drin)
  if (!this.task.id) {
    console.error('Task ID fehlt beim Kommentieren.');
    return;
  }

  const currentUser = this.authService.user();
  if (!currentUser) return;

  this.taskService.addComment(this.task.id, this.newCommentContent, currentUser.id).subscribe({
    next: (savedComment) => {

      this.task.comments = [
        savedComment,              
        ...(this.task.comments || []) 
      ];
      
      this.newCommentContent = '';
      
      console.log('Kommentar erfolgreich hinzugefügt:', savedComment);
    },
    error: (err: any) => console.error('Fehler beim Kommentieren', err)
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
