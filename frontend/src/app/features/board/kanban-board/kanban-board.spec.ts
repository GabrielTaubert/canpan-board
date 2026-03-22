import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KanbanBoard } from './kanban-board';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { ColumnService } from '../../../core/services/column.service';
import { of } from 'rxjs';
import { Task } from '../../../core/models/task-model';
import { Column } from '../../../core/models/column-model';
import { MatDialog } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TaskService } from '../../../core/services/task.service';

describe('KanbanBoard', () => {
  let component: KanbanBoard;
  let fixture: ComponentFixture<KanbanBoard>;
  let dialog: MatDialog;
  let mockColumnService: jasmine.SpyObj<ColumnService>;
  let mockTaskService: jasmine.SpyObj<TaskService>;

  const initialMockTasks: Task[] = [
    { id: '1', title: 'Task 1', status: 'TODO' } as Task,
    { id: '2', title: 'Task 2', status: 'IN_PROGRESS' } as Task
  ];

  const initialMockColumns: Column[] = [
    { id: 'TODO', name: 'To Do', isSystem: true, position: 0 },
    { id: 'DONE', name: 'Done', isSystem: true, position: 999 }
  ];

  beforeEach(async () => {
    mockColumnService = jasmine.createSpyObj('ColumnService', [
      'getColumns', 'createColumn', 'renameColumn', 'moveColumn', 'deleteColumn'
    ]);
    mockTaskService = jasmine.createSpyObj('TaskService', ['getTasks']);

    // Default Returns für die Mocks
    mockColumnService.getColumns.and.returnValue(of(initialMockColumns));
    
    // Für Create/Update Operationen wird ein leeres objekt zurückgegeben
    mockColumnService.createColumn.and.returnValue(of({} as Column));
    mockColumnService.renameColumn.and.returnValue(of({} as Column));
    mockColumnService.moveColumn.and.returnValue(of({} as Column));
    mockColumnService.deleteColumn.and.returnValue(of(void 0));

    await TestBed.configureTestingModule({
      imports: [KanbanBoard, NoopAnimationsModule],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => 'project-123' } } }
        },
        { provide: TaskService, useValue: mockTaskService },
        { provide: ColumnService, useValue: mockColumnService },
        {
          provide: MatDialog,
          useValue: jasmine.createSpyObj('MatDialog', ['open'])
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(KanbanBoard);
    component = fixture.componentInstance;
    dialog = TestBed.inject(MatDialog);
    fixture.detectChanges(); 
  });

  it('should create and load columns on init', async () => {
  expect(component).toBeTruthy();
  
  fixture.detectChanges();
  await fixture.whenStable();

  expect(mockColumnService.getColumns).toHaveBeenCalledWith('project-123');
  
  expect(component.columns.length).toBe(initialMockColumns.length); 
});

  // Column logik tests

  it('should create a new column via service and refresh board', () => {
    const dialogResult = { name: 'New Col', position: 1 };
    (dialog.open as jasmine.Spy).and.returnValue({
      afterClosed: () => of(dialogResult)
    });

    component.openColumnDialog();

    expect(mockColumnService.createColumn).toHaveBeenCalledWith('project-123', 'New Col', 1);
    expect(mockColumnService.getColumns).toHaveBeenCalledTimes(2); // Init + Refresh
  });

  it('should rename a column when only name changes', () => {
    const columnToEdit = component.columns[0]; // TODO
    const dialogResult = { name: 'New Name', position: 0 }; // Position bleibt gleich
    (dialog.open as jasmine.Spy).and.returnValue({
      afterClosed: () => of(dialogResult)
    });

    component.openColumnDialog(columnToEdit);

    expect(mockColumnService.renameColumn).toHaveBeenCalledWith('project-123', 'TODO', 'New Name');
    expect(mockColumnService.moveColumn).not.toHaveBeenCalled();
  });

  it('should move a column when only position changes', () => {
    const columnToEdit = component.columns[0];
    const dialogResult = { name: 'To Do', position: 5 }; // Name bleibt gleich
    (dialog.open as jasmine.Spy).and.returnValue({
      afterClosed: () => of(dialogResult)
    });

    component.openColumnDialog(columnToEdit);

    expect(mockColumnService.moveColumn).toHaveBeenCalledWith('project-123', 'TODO', 5);
    expect(mockColumnService.renameColumn).not.toHaveBeenCalled();
  });

  it('should rename AND move a column using switchMap logic', () => {
    const columnToEdit = component.columns[0];
    const dialogResult = { name: 'New Name', position: 10 };
    (dialog.open as jasmine.Spy).and.returnValue({
      afterClosed: () => of(dialogResult)
    });

    component.openColumnDialog(columnToEdit);

    expect(mockColumnService.renameColumn).toHaveBeenCalled();
    expect(mockColumnService.moveColumn).toHaveBeenCalled();
  });

  it('should delete a column via service', () => {
    const columnToDelete = { id: 'COL1', name: 'Temp', isSystem: false, position: 2 };
    component.columns.push(columnToDelete);
    
    (dialog.open as jasmine.Spy).and.returnValue({
      afterClosed: () => of({ delete: true })
    });

    component.openColumnDialog(columnToDelete);

    expect(mockColumnService.deleteColumn).toHaveBeenCalledWith('project-123', 'COL1');
  });

  // Task Logik tests

  it('should filter tasks by status using getTasksByStatus', async () => {
  // Sicherstellen, dass die Daten geladen sind
  component.allTasks = [
    { id: '1', title: 'Task 1', status: 'TODO' } as Task
   ];
  
  fixture.detectChanges();
  await fixture.whenStable(); 

  const todoTasks = component.getTasksByStatus('TODO');
  
  expect(todoTasks.length).toBe(1);
  if (todoTasks.length > 0) {
    expect(todoTasks[0].title).toBe('Task 1');
  }
});

  it('should handle task drop correctly', () => {
    const data = [...initialMockTasks];
    const mockEvent = {
      previousContainer: { data: data },
      container: { data: data },
      previousIndex: 0,
      currentIndex: 1
    } as any;
    
    component.handleTaskDrop(mockEvent, 'TODO');
    expect(data[0].title).toBe('Task 2');
  });

  it('should update task status on transfer', () => {
    const sourceData = [initialMockTasks[0]];
    const targetData: Task[] = [];
    const mockEvent = {
      previousContainer: { data: sourceData },
      container: { data: targetData },
      previousIndex: 0,
      currentIndex: 0
    } as any;

    component.handleTaskDrop(mockEvent, 'DONE');
    expect(targetData[0].status).toBe('DONE');
  });

  it('should open task dialog and add new task locally', () => {
    (dialog.open as jasmine.Spy).and.returnValue({
      afterClosed: () => of({ title: 'New Task' })
    });
    
    const initialCount = component.allTasks.length;
    component.openTaskDialog();
    expect(component.allTasks.length).toBe(initialCount + 1);
  });

  it('should cover branch when task dialog is cancelled', () => {
    (dialog.open as jasmine.Spy).and.returnValue({
      afterClosed: () => of(null)
    });
    const snapshot = component.allTasks.length;
    component.openTaskDialog();
    expect(component.allTasks.length).toBe(snapshot);
  });

  it('should handle task deletion via dialog result', () => {
    component.allTasks = [{ id: '1', title: 'T1' } as Task];
    (dialog.open as jasmine.Spy).and.returnValue({
      afterClosed: () => of({ delete: true })
    });
    component.openTaskDialog(component.allTasks[0]);
    expect(component.allTasks.length).toBe(0);
  });
});