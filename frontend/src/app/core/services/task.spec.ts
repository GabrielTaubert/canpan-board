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
    service.getTasks().subscribe((tasks: Task[]) => {
      expect(tasks).toBeTruthy();
      expect(tasks.length).toBe(2);
      
      expect(tasks[0].title).toBe('Navbar stylen');
      expect(tasks[0].status).toBe('DONE');
      
      done();
    });
  });
});