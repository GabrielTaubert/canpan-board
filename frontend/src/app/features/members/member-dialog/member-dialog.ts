import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MemberRole } from '../../../core/models/project.model';

@Component({
  selector: 'app-member-dialog',
  standalone: true,
  imports: [
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './member-dialog.html',
  styleUrl: './member-dialog.scss',
})
export class MemberDialog {
  email = '';
  role: MemberRole = 'MEMBER';

  constructor(private dialogRef: MatDialogRef<MemberDialog>) {}

  confirm(): void {
    if (this.email.trim()) {
      this.dialogRef.close({ email: this.email.trim(), role: this.role });
    }
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
