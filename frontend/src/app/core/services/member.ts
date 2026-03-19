import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Member, MemberRole } from '../models/project.model';

@Injectable({
  providedIn: 'root',
})
export class MemberService {

  private apiUrl(projectId: string): string {
    return `/api/projects/${projectId}/members`;
  }

  constructor(private http: HttpClient) {}

  getMembers(projectId: string): Observable<Member[]> {
    return this.http.get<Member[]>(this.apiUrl(projectId));
  }

  addMember(projectId: string, email: string): Observable<Member> {
    return this.http.post<Member>(this.apiUrl(projectId), { email });
  }

  removeMember(projectId: string, userId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl(projectId)}/${userId}`);
  }

  updateRole(projectId: string, userId: string, role: MemberRole): Observable<Member> {
    return this.http.put<Member>(`${this.apiUrl(projectId)}/${userId}/role`, { role });
  }
}
