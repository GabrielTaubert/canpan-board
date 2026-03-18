import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KanbanBoard } from './kanban-board';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { TaskService } from '../../../core/services/task';
import { of } from 'rxjs';
import { Task } from '../../../core/models/task-model';
import { MatDialog } from '@angular/material/dialog';

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
      imports: [KanbanBoard],
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

  it('should filter tasks by status using getTasksByStatus', async () => {
    fixture.detectChanges(); 
    await fixture.whenStable(); 

    const todoTasks = component.getTasksByStatus('TODO');
    
    expect(todoTasks.length).toBeGreaterThan(0);
    expect(todoTasks[0].title).toBe('Task 1');
  });

  it('should move an item within the same column (handleTaskDrop)', () => {
    const data = [...component.allTasks]; 
    
    const mockEvent = {
      previousContainer: { data: data },
      container: { data: data },
      previousIndex: 0,
      currentIndex: 1
    } as any;

    component.handleTaskDrop(mockEvent, 'TODO');
    
    expect(data[0].title).toBe('Task 2');
    expect(data[1].title).toBe('Task 1');
  });

  it('should transfer an item to a different column (handleTaskDrop)', () => {
    const sourceData = [component.allTasks[0]]; 
    const targetData: Task[] = [];
    
    const mockEvent = {
      previousContainer: { data: sourceData },
      container: { data: targetData },
      previousIndex: 0,
      currentIndex: 0
    } as any;

    component.handleTaskDrop(mockEvent, 'IN_PROGRESS');

    expect(targetData.length).toBe(1);
    expect(targetData[0].status).toBe('IN_PROGRESS');
    expect(sourceData.length).toBe(0);
  });

  it('should create a new task via dialog', () => {
    const newTaskResult = { title: 'New Task', status: 'TODO' };
    (dialog.open as jasmine.Spy).and.returnValue({
      afterClosed: () => of(newTaskResult)
    });

    const initialLength = component.allTasks.length;
    component.openTaskDialog(); 

    expect(component.allTasks.length).toBe(initialLength + 1);
    expect(component.allTasks.find(t => t.title === 'New Task')).toBeTruthy();
  });

  it('should edit an existing task via dialog', () => {
    const existingTask = component.allTasks[0]; 
    const editResult = { title: 'Updated Task 1' };
    
    (dialog.open as jasmine.Spy).and.returnValue({
      afterClosed: () => of(editResult)
    });

    component.openTaskDialog(existingTask); 

    expect(component.allTasks[0].title).toBe('Updated Task 1');
  });

  it('should delete a task via dialog', () => {
    const existingTask = component.allTasks[0];
    const deleteResult = { delete: true };

    (dialog.open as jasmine.Spy).and.returnValue({
      afterClosed: () => of(deleteResult)
    });

    const initialId = existingTask.id;
    component.openTaskDialog(existingTask); 

    expect(component.allTasks.find(t => t.id === initialId)).toBeUndefined();
  });

  it('should do nothing if dialog is cancelled', () => {
    (dialog.open as jasmine.Spy).and.returnValue({
      afterClosed: () => of(null)
    });

    const initialTasksCount = component.allTasks.length;
    component.openTaskDialog();
    
    expect(component.allTasks.length).toEqual(initialTasksCount);
  });
});