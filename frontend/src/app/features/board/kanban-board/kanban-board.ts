import { Component, OnInit } from '@angular/core';
import { KanbanColumn } from "../kanban-column/kanban-column";
import { Task } from '../../../core/models/task-model';
import { ActivatedRoute } from '@angular/router';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { MatDialog } from '@angular/material/dialog';
import { TaskDialog } from '../task-dialog/task-dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { Column } from '../../../core/models/column-model';
import { CommonModule } from '@angular/common';
import { ColumnDialog } from '../column-dialog/column-dialog';
import { ColumnService } from '../../../core/services/column.service';
import { switchMap } from 'rxjs';
import { TaskService } from '../../../core/services/task.service';

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

  constructor(
    private taskService: TaskService,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private columnService: ColumnService
  ) {}

  ngOnInit(): void {
    this.projectId = this.route.snapshot.paramMap.get('id');

    if (this.projectId) {
      this.loadInitialData();
    }
  }

  // Zum laden der bereits vorhandenen Spalten und Tasks
  loadInitialData(): void {
    // 1. Spalten laden
    this.columnService.getColumns(this.projectId!).subscribe(cols => {
      this.columns = cols;
      
      // 2. Sobald Spalten da sind, alle Tasks laden
      this.taskService.getProjectTasks(this.projectId!).subscribe(tasks => {
        this.allTasks = tasks;
      });
    });
  }

  // Stellt sicher, dass die Zeilen in richtiger Reihenfolge angezeigt werden
  get sortedColumns(): Column[] {
    return [...this.columns].sort((a, b) => a.position - b.position);
  }

  // Um die Tasks einer Spalte zu bekommen
  getTasksByColumn(columnId: string): Task[] {
    const filtered = this.allTasks.filter(t => t.columnId === columnId);
    return filtered;
  }

  // Um die Gedroppten Tasks zu handeln
  handleTaskDrop(event: CdkDragDrop<Task[]>, newColumnId: string): void {
  // 1. Wenn in die gleiche Spalte verschoben wurde:
  if (event.previousContainer === event.container) {
    moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
  } 
  
  // 2. Wenn in eine andere Spalte verschoben wurde:
  else {
    const task = event.item.data; 
    const oldColumnId = task.columnId;

    task.columnId = newColumnId;

    // 3. Server informieren
    this.taskService.moveTask(task.id, newColumnId).subscribe({
      next: () => {
        console.log('Task erfolgreich verschoben');
      },
      error: (err) => {
        task.columnId = oldColumnId;
        console.error('Fehler beim Verschieben:', err);
        this.refreshBoard(); // Board wieder synchronisieren
      }
    });
  }
}

  // Öffnet das Task Dialog Fenster
  openTaskDialog(task?: any, columnId?: string): void {
  if (task) {
    // Wenn wir editieren, holen wir erst die Details (Kommentare, Attachments)
    this.taskService.getTaskDetail(task.id).subscribe(fullTask => {
      this.launchTaskDialog(fullTask, columnId);
    });
  } else {
    // Neuer Task = leeres Dialog Fenster
    this.launchTaskDialog(null, columnId);
  }
}

private launchTaskDialog(task: any, columnId?: string) {
  const dialogRef = this.dialog.open(TaskDialog, {
    width: '600px',
    data: { 
      task: task, 
      columnId: columnId, 
      projectId: this.projectId
    }
  });

  dialogRef.afterClosed().subscribe(result => {
    if (!result) return;
    if (result.delete) {
      this.taskService.deleteTask(task.id).subscribe(() => this.refreshBoard());
    } else if (task) {
      this.taskService.updateTask(task.id, result).subscribe(() => this.refreshBoard());
    } else {
      this.taskService.createTask(columnId!, result).subscribe(() => this.refreshBoard());
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
      // Lade beides neu, um synchron zu bleiben
      this.columnService.getColumns(this.projectId).subscribe(cols => {
        this.columns = cols;
      });
      this.taskService.getProjectTasks(this.projectId).subscribe(tasks => {
        this.allTasks = tasks;
      });
    }
  }
}
