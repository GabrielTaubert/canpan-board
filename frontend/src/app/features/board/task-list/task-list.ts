import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Task } from '../../../core/models/task-model';
import { Column } from '../../../core/models/column-model';

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

  getTasksByColumn(columnId: string): Task[] {
    return this.tasks.filter(t => t.columnId === columnId);
  }

  getAvatarColor(name: string | null): string {
    if (!name) return '#ccc';
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = ['#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#00bcd4', '#009688', '#4caf50'];
    return colors[Math.abs(hash) % colors.length];
  }

  getShortName(email: string | null): string {
    if (!email) return '–';
    return email.split('@')[0];
  }
}