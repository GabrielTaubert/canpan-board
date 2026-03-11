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

    // Mock-Event erstellen (CdkDragDrop Typ simulieren)
    const mockEvent = {
      previousIndex: 0,
      currentIndex: 1,
      container: { data: [] },
      previousContainer: { data: [] }
    } as unknown as CdkDragDrop<Task[]>;

    component.onDrop(mockEvent);

    expect(component.taskDropped.emit).toHaveBeenCalledWith(mockEvent);
  });
});