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
import { ColumnService } from '../../../core/services/column.service';
import { switchMap } from 'rxjs';

@Component({
  selector: 'app-kanban-board',
  imports: [CommonModule, KanbanColumn, DragDropModule, MatTooltipModule, MatIconModule],
  templateUrl: './kanban-board.html',
  styleUrl: './kanban-board.scss',
})
export class KanbanBoard implements OnInit {
  allTasks: Task[] = [];
  columns: Column[] = [];

  projectId: string | null = null;

  constructor(private taskService: TaskService, private route: ActivatedRoute, private dialog: MatDialog, private columnService: ColumnService) {}

  ngOnInit(): void {
    this.projectId = this.route.snapshot.paramMap.get('id');

    if (this.projectId) {
    // 1. Spalten laden
    this.columnService.getColumns(this.projectId).subscribe(cols => {
      this.columns = cols;
    });
  }
  }

  // Stellt sicher, dass die Zeilen in richtiger Reihenfolge angezeigt werden
  get sortedColumns(): Column[] {
    return [...this.columns].sort((a, b) => a.position - b.position);
  }

  getTasksByStatus(status: string): Task[] {
    return this.allTasks.filter(t => t.status === status);
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
    if (!result || !this.projectId) return;

    // Löschen (Delete)
    if (result.delete && column) {
      this.columnService.deleteColumn(this.projectId, column.id).subscribe(() => {
        this.refreshBoard();
      });
    } 
    // Editieren (Patch)
    else if (column && this.projectId) {
      const needsRename = result.name !== column.name; 
      const needsMove = result.position !== column.position;

      if (needsRename && needsMove) {
        this.columnService.renameColumn(this.projectId, column.id, result.name)
          .pipe(switchMap(() => this.columnService.moveColumn(this.projectId!, column.id, result.position)))
          .subscribe(() => this.refreshBoard());
      } else if (needsRename) {
        this.columnService.renameColumn(this.projectId, column.id, result.name)
          .subscribe(() => this.refreshBoard());
      } else if (needsMove) {
        this.columnService.moveColumn(this.projectId, column.id, result.position)
          .subscribe(() => this.refreshBoard());
      }
    }
    // Erstellen (Create)
    else {
      this.columnService.createColumn(this.projectId, result.name, result.position || this.columns.length)
        .subscribe(newCol => {
          this.refreshBoard();
        });
    }
  });
  }

  // Alle Spalten bekommen (Get)
  refreshBoard(): void {
  if (this.projectId) {
    this.columnService.getColumns(this.projectId).subscribe(cols => {
      this.columns = cols;
    });
  }
}
}
