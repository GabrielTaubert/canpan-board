import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DashboardProgress, UserStats } from '../models/dashboard-model'

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  constructor(private http: HttpClient) {}

  getUserStats(projectId: string): Observable<UserStats[]> {
    return this.http.get<UserStats[]>(`/api/projects/${projectId}/dashboard/user-stats`);
  }

  startCalculation(projectId: string): Observable<{ jobId: string }> {
    return this.http.post<{ jobId: string }>(`/api/projects/${projectId}/dashboard/calculate`, {});
  }

  getJobStatus(projectId: string, jobId: string): Observable<DashboardProgress> {
    return this.http.get<DashboardProgress>(`/api/projects/${projectId}/dashboard/jobs/${jobId}`);
  }
}