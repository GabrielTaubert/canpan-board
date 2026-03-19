import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Task } from '../models/task-model';

@Injectable({ providedIn: 'root' })
export class TaskService {
  
  getTasks(): Observable<Task[]> {
    const now = new Date();
    
    const mockTasks: Task[] = [
      { 
        id: 't1', 
        kanColuId: 'col-3', // ID für die "Done"-Spalte
        title: 'Navbar stylen', 
        description: 'Farbe #F97216 anwenden und Logo "CanPan🍳" einbauen', 
        status: 'DONE', 
        priority: 'HIGH', 
        assignedUsers: ['Elias'], 
        createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24), // Gestern
        updatedAt: now,
        attachments: [] 
      },
      { 
        id: 't3', 
        kanColuId: 'col-1', // ID für "To Do"
        title: 'Drag & Drop implementieren', 
        description: '@angular/cdk/drag-drop installieren und Logik einbauen', 
        status: 'TODO', 
        priority: 'LOW', 
        assignedUsers: ['Elias'], 
        createdAt: now, 
        updatedAt: now,
        attachments: []
      }
    ];
    
    return of(mockTasks);
  }
}