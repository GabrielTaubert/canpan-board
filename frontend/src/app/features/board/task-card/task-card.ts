import { Component, Input } from '@angular/core';
import { Task } from '../../../core/models/task-model';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgIf, UpperCasePipe } from '@angular/common';
import { DragDropModule } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-task-card',
  imports: [
    DragDropModule,
    MatTooltipModule,
    UpperCasePipe,
    NgIf
  ],
  templateUrl: './task-card.html',
  styleUrl: './task-card.scss',
})

export class TaskCard {
  @Input() task!: Task;
}
