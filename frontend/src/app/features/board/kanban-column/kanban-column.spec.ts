import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KanbanColumn } from './kanban-column';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { Task } from '../../../core/models/task-model';

describe('KanbanColumn', () => {
  let component: KanbanColumn;
  let fixture: ComponentFixture<KanbanColumn>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KanbanColumn]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KanbanColumn);
    component = fixture.componentInstance;
    
    component.title = 'Test Column';
    component.tasks = [];
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit taskDropped event when onDrop is called', () => {
    spyOn(component.taskDropped, 'emit');
    const mockEvent = {
      previousIndex: 0,
      currentIndex: 1,
      container: { data: [] },
      previousContainer: { data: [] }
    } as unknown as CdkDragDrop<Task[]>;

    component.onDrop(mockEvent);
    expect(component.taskDropped.emit).toHaveBeenCalledWith(mockEvent);
  });

  it('should emit addTask event with title when onColumnDblClick is called', () => {
    spyOn(component.addTask, 'emit');
    
    component.onColumnDblClick();
    
    expect(component.addTask.emit).toHaveBeenCalledWith('Test Column');
  });

  it('should emit editTask event and stop propagation when onTaskDblClick is called', () => {
    spyOn(component.editTask, 'emit');
    
    const mockMouseEvent = {
      stopPropagation: jasmine.createSpy('stopPropagation')
    } as unknown as MouseEvent;
    
    const mockTask = { id: 't1', title: 'Edit Me' } as Task;

    component.onTaskDblClick(mockTask, mockMouseEvent);
    
    expect(mockMouseEvent.stopPropagation).toHaveBeenCalled();
    expect(component.editTask.emit).toHaveBeenCalledWith(mockTask);
  });
});