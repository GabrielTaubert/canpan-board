import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Task } from '../../../core/models/task-model';
import { TaskCard } from "../task-card/task-card";
import { NgFor, NgIf } from '@angular/common';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-kanban-column',
  imports: [TaskCard, NgFor, NgIf, DragDropModule, MatButtonModule, MatIconModule, MatTooltipModule],
  templateUrl: './kanban-column.html',
  styleUrl: './kanban-column.scss',
})
export class KanbanColumn {
  @Input() title: string = '';
  @Input() tasks: Task[] = [];
  @Input() canEdit: boolean = true; // Neu: Steuert die Sichtbarkeit der Buttons

  @Output() taskDropped = new EventEmitter<CdkDragDrop<Task[]>>();
  @Output() addTask = new EventEmitter<string>();
  @Output() editTask = new EventEmitter<Task>();
  
  // Neu: Events für Spalten-Aktionen
  @Output() renameColumn = new EventEmitter<void>();
  @Output() deleteColumn = new EventEmitter<void>();

  onDrop(event: CdkDragDrop<Task[]>) {
    this.taskDropped.emit(event);
  }

  onColumnDblClick() {
    this.addTask.emit(this.title); 
  }

  onTaskDblClick(task: Task, event: MouseEvent) {
    event.stopPropagation();
    this.editTask.emit(task); 
  }
}
