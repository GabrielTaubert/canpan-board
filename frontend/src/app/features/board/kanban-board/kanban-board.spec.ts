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

  // Init & Viewmode

  it('should load initial data on init', () => {
    expect(mockColumnService.getColumns).toHaveBeenCalledWith('p123');
    expect(mockTaskService.getProjectTasks).toHaveBeenCalledWith('p123');
    expect(component.projectId).toBe('p123');
  });

  it('should switch view modes', () => {
    component.viewMode = 'list';
    expect(component.viewMode).toBe('list');
    component.viewMode = 'dashboard';
    expect(component.viewMode).toBe('dashboard');
  });

  // Task & Column Logik

  it('should filter tasks by columnId', () => {
    const todoTasks = component.getTasksByColumn('COL_TODO');
    expect(todoTasks.length).toBe(1);
    expect(todoTasks[0].id).toBe('t1');
  });

  it('should sort columns by position', () => {
    component.columns = [
      { id: 'B', position: 2 } as Column,
      { id: 'A', position: 1 } as Column
    ];
    expect(component.sortedColumns[0].id).toBe('A');
  });

  // Drag & Drop

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

    expect(task.columnId).toBe('COL_TODO'); // Rollback erfolgreich
    expect(component.refreshBoard).toHaveBeenCalled();
  });

  // Task Dialog

  it('should pass projectId to TaskDialog when opening', () => {
    const task = { id: 't1' };
    (dialog.open as jasmine.Spy).and.returnValue({ afterClosed: () => of(null) });

    component.openTaskDialog(task, 'COL_TODO');

    expect(dialog.open).toHaveBeenCalledWith(jasmine.any(Function), jasmine.objectContaining({
      data: jasmine.objectContaining({
        projectId: 'p123'
      })
    }));
  });

  it('should call updateTask when dialog result is returned and task exists', () => {
    const existingTask = { id: 't1' };
    const result = { title: 'New Title' };
    (dialog.open as jasmine.Spy).and.returnValue({ afterClosed: () => of(result) });
    spyOn(component, 'refreshBoard');

    mockTaskService.getTaskDetail.and.returnValue(of(existingTask));

    component.openTaskDialog(existingTask, 'COL_TODO');

    expect(mockTaskService.updateTask).toHaveBeenCalledWith('t1', result);
    expect(component.refreshBoard).toHaveBeenCalled();
  });

  it('should call createTask when opening dialog without task', () => {
    const result = { title: 'Brand New Task' };
    (dialog.open as jasmine.Spy).and.returnValue({ afterClosed: () => of(result) });
    spyOn(component, 'refreshBoard');

    component.openTaskDialog(null, 'COL_TODO');

    expect(mockTaskService.createTask).toHaveBeenCalledWith('COL_TODO', result);
    expect(component.refreshBoard).toHaveBeenCalled();
  });

  // Column Dialog

  it('should handle rename AND move in one pipe using switchMap', fakeAsync(() => {
    const col = { id: 'c1', name: 'Old', position: 1 } as Column;
    (dialog.open as jasmine.Spy).and.returnValue({ 
        afterClosed: () => of({ name: 'New', position: 2 }) 
    });
    
    mockColumnService.renameColumn.and.returnValue(of({} as Column));
    mockColumnService.moveColumn.and.returnValue(of({} as Column));
    spyOn(component, 'refreshBoard');

    component.openColumnDialog(col);
    tick();

    expect(mockColumnService.renameColumn).toHaveBeenCalled();
    expect(mockColumnService.moveColumn).toHaveBeenCalled();
    expect(component.refreshBoard).toHaveBeenCalled();
  }));

  it('should delete a column if result.delete is true', () => {
    const col = { id: 'c1' } as Column;
    (dialog.open as jasmine.Spy).and.returnValue({ afterClosed: () => of({ delete: true }) });
    
    mockColumnService.deleteColumn.and.returnValue(of(void 0)); 
    spyOn(component, 'refreshBoard');

    component.openColumnDialog(col);

    expect(mockColumnService.deleteColumn).toHaveBeenCalledWith('p123', 'c1');
    expect(component.refreshBoard).toHaveBeenCalled();
  });
});