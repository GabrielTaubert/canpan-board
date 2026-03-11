import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KanbanBoard } from './kanban-board';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { TaskService } from '../../../core/services/task';
import { of } from 'rxjs';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { Task } from '../../../core/models/task-model';
import { MatDialog } from '@angular/material/dialog';

describe('KanbanBoard', () => {
  let component: KanbanBoard;
  let fixture: ComponentFixture<KanbanBoard>;
  let dialog: MatDialog;

  // Mock-Tasks für die Tests
  const mockTasks: Task[] = [
    { id: '1', title: 'Task 1', status: 'TODO' } as Task,
    { id: '2', title: 'Task 2', status: 'IN_PROGRESS' } as Task
  ];

  // Mock für das Dialog Objekt
  const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);

  beforeEach(async () => {
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
            getTasks: () => of(mockTasks)
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
    fixture.detectChanges(); // Triggert ngOnInit und getTasks()
    dialog = TestBed.inject(MatDialog);
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
    const data = [...mockTasks];
    const mockEvent = {
      previousContainer: { data: data },
      container: { data: data },
      previousIndex: 0,
      currentIndex: 1
    } as any;

    component.handleTaskDrop(mockEvent, 'TODO');
    
    // Check ob die Reihenfolge getauscht wurde
    expect(data[0].title).toBe('Task 2');
    expect(data[1].title).toBe('Task 1');
  });

  it('should transfer an item to a different column (handleTaskDrop)', () => {
    const sourceData = [mockTasks[0]]; // Task 1 (TODO)
    const targetData: Task[] = [];
    
    const mockEvent = {
      previousContainer: { data: sourceData },
      container: { data: targetData },
      previousIndex: 0,
      currentIndex: 0
    } as any;

    component.handleTaskDrop(mockEvent, 'IN_PROGRESS');

    // Check ob Task verschoben wurde
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
    component.openTaskDialog(); // Create Mode

    expect(component.allTasks.length).toBe(initialLength + 1);
    expect(component.allTasks.find(t => t.title === 'New Task')).toBeTruthy();
  });

  it('should edit an existing task via dialog', () => {
    const existingTask = { id: '1', title: 'Task 1', status: 'TODO' } as Task;
    const editResult = { title: 'Updated Task 1' };
    
    (dialog.open as jasmine.Spy).and.returnValue({
      afterClosed: () => of(editResult)
    });

    component.openTaskDialog(existingTask); // Edit Mode

    const updatedTask = component.allTasks.find(t => t.id === '1');
    expect(updatedTask?.title).toBe('Updated Task 1');
  });

  it('should delete a task via dialog', () => {
    const existingTask = { id: '1', title: 'Task 1', status: 'TODO' } as Task;
    const deleteResult = { delete: true };

    (dialog.open as jasmine.Spy).and.returnValue({
      afterClosed: () => of(deleteResult)
    });

    component.openTaskDialog(existingTask); // Delete Mode

    expect(component.allTasks.find(t => t.id === '1')).toBeUndefined();
  });

  it('should do nothing if dialog is cancelled', () => {
    (dialog.open as jasmine.Spy).and.returnValue({
      afterClosed: () => of(null) // User bricht ab
    });

    const initialTasks = [...component.allTasks];
    component.openTaskDialog();
    
    expect(component.allTasks).toEqual(initialTasks);
  });
});