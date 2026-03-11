import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KanbanBoard } from './kanban-board';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { TaskService } from '../../../core/services/task';
import { of } from 'rxjs';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { Task } from '../../../core/models/task-model';

describe('KanbanBoard', () => {
  let component: KanbanBoard;
  let fixture: ComponentFixture<KanbanBoard>;

  // Mock-Tasks für die Tests
  const mockTasks: Task[] = [
    { id: '1', title: 'Task 1', status: 'TODO' } as Task,
    { id: '2', title: 'Task 2', status: 'IN_PROGRESS' } as Task
  ];

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
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(KanbanBoard);
    component = fixture.componentInstance;
    fixture.detectChanges(); // Triggert ngOnInit und getTasks()
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
});