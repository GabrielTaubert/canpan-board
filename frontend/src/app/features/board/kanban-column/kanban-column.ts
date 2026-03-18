import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Task } from '../../../core/models/task-model';
import { TaskCard } from "../task-card/task-card";
import { NgFor } from '@angular/common';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-kanban-column',
  imports: [TaskCard, NgFor, DragDropModule],
  templateUrl: './kanban-column.html',
  styleUrl: './kanban-column.scss',
})
export class KanbanColumn {
  @Input() title: string ='';
  @Input() tasks: Task[] = [];

  @Output() taskDropped = new EventEmitter<CdkDragDrop<Task[]>>();
  @Output() addTask = new EventEmitter<string>();
  @Output() editTask = new EventEmitter<Task>();

  onDrop(event: CdkDragDrop<Task[]>) {
    this.taskDropped.emit(event)
  }

  onColumnDblClick() {
    this.addTask.emit(this.title); 
}

onTaskDblClick(task: Task, event: MouseEvent) {
    event.stopPropagation();
    this.editTask.emit(task); 
}
}
