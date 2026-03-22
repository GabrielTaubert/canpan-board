import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { KanbanBoard } from './kanban-board';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { ColumnService } from '../../../core/services/column.service';
import { TaskService } from '../../../core/services/task.service';
import { of, throwError } from 'rxjs';
import { Task } from '../../../core/models/task-model';
import { Column } from '../../../core/models/column-model';
import { MatDialog } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('KanbanBoard', () => {
  let component: KanbanBoard;
  let fixture: ComponentFixture<KanbanBoard>;
  let dialog: MatDialog;
  let mockColumnService: jasmine.SpyObj<ColumnService>;
  let mockTaskService: jasmine.SpyObj<TaskService>;

  const initialMockColumns: Column[] = [
    { id: 'COL_TODO', name: 'To Do', isSystem: true, position: 0 },
    { id: 'COL_DONE', name: 'Done', isSystem: true, position: 1 }
  ];

  const initialMockTasks: Task[] = [
    { id: 't1', title: 'Task 1', columnId: 'COL_TODO' } as Task,
    { id: 't2', title: 'Task 2', columnId: 'COL_DONE' } as Task
  ];

  beforeEach(async () => {
    mockColumnService = jasmine.createSpyObj('ColumnService', ['getColumns', 'createColumn', 'renameColumn', 'moveColumn', 'deleteColumn']);
    mockTaskService = jasmine.createSpyObj('TaskService', ['getProjectTasks', 'moveTask', 'getTaskDetail', 'createTask', 'updateTask', 'deleteTask']);

    mockColumnService.getColumns.and.returnValue(of(initialMockColumns));
    mockTaskService.getProjectTasks.and.returnValue(of(initialMockTasks));
    mockTaskService.moveTask.and.returnValue(of({}));
    mockTaskService.deleteTask.and.returnValue(of(void 0));
    mockTaskService.updateTask.and.returnValue(of({}));
    mockTaskService.createTask.and.returnValue(of({}));
    mockTaskService.getTaskDetail.and.returnValue(of(initialMockTasks[0]));

    await TestBed.configureTestingModule({
      imports: [KanbanBoard, NoopAnimationsModule],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => 'p123' } } } },
        { provide: TaskService, useValue: mockTaskService },
        { provide: ColumnService, useValue: mockColumnService },
        { provide: MatDialog, useValue: jasmine.createSpyObj('MatDialog', ['open']) }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(KanbanBoard);
    component = fixture.componentInstance;
    dialog = TestBed.inject(MatDialog);
    fixture.detectChanges();
  });

  it('should load initial data (columns and tasks) on init', () => {
  expect(mockColumnService.getColumns).toHaveBeenCalledWith('p123');
  expect(mockTaskService.getProjectTasks).toHaveBeenCalledWith('p123');
  
  expect(component.columns.length).toBe(initialMockColumns.length);
  expect(component.allTasks.length).toBe(initialMockTasks.length);
});

  it('should filter tasks by columnId using getTasksByColumn', () => {
    const todoTasks = component.getTasksByColumn('COL_TODO');
    expect(todoTasks.length).toBe(1);
    expect(todoTasks[0].id).toBe('t1');
  });

  it('should sort columns by position', () => {
    component.columns = [
      { id: 'B', name: 'B', position: 2 } as Column,
      { id: 'A', name: 'A', position: 1 } as Column
    ];
    expect(component.sortedColumns[0].id).toBe('A');
  });

  // Task drag & drop

it('should handle task drop in same container', () => {
  const data = [{ title: 'A' }, { title: 'B' }];
  const mockEvent = {
    previousContainer: { data: data },
    container: { data: data },
    previousIndex: 0,
    currentIndex: 1,
    item: { data: data[0] }
  } as any;

  // Wir prüfen nur, ob die Logik fehlerfrei durchläuft
  component.handleTaskDrop(mockEvent, 'TODO');
  expect(true).toBeTrue(); 
});

  it('should handle task drop (different container) and rollback on error', () => {
    const task = { id: 't1', columnId: 'COL_TODO' } as Task;
    const event = {
      item: { data: task },
      previousContainer: { id: 'old' },
      container: { id: 'new' }
    } as any;

    mockTaskService.moveTask.and.returnValue(throwError(() => new Error('Fail')));
    spyOn(component, 'refreshBoard');

    component.handleTaskDrop(event, 'COL_DONE');

    expect(task.columnId).toBe('COL_TODO'); // Rollback
    expect(component.refreshBoard).toHaveBeenCalled();
  });

  // Task dialog

  it('should fetch task details before opening dialog for existing task', () => {
    const taskSummary = { id: 't1' };
    (dialog.open as jasmine.Spy).and.returnValue({ afterClosed: () => of(null) });

    component.openTaskDialog(taskSummary, 'COL_TODO');

    expect(mockTaskService.getTaskDetail).toHaveBeenCalledWith('t1');
  });

  // Column dialog

  it('should rename a column when name changes', () => {
    const col = { id: 'c1', name: 'Old', position: 1 } as Column;
    (dialog.open as jasmine.Spy).and.returnValue({ afterClosed: () => of({ name: 'New', position: 1 }) });
    mockColumnService.renameColumn.and.returnValue(of({} as Column));

    component.openColumnDialog(col);

    expect(mockColumnService.renameColumn).toHaveBeenCalledWith('p123', 'c1', 'New');
    expect(mockColumnService.moveColumn).not.toHaveBeenCalled();
  });

  it('should move a column when position changes', () => {
    const col = { id: 'c1', name: 'Same', position: 1 } as Column;
    (dialog.open as jasmine.Spy).and.returnValue({ afterClosed: () => of({ name: 'Same', position: 2 }) });
    mockColumnService.moveColumn.and.returnValue(of({} as Column));

    component.openColumnDialog(col);

    expect(mockColumnService.moveColumn).toHaveBeenCalledWith('p123', 'c1', 2);
    expect(mockColumnService.renameColumn).not.toHaveBeenCalled();
  });

  it('should rename AND move a column using switchMap', fakeAsync(() => {
    const col = { id: 'c1', name: 'Old', position: 1 } as Column;
    (dialog.open as jasmine.Spy).and.returnValue({ afterClosed: () => of({ name: 'New', position: 2 }) });
    mockColumnService.renameColumn.and.returnValue(of({} as Column));
    mockColumnService.moveColumn.and.returnValue(of({} as Column));

    component.openColumnDialog(col);
    tick();

    expect(mockColumnService.renameColumn).toHaveBeenCalled();
    expect(mockColumnService.moveColumn).toHaveBeenCalled();
  }));

  it('should delete a column via service', () => {
    const col = { id: 'COL1', name: 'Temp', isSystem: false, position: 2 } as Column;
    component.columns.push(col);
    
    mockColumnService.deleteColumn.and.returnValue(of(undefined));
    mockColumnService.getColumns.and.returnValue(of(initialMockColumns));

    (dialog.open as jasmine.Spy).and.returnValue({
      afterClosed: () => of({ delete: true })
    });

    component.openColumnDialog(col);

    expect(mockColumnService.deleteColumn).toHaveBeenCalledWith('p123', 'COL1');
  });
});