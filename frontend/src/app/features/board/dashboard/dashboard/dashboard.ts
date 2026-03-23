import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ColumnStats, UserStats } from '../../../../core/models/dashboard-model';
import { interval, Subscription, switchMap, takeWhile } from 'rxjs';
import { DashboardService } from '../../../../core/services/dashboard.service';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { NgFor, NgIf, UpperCasePipe } from '@angular/common';
import { Member } from '../../../../core/models/project.model';
import { MemberService } from '../../../../core/services/member';
import { UserHelperService } from '../../../../core/services/utils/user-helper.service';

@Component({
  selector: 'app-dashboard',
  imports: [
    MatCardModule,
    MatProgressBarModule,
    NgIf,
    NgFor,
    UpperCasePipe
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class ProjectDashboard implements OnInit, OnDestroy {
  @Input() projectId!: string;

  columnStats: ColumnStats[] = [];
  userStats: UserStats[] = [];
  
  calculationProgress = 0;
  isCalculating = false;
  private pollingSub?: Subscription;

  members: Member[] = [];

  constructor(
    private dashboardService: DashboardService,
    private memberService: MemberService,
    public userHelper: UserHelperService
  ) {}

  ngOnInit(): void {
    this.loadMembers();
    this.loadUserStats();
    this.runCalculation();
  }

  loadUserStats(): void {
    this.dashboardService.getUserStats(this.projectId).subscribe(stats => this.userStats = stats);
  }

  loadMembers(): void {
    this.memberService.getMembers(this.projectId).subscribe(m => this.members = m);
  }

  getUserEmail(userId: string): string {
    const member = this.members.find(m => m.userId === userId);
    return member ? member.email : 'Unbekannter User';
  }

  runCalculation(): void {
    this.isCalculating = true;
    this.calculationProgress = 0;

    this.dashboardService.startCalculation(this.projectId).subscribe(res => {
      const jobId = res.jobId;

      // Polling: Alle 2 Sekunden prüfen
      this.pollingSub = interval(2000).pipe(
        switchMap(() => this.dashboardService.getJobStatus(this.projectId, jobId)),
        takeWhile(data => data.status === 'RUNNING', true) // Stoppe wenn COMPLETED
      ).subscribe(data => {
        this.calculationProgress = data.progress;
        if (data.status === 'COMPLETED') {
          this.columnStats = data.result as ColumnStats[];
          this.isCalculating = false;
        }
      });
    });
  }

  ngOnDestroy(): void {
    this.pollingSub?.unsubscribe();
  }
}
