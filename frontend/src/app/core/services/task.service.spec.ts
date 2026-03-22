import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TaskService } from './task.service';
import { environment } from '../../../environments/environment';

describe('TaskService', () => {
  let service: TaskService;
  let httpMock: HttpTestingController;
  const baseUrl = `${environment.apiUrl}/tasks`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TaskService]
    });
    service = TestBed.inject(TaskService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should get project tasks', () => {
    service.getProjectTasks('p1').subscribe();
    const req = httpMock.expectOne(`${baseUrl}/project/p1`);
    expect(req.request.method).toBe('GET');
  });

  it('should move a task', () => {
    service.moveTask('t1', 'col2').subscribe();
    const req = httpMock.expectOne(`${baseUrl}/t1/move`);
    expect(req.request.body).toEqual({ columnId: 'col2' });
    req.flush({});
  });

  it('should add a comment', () => {
    service.addComment('t1', 'Hello', 'u1').subscribe();
    const req = httpMock.expectOne(`${baseUrl}/t1/comments`);
    expect(req.request.body).toEqual({ content: 'Hello', userId: 'u1' });
  });
});