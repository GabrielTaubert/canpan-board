import { Component, OnInit } from '@angular/core';
import { KanbanColumn } from "../kanban-column/kanban-column";
import { Task } from '../../../core/models/task-model';
import { TaskService } from '../../../core/services/task';
import { ActivatedRoute } from '@angular/router';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-kanban-board',
  imports: [KanbanColumn, DragDropModule],
  templateUrl: './kanban-board.html',
  styleUrl: './kanban-board.scss',
})
export class KanbanBoard implements OnInit {
  allTasks: Task[] = [];
  todoTasks: Task[] = [];
  inProgressTasks: Task[] = [];
  doneTasks: Task[] = [];

  projectId: string | null = null;

  constructor(private taskService: TaskService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    // Id aus der URL lesen (:id im Routing)
    this.projectId = this.route.snapshot.paramMap.get('id');
    console.log('active project-id: ', this.projectId);

    // Tasks beim starten laden
    this.taskService.getTasks().subscribe((tasks: Task[]) => {
      this.allTasks = tasks
      this.updateColumnArrays()
    });
  }

  // Funktion um im HTML die Tasks auf die Spalten aufzuteilen
  getTasksByStatus(status: 'TODO' | 'IN_PROGRESS' | 'DONE'): Task[] {
    return this.allTasks.filter(t => t.status === status)
  }

  // Hilfsfunktion um besser die Tasks zu filtern
  updateColumnArrays() {
    this.todoTasks = this.allTasks.filter(t => t.status === 'TODO');
    this.inProgressTasks = this.allTasks.filter(t => t.status === 'IN_PROGRESS');
    this.doneTasks = this.allTasks.filter(t => t.status === 'DONE');
  }

  // das droppen einer TaskCard handlen
  handleTaskDrop(event: CdkDragDrop<Task[]>, newStatus: 'TODO' | 'IN_PROGRESS' | 'DONE'): void {
    if (event.previousContainer === event.container) {
      // Wenn Karte in die gleiche Spalte gedroppt wird
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex);
    } else {
      // Wenn Karte in eine andere Spalte gedroppt wird
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
          console.log(`Task "${movedTask.title}" ist jetzt ${newStatus}`);
      }
    }
  }
}
