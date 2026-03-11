import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TaskDialog } from './task-dialog';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('TaskDialog', () => {
  let component: TaskDialog;
  let fixture: ComponentFixture<TaskDialog>;
  
  // Mock für MatDialogRef
  const mockDialogRef = {
    close: jasmine.createSpy('close')
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskDialog, NoopAnimationsModule], // NoopAnimations verhindert Fehler bei Material-Inputs
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: { status: 'TODO', task: null } } // Mock-Daten für den Constructor
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

  it('should close the dialog with delete data when onDelete is called', () => {
    component.task = { id: 't1', title: 'Test' };
    component.onDelete();
    expect(mockDialogRef.close).toHaveBeenCalledWith({ delete: true, id: 't1' });
  });
});