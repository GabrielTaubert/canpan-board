import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatListModule } from '@angular/material/list';
import { Member } from '../../../core/models/project.model';
import { MemberService } from '../../../core/services/member';
import { AuthService } from '../../../core/services/auth.service';
import { MemberDialog } from '../member-dialog/member-dialog';

@Component({
  selector: 'app-member-list',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatListModule,
    MatDialogModule,
  ],
  templateUrl: './member-list.html',
  styleUrl: './member-list.scss',
})
export class MemberList implements OnInit {
  projectId!: string;
  members: Member[] = [];
  isOwner = false;

  constructor(
    private route: ActivatedRoute,
    private memberService: MemberService,
    private authService: AuthService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.projectId = this.route.snapshot.paramMap.get('id')!;
    this.loadMembers();
  }

  loadMembers(): void {
    this.memberService.getMembers(this.projectId).subscribe(members => {
      this.members = members;
      const currentUserId = this.authService.user()?.id;
      this.isOwner = members.some(m => m.userId === currentUserId && m.role === 'OWNER');
    });
  }

  openAddMemberDialog(): void {
    const ref = this.dialog.open(MemberDialog);
    ref.afterClosed().subscribe(result => {
      if (result?.email) {
        this.memberService.addMember(this.projectId, result.email).subscribe(() => this.loadMembers());
      }
    });
  }

  removeMember(userId: string): void {
    this.memberService.removeMember(this.projectId, userId).subscribe(() => this.loadMembers());
  }

  toggleRole(member: Member): void {
    const newRole = member.role === 'OWNER' ? 'MEMBER' : 'OWNER';
    this.memberService.updateRole(this.projectId, member.userId, newRole).subscribe(() => this.loadMembers());
  }
}
