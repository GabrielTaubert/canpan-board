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
    MatIconModule
  ],
  templateUrl: './task-dialog.html',
  styleUrl: './task-dialog.scss',
})
export class TaskDialog {
  task: Partial<Task>;
  isEditMode: boolean;
  showConfirmDelete = false;

  constructor(
    public dialogRef: MatDialogRef<TaskDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.isEditMode = !!data.task;
    this.task = data.task ? { ...data.task } : { status: data.status, priority: 'LOW' };
  }

  onCancel(): void {
    this.dialogRef.close();
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
}
