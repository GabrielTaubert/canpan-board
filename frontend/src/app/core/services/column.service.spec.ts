import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ColumnService } from './column.service';
import { environment } from '../../../environments/environment';
import { Column } from '../models/column-model';

describe('ColumnService', () => {
  let service: ColumnService;
  let httpMock: HttpTestingController;
  const baseUrl = `${environment.apiUrl}/projects`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ColumnService]
    });
    service = TestBed.inject(ColumnService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get columns for a project', () => {
    const mockColumns: Column[] = [
      { id: '1', name: 'To Do', position: 0, isSystem: true },
      { id: '2', name: 'Done', position: 1, isSystem: true }
    ];

    service.getColumns('p123').subscribe(cols => {
      expect(cols.length).toBe(2);
      expect(cols).toEqual(mockColumns);
    });

    const req = httpMock.expectOne(`${baseUrl}/p123/columns`);
    expect(req.request.method).toBe('GET');
    req.flush(mockColumns);
  });

  it('should create a new column', () => {
    const newCol: Column = { id: '3', name: 'Progress', position: 1, isSystem: false };

    service.createColumn('p123', 'Progress', 1).subscribe(col => {
      expect(col.name).toBe('Progress');
    });

    const req = httpMock.expectOne(`${baseUrl}/p123/columns`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ name: 'Progress', position: 1 });
    req.flush(newCol);
  });

  it('should rename a column', () => {
    const updatedCol: Column = { id: '1', name: 'New Name', position: 0, isSystem: false };

    service.renameColumn('p123', '1', 'New Name').subscribe(col => {
      expect(col.name).toBe('New Name');
    });

    const req = httpMock.expectOne(`${baseUrl}/p123/columns/1/rename`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ name: 'New Name' });
    req.flush(updatedCol);
  });

  it('should move a column', () => {
    const movedCol: Column = { id: '1', name: 'To Do', position: 5, isSystem: true };

    service.moveColumn('p123', '1', 5).subscribe(col => {
      expect(col.position).toBe(5);
    });

    const req = httpMock.expectOne(`${baseUrl}/p123/columns/1/move`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ position: 5 });
    req.flush(movedCol);
  });

  it('should delete a column', () => {
  service.deleteColumn('p123', '1').subscribe(res => {
    expect(res).toBeNull(); 
  });

  const req = httpMock.expectOne(`${baseUrl}/p123/columns/1`);
  expect(req.request.method).toBe('DELETE');

  req.flush(null); 
});
});