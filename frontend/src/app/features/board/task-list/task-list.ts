import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Task } from '../../../core/models/task-model';
import { Column } from '../../../core/models/column-model';
import { UserHelperService } from '../../../core/services/utils/user-helper.service';

@Component({
  selector: 'app-task-list',
  imports: [CommonModule, MatIconModule, MatTooltipModule],
  templateUrl: './task-list.html',
  styleUrl: './task-list.scss',
})

export class TaskList {
  @Input() tasks: Task[] = [];
  @Input() columns: Column[] = [];
  
  @Output() editTask = new EventEmitter<Task>();

  constructor(public userHelper: UserHelperService) {}

  getTasksByColumn(columnId: string): Task[] {
    return this.tasks.filter(t => t.columnId === columnId);
  }
}