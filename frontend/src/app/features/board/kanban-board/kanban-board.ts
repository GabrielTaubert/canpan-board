import { Component, OnInit } from '@angular/core';
import { KanbanColumn } from "../kanban-column/kanban-column";
import { Task } from '../../../core/models/task-model';
import { TaskService } from '../../../core/services/task';
import { ActivatedRoute } from '@angular/router';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { MatDialog } from '@angular/material/dialog';
import { TaskDialog } from '../task-dialog/task-dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { Column } from '../../../core/models/column-model';
import { CommonModule } from '@angular/common';
import { ColumnDialog } from '../column-dialog/column-dialog';

@Component({
  selector: 'app-kanban-board',
  imports: [CommonModule, KanbanColumn, DragDropModule, MatTooltipModule, MatIconModule],
  templateUrl: './kanban-board.html',
  styleUrl: './kanban-board.scss',
})
export class KanbanBoard implements OnInit {
  allTasks: Task[] = [];
  columns: Column[] = [
    { id: 'TODO', title: 'To Do', isLocked: true, position: 0 },
    { id: 'DONE', title: 'Done', isLocked: true, position: 999 }
  ];

  projectId: string | null = null;

  constructor(private taskService: TaskService, private route: ActivatedRoute, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.projectId = this.route.snapshot.paramMap.get('id');
    this.taskService.getTasks().subscribe((tasks: Task[]) => {
      this.allTasks = tasks;
    });
  }

  get sortedColumns(): Column[] {
    return [...this.columns].sort((a, b) => a.position - b.position);
  }

  getTasksByStatus(status: string): Task[] {
    return this.allTasks.filter(t => t.status === status);
  }

  // Diese Methode ist die "Source of Truth" für das Löschen
  deleteColumn(column: Column): void {
    if (column.isLocked) return;

    // Tasks retten: Von der gelöschten Spalte nach TODO verschieben
    this.allTasks = this.allTasks.map(t => {
      if (t.status === column.id) {
        return { ...t, status: 'TODO', updatedAt: new Date() };
      }
      return t;
    });

    this.columns = this.columns.filter(c => c.id !== column.id);
    console.log(`Spalte ${column.title} gelöscht. Tasks wurden nach TODO verschoben.`);
  }

  // Um die Gedroppten Tasks zu handeln
  handleTaskDrop(event: CdkDragDrop<Task[]>, newStatus: string): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );

      const movedTask = event.container.data[event.currentIndex];
      if (movedTask) {
        movedTask.status = newStatus;
        movedTask.updatedAt = new Date();
      }
    }
  }

  // Öffnet das Task Dialog Fenster
  openTaskDialog(task?: Task, status?: string): void {
    const dialogRef = this.dialog.open(TaskDialog, {
      width: '400px',
      data: { task: task, status: status || 'TODO' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result) return;

      if (result.delete && task) {
        this.allTasks = this.allTasks.filter(t => t.id !== task.id);
      } else if (task) {
        const index = this.allTasks.findIndex(t => t.id === task.id);
        if (index !== -1) {
          this.allTasks[index] = { ...task, ...result, updatedAt: new Date() };
        }
      } else {
        const newTask: Task = { 
          ...result, 
          id: Math.random().toString(36).substring(2, 9),
          createdAt: new Date(),
          updatedAt: new Date(),
          status: status || 'TODO'
        };
        this.allTasks.push(newTask);
      }
    });
  }

  // Öffnet das Spalten Dialog Fenster
  openColumnDialog(column?: Column): void {
    const dialogRef = this.dialog.open(ColumnDialog, {
      width: '400px',
      data: { column: column }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result) return;

      if (result.delete && column) {
        this.deleteColumn(column);
      } 
      else if (column) {
        // Edit Mode
        const index = this.columns.findIndex(c => c.id === column.id);
        if (index !== -1) {
          // Wir übernehmen den Titel UND die neue Position
          this.columns[index] = { ...column, ...result };
          this.reorderColumns(); 
        }
      } 
      else {
        // Create Mode
        const newCol: Column = {
          id: Math.random().toString(36).substring(2, 9),
          title: result.title,
          isLocked: false,
          position: result.position || this.columns.length - 1 
        };
        this.columns.push(newCol);
        this.reorderColumns();
      }
    });
  }

  // Hilfsfunktion um sicherzustellen, dass keine Lücken/Doppelungen entstehen
  private reorderColumns(): void {
    this.columns.sort((a, b) => a.position - b.position);
  }
}
