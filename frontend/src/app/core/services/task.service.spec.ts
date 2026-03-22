import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TaskService } from './task.service';
import { environment } from '../../../environments/environment';
import { TaskAttachment } from '../models/task-model';

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

  afterEach(() => {
    // Verifiziert, dass keine ungeplanten Anfragen offen sind
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // --- Core Operations ---

  it('should get project tasks', () => {
    service.getProjectTasks('p1').subscribe();
    const req = httpMock.expectOne(`${baseUrl}/project/p1`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('should get task detail', () => {
    service.getTaskDetail('t1').subscribe();
    const req = httpMock.expectOne(`${baseUrl}/t1`);
    expect(req.request.method).toBe('GET');
    req.flush({ id: 't1', title: 'Details' });
  });

  it('should create a task in a column', () => {
    const taskReq = { title: 'New Task' };
    service.createTask('col1', taskReq).subscribe();
    const req = httpMock.expectOne(`${baseUrl}/column/col1`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(taskReq);
    req.flush({});
  });

  it('should update a task', () => {
    const taskReq = { title: 'Updated' };
    service.updateTask('t1', taskReq).subscribe();
    const req = httpMock.expectOne(`${baseUrl}/t1`);
    expect(req.request.method).toBe('PUT');
    req.flush({});
  });

  it('should move a task', () => {
    service.moveTask('t1', 'col2').subscribe();
    const req = httpMock.expectOne(`${baseUrl}/t1/move`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ columnId: 'col2' });
    req.flush({});
  });

  it('should delete a task', () => {
    service.deleteTask('t1').subscribe();
    const req = httpMock.expectOne(`${baseUrl}/t1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  // --- Comments ---

  it('should add a comment', () => {
    service.addComment('t1', 'Hello', 'u1').subscribe();
    const req = httpMock.expectOne(`${baseUrl}/t1/comments`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ content: 'Hello', userId: 'u1' });
    req.flush({});
  });

  // --- Labels ---

  it('should set a label', () => {
    const labelReq = { labelText: 'Bug', color: 'red' };
    service.setLabel('t1', labelReq).subscribe();
    const req = httpMock.expectOne(`${baseUrl}/t1/label`);
    expect(req.request.method).toBe('PUT');
    req.flush({});
  });

  // --- Attachments ---

  it('should upload an attachment using FormData', () => {
    const mockFile = new File([''], 'test.txt');
    service.uploadAttachment('t1', mockFile).subscribe();

    const req = httpMock.expectOne(`${baseUrl}/t1/attachments`);
    expect(req.request.method).toBe('POST');
    // Prüfung, ob es ein FormData Objekt ist
    expect(req.request.body instanceof FormData).toBeTrue();
    expect(req.request.body.has('file')).toBeTrue();
    req.flush({});
  });

  it('should delete an attachment', () => {
    service.deleteAttachment('a1').subscribe();
    const req = httpMock.expectOne(`${baseUrl}/attachments/a1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('should add an attachment URL', () => {
    const mockAttachment: TaskAttachment = { id: 'a1', fileName: 'test.png', fileUrl: 'http://test.com' };
    
    service.addAttachmentUrl('t1', 'test.png', 'http://test.com').subscribe(res => {
      expect(res).toEqual(mockAttachment);
    });

    const req = httpMock.expectOne(`${baseUrl}/t1/attachments/url`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ fileName: 'test.png', fileUrl: 'http://test.com' });
    req.flush(mockAttachment);
  });
});