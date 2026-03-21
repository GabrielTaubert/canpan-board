import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Column } from '../models/column-model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ColumnService {
  private readonly API_URL = `${environment.apiUrl}/projects`;

  constructor(private http: HttpClient) {}

  // Alle Spalten eines Projekts laden
  getColumns(projectId: string): Observable<Column[]> {
    return this.http.get<Column[]>(`${this.API_URL}/${projectId}/columns`);
  }

  // Neue Spalte erstellen
  createColumn(projectId: string, name: string, position: number): Observable<Column> {
    return this.http.post<Column>(`${this.API_URL}/${projectId}/columns`, { name, position });
  }

  // Spalte umbenennen
  renameColumn(projectId: string, columnId: string, name: string): Observable<Column> {
    return this.http.patch<Column>(`${this.API_URL}/${projectId}/columns/${columnId}/rename`, { name });
  }

  // Position ändern
  moveColumn(projectId: string, columnId: string, position: number): Observable<Column> {
    return this.http.patch<Column>(`${this.API_URL}/${projectId}/columns/${columnId}/move`, { position });
  }

  // Spalte löschen
  deleteColumn(projectId: string, columnId: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${projectId}/columns/${columnId}`);
  }
}
