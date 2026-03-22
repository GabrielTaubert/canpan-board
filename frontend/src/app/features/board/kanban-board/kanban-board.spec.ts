import { ComponentFixture, TestBed } from '@angular/core/testing';
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
    { id: 't1', title: 'Task 1', columnId: 'COL_TODO' } as Task
  ];

  beforeEach(async () => {
    mockColumnService = jasmine.createSpyObj('ColumnService', ['getColumns', 'createColumn', 'renameColumn', 'moveColumn', 'deleteColumn']);
    mockTaskService = jasmine.createSpyObj('TaskService', ['getProjectTasks', 'moveTask', 'getTaskDetail', 'createTask', 'updateTask', 'deleteTask']);

    mockColumnService.getColumns.and.returnValue(of(initialMockColumns));
    mockTaskService.getProjectTasks.and.returnValue(of(initialMockTasks));
    mockTaskService.moveTask.and.returnValue(of({}));
    mockTaskService.deleteTask.and.returnValue(of(void 0));

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

  it('should load columns and tasks on init', () => {
    expect(mockColumnService.getColumns).toHaveBeenCalled();
    expect(mockTaskService.getProjectTasks).toHaveBeenCalled();
    expect(component.columns.length).toBe(2);
    expect(component.allTasks.length).toBe(1);
  });

  it('should handle task drop and update columnId (Optimistic Update)', () => {
    const task = { id: 't1', columnId: 'COL_TODO' } as Task;
    const event = { 
      item: { data: task }, 
      previousContainer: { data: [] }, 
      container: { data: [] },
      previousIndex: 0,
      currentIndex: 0 
    } as any;

    component.handleTaskDrop(event, 'COL_DONE');

    expect(task.columnId).toBe('COL_DONE');
    expect(mockTaskService.moveTask).toHaveBeenCalledWith('t1', 'COL_DONE');
  });

  it('should rollback columnId if moveTask fails (Error Branch)', () => {
    const task = { id: 't1', columnId: 'COL_TODO' } as Task;
    const event = { 
      item: { data: task }, 
      previousContainer: { data: [] }, 
      container: { data: [] } 
    } as any;

    mockTaskService.moveTask.and.returnValue(throwError(() => new Error('Server Error')));
    spyOn(component, 'refreshBoard');

    component.handleTaskDrop(event, 'COL_DONE');

    expect(task.columnId).toBe('COL_TODO'); // Zurückgesetzt auf Original
    expect(component.refreshBoard).toHaveBeenCalled();
  });

  it('should open task dialog and call createTask for new task', () => {
    (dialog.open as jasmine.Spy).and.returnValue({
      afterClosed: () => of({ title: 'New' })
    });
    mockTaskService.createTask.and.returnValue(of({}));

    component.openTaskDialog(null, 'COL_TODO');

    expect(mockTaskService.createTask).toHaveBeenCalled();
  });

  it('should open task dialog and call deleteTask on result.delete', () => {
    const task = { id: 't1' };
    (dialog.open as jasmine.Spy).and.returnValue({
      afterClosed: () => of({ delete: true })
    });

    // Wir nutzen hier direkt die launch-Logik via openTaskDialog
    component.openTaskDialog(task, 'COL_TODO');

    expect(mockTaskService.deleteTask).toHaveBeenCalledWith('t1');
  });
});