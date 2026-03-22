import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Task } from '../../../core/models/task-model';
import { MatIconModule } from '@angular/material/icon';
import { TaskService } from '../../../core/services/task.service';
import { Observable, switchMap, take } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { MatDividerModule } from '@angular/material/divider';
import { MatCardModule } from '@angular/material/card';
import { MatSpinner } from '@angular/material/progress-spinner';

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
    MatSpinner
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
    private authService: AuthService
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
}
