import { TestBed } from '@angular/core/testing';
import { TaskService } from './task';
import { Task } from '../models/task-model';

describe('TaskService', () => {
  let service: TaskService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TaskService]
    });
    service = TestBed.inject(TaskService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return all mock tasks and trigger function coverage', (done: DoneFn) => {
    // Dieser Aufruf sorgt dafür, dass die Zeilen 9-50 in task.ts als "covered" markiert werden
    service.getTasks().subscribe((tasks: Task[]) => {
      // Validierung der Daten
      expect(tasks).toBeTruthy();
      expect(tasks.length).toBe(3);
      
      // Check auf einen spezifischen Task (z.B. den ersten)
      expect(tasks[0].title).toBe('Navbar stylen');
      expect(tasks[0].status).toBe('DONE');
      
      done();
    });
  });
});