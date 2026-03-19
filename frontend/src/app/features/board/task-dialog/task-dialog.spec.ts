import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TaskDialog } from './task-dialog';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('TaskDialog', () => {
  let component: TaskDialog;
  let fixture: ComponentFixture<TaskDialog>;
  
  // Mock für MatDialogRef - WICHTIG: jasmine.createSpy('close') hier lassen
  let mockDialogRef: any;

  beforeEach(async () => {
    mockDialogRef = {
      close: jasmine.createSpy('close')
    };

    await TestBed.configureTestingModule({
      imports: [TaskDialog, NoopAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: { status: 'TODO', task: null } }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TaskDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set isEditMode to false if no task is provided', () => {
    expect(component.isEditMode).toBeFalse();
    expect(component.task.status).toBe('TODO');
  });

  it('should close the dialog when onCancel is called', () => {
    component.onCancel();
    expect(mockDialogRef.close).toHaveBeenCalled();
  });

  it('should require confirmation before deleting', () => {
    component.isEditMode = true;
    component.task = { id: 't1', title: 'Test' };
    
    component.onDelete();
    
    expect(component.showConfirmDelete).toBeTrue();
    expect(mockDialogRef.close).not.toHaveBeenCalled(); // Darf noch nicht schließen!
  });

  it('should close the dialog with delete data on second onDelete call', () => {
    component.isEditMode = true;
    component.task = { id: 't1', title: 'Test' };
    
    component.onDelete();
    component.onDelete();
    
    expect(mockDialogRef.close).toHaveBeenCalledWith({ delete: true, id: 't1' });
  });

  it('should reset delete confirmation when resetDelete is called', () => {
    component.showConfirmDelete = true;
    component.resetDelete();
    expect(component.showConfirmDelete).toBeFalse();
  });

  it('should set isEditMode to true and copy task if task is provided (Branch Coverage Zeile 37)', () => {
    const taskData = { id: 't1', title: 'Existing Task', status: 'DONE' };
    
    TestBed.overrideProvider(MAT_DIALOG_DATA, { useValue: { task: taskData } });
    
    const editFixture = TestBed.createComponent(TaskDialog);
    const editComponent = editFixture.componentInstance;
    
    expect(editComponent.isEditMode).toBeTrue();
    expect(editComponent.task.title).toBe('Existing Task');
    expect(editComponent.task).not.toBe(taskData); // Sicherstellen, dass es eine Kopie ({...}) ist
  });
});