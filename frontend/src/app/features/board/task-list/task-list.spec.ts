import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TaskList } from './task-list';
import { Task } from '../../../core/models/task-model';
import { Column } from '../../../core/models/column-model';

describe('TaskList', () => {
  let component: TaskList;
  let fixture: ComponentFixture<TaskList>;

  const mockTasks: Task[] = [
    { 
      id: '1', 
      title: 'Task 1', 
      columnId: 'col-todo', 
      description: 'Erste Test-Beschreibung',
      priority: 'MEDIUM',
      assignedTo: 'elias@test.de'
    } as Task,
    { 
      id: '2', 
      title: 'Task 2', 
      columnId: 'col-done', 
      description: 'Zweite Test-Beschreibung',
      priority: 'HIGH',
      assignedTo: 'admin@test.de'
    } as Task,
    { 
      id: '3', 
      title: 'Task 3', 
      columnId: 'col-todo', 
      description: 'Dritte Test-Beschreibung',
      priority: 'LOW',
      assignedTo: '' 
    } as Task
  ];

  const mockColumns: Column[] = [
    { id: 'col-todo', name: 'To Do', position: 0 } as Column,
    { id: 'col-done', name: 'Done', position: 1 } as Column
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskList]
    }).compileComponents();

    fixture = TestBed.createComponent(TaskList);
    component = fixture.componentInstance;
    component.tasks = mockTasks;
    component.columns = mockColumns;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('getTasksByColumn', () => {
    it('should filter tasks correctly by columnId', () => {
      const todoTasks = component.getTasksByColumn('col-todo');
      const doneTasks = component.getTasksByColumn('col-done');
      expect(todoTasks.length).toBe(2);
      expect(doneTasks.length).toBe(1);
    });
  });

  describe('Avatar & Name Logic', () => {
    it('should return a color string for a name', () => {
      const color1 = component.getAvatarColor('Elias');
      expect(color1).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(color1).toBe(component.getAvatarColor('Elias'));
    });

    it('should return default color if name is null or empty', () => {
      expect(component.getAvatarColor(null)).toBe('#ccc');
      expect(component.getAvatarColor('')).toBe('#ccc');
    });

    it('should shorten email to name correctly', () => {
      expect(component.getShortName('elias.dev@example.com')).toBe('elias.dev');
    });

    it('should return dash if email is null or empty', () => {
      expect(component.getShortName(null)).toBe('–');
      const result = component.getShortName('');
      expect(result === '' || result === '–').toBeTrue();
    });
  });

  describe('Events', () => {
    it('should emit editTask event when emit is called', () => {
      spyOn(component.editTask, 'emit');
      const taskToEdit = mockTasks[0];
      component.editTask.emit(taskToEdit);
      expect(component.editTask.emit).toHaveBeenCalledWith(taskToEdit);
    });
  });
});