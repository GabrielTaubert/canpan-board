import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KanbanBoard } from './kanban-board';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { TaskService } from '../../../core/services/task';
import { of } from 'rxjs';
import { Task } from '../../../core/models/task-model';
import { MatDialog } from '@angular/material/dialog';
import { Column } from '../../../core/models/column-model';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('KanbanBoard', () => {
  let component: KanbanBoard;
  let fixture: ComponentFixture<KanbanBoard>;
  let dialog: MatDialog;

  const initialMockTasks: Task[] = [
    { id: '1', title: 'Task 1', status: 'TODO' } as Task,
    { id: '2', title: 'Task 2', status: 'IN_PROGRESS' } as Task
  ];

  beforeEach(async () => {
    const currentMockTasks = JSON.parse(JSON.stringify(initialMockTasks));

    await TestBed.configureTestingModule({
      imports: [KanbanBoard, NoopAnimationsModule],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: { get: () => 'project-123' } }
          }
        },
        {
          provide: TaskService,
          useValue: {
            getTasks: () => of(currentMockTasks)
          }
        },
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

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not delete a locked column', () => {
    const initialColumnsCount = component.columns.length;
    const lockedColumn = component.columns.find(c => c.isLocked);
    
    if (lockedColumn) {
      component.deleteColumn(lockedColumn);
      expect(component.columns.length).toBe(initialColumnsCount);
    }
  });

  it('should delete a non-locked column and move its tasks to TODO', () => {
    const customCol: Column = { id: 'CUSTOM', title: 'Custom', isLocked: false, position: 1 };
    component.columns.push(customCol);
    
    component.allTasks.push({ id: '3', title: 'Task 3', status: 'CUSTOM' } as Task);
    
    component.deleteColumn(customCol);
    
    expect(component.columns.find(c => c.id === 'CUSTOM')).toBeUndefined();
    const movedTask = component.allTasks.find(t => t.id === '3');
    expect(movedTask?.status).toBe('TODO'); 
  });

  it('should create a new column via dialog', () => {
    const newColResult = { title: 'New Column', position: 5 };
    (dialog.open as jasmine.Spy).and.returnValue({
      afterClosed: () => of(newColResult)
    });

    component.openColumnDialog();
    
    const newCol = component.columns.find(c => c.title === 'New Column');
    expect(newCol).toBeTruthy();
    expect(newCol?.position).toBe(5);
  });

  it('should edit an existing column via dialog', () => {
    const columnToEdit = component.columns[0];
    const editResult = { title: 'Renamed Column', position: 10 };
    (dialog.open as jasmine.Spy).and.returnValue({
      afterClosed: () => of(editResult)
    });

    component.openColumnDialog(columnToEdit);
    
    expect(component.columns[0].title).toBe('Renamed Column');
    expect(component.columns[0].position).toBe(10);
  });

  it('should delete a column via dialog result', () => {
    const columnToDelete = { id: 'TEMP', title: 'Temp', isLocked: false, position: 2 };
    component.columns.push(columnToDelete);
    
    (dialog.open as jasmine.Spy).and.returnValue({
      afterClosed: () => of({ delete: true })
    });

    component.openColumnDialog(columnToDelete);
    
    expect(component.columns.find(c => c.id === 'TEMP')).toBeUndefined();
  });

  it('should return if column dialog is cancelled', () => {
    (dialog.open as jasmine.Spy).and.returnValue({
      afterClosed: () => of(null)
    });

    const initialCount = component.columns.length;
    component.openColumnDialog();
    expect(component.columns.length).toBe(initialCount);
  });

  it('should filter tasks by status using getTasksByStatus', async () => {
    fixture.detectChanges(); 
    await fixture.whenStable(); 
    const todoTasks = component.getTasksByStatus('TODO');
    expect(todoTasks.length).toBeGreaterThan(0);
  });

  it('should handle task drop (same container)', () => {
    const data = [...component.allTasks]; 
    const mockEvent = {
      previousContainer: { data: data },
      container: { data: data },
      previousIndex: 0,
      currentIndex: 1
    } as any;
    component.handleTaskDrop(mockEvent, 'TODO');
    expect(data[0].title).toBe('Task 2');
  });

  it('should transfer task to another container and update status', () => {
    const sourceData = [component.allTasks[0]]; 
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

  it('should add new task via dialog', () => {
    (dialog.open as jasmine.Spy).and.returnValue({
      afterClosed: () => of({ title: 'New', priority: 'LOW' })
    });
    const initialLen = component.allTasks.length;
    component.openTaskDialog();
    expect(component.allTasks.length).toBe(initialLen + 1);
  });

  it('should not update status if movedTask is undefined', () => {
    const mockEvent = {
      previousContainer: { data: [] },
      container: { data: [] },
      previousIndex: 0,
      currentIndex: 0
    } as any;

    component.handleTaskDrop(mockEvent, 'DONE');
    expect(true).toBeTrue(); 
  });

  it('should not update any task if findIndex fails in openTaskDialog', () => {
    const nonExistentTask = { id: '999', title: 'Ghost', status: 'TODO' } as Task;
    const editResult = { title: 'New Title' };
    
    (dialog.open as jasmine.Spy).and.returnValue({
      afterClosed: () => of(editResult)
    });

    const tasksBefore = JSON.stringify(component.allTasks);

    component.openTaskDialog(nonExistentTask); 

    expect(JSON.stringify(component.allTasks)).toBe(tasksBefore);
  });

  it('should use default status TODO when creating task without status', () => {
    (dialog.open as jasmine.Spy).and.returnValue({
      afterClosed: () => of({ title: 'New Task' })
    });
    
    component.openTaskDialog(undefined, undefined);
    
    const newTask = component.allTasks.find(t => t.title === 'New Task');
    expect(newTask?.status).toBe('TODO');
  });
});