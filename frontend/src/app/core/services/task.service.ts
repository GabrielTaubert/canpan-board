import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TaskAttachment, TaskComment } from '../models/task-model';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private readonly baseUrl = `${environment.apiUrl}/tasks`;

  constructor(private http: HttpClient) {}

  // --- Core Task Operations ---
  getProjectTasks(projectId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/project/${projectId}`);
  }

  getTaskDetail(taskId: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${taskId}`);
  }

  createTask(columnId: string, taskRequest: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/column/${columnId}`, taskRequest);
  }

  updateTask(taskId: string, taskRequest: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/${taskId}`, taskRequest);
  }

  moveTask(taskId: string, columnId: string): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/${taskId}/move`, { columnId });
  }

  deleteTask(taskId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${taskId}`);
  }

  // --- Comments ---
  addComment(taskId: string, content: string, userId: string): Observable<TaskComment> {
    return this.http.post<TaskComment>(`${this.baseUrl}/${taskId}/comments`, {
      content,
      userId
    });
  }

  // --- Labels ---
  setLabel(taskId: string, labelRequest: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/${taskId}/label`, labelRequest);
  }

  // --- Attachments ---
  uploadAttachment(taskId: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<any>(`${this.baseUrl}/${taskId}/attachments`, formData);
  }

  deleteAttachment(attachmentId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/attachments/${attachmentId}`);
  }

  addAttachmentUrl(taskId: string, fileName: string, fileUrl: string): Observable<TaskAttachment> {
  const body = { fileName, fileUrl };
  return this.http.post<TaskAttachment>(
    `${this.baseUrl}/${taskId}/attachments/url`, 
    body
  );
}
}
