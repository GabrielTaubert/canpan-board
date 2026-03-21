import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Column } from '../../../core/models/column-model';

@Component({
  selector: 'app-column-dialog',
  imports: [CommonModule, FormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule],
  templateUrl: './column-dialog.html',
  styleUrl: './column-dialog.scss',
})
export class ColumnDialog {
  column: Partial<Column>;
  isEditMode: boolean;
  showConfirmDelete = false;

  constructor(
    public dialogRef: MatDialogRef<ColumnDialog>,
    @Inject(MAT_DIALOG_DATA) public data: { column?: Column }
  ) {
    this.isEditMode = !!data.column;
    // Entweder Kopie der bestehenden Spalte oder neues Objekt
    this.column = data.column ? { ...data.column } : { name: '', isSystem: false };
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onDelete(): void {
    if (!this.showConfirmDelete) {
      this.showConfirmDelete = true;
    } else {
      this.dialogRef.close({ delete: true, id: this.column.id });
    }
  }

  resetDelete(): void {
    this.showConfirmDelete = false;
  }
}