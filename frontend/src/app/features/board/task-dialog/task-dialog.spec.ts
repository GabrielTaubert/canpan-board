import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TaskDialog } from './task-dialog';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

describe('TaskDialog', () => {
  let component: TaskDialog;
  let fixture: ComponentFixture<TaskDialog>;
  let mockDialogRef: any;

  async function setupTest(dialogData: any) {
    mockDialogRef = {
      close: jasmine.createSpy('close')
    };

    await TestBed.configureTestingModule({
      imports: [TaskDialog],
      providers: [
        provideNoopAnimations(),
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: dialogData }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TaskDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  describe('Create Mode', () => {
    beforeEach(async () => {
      await setupTest({ status: 'TODO', task: null });
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should set isEditMode to false if no task is provided', () => {
      expect(component.isEditMode).toBeFalse();
      expect(component.task.status).toBe('TODO');
    });
  });

  describe('Edit Mode & Delete Logic', () => {
    const existingTask = { id: 't1', title: 'Test Task', status: 'IN_PROGRESS' };

    beforeEach(async () => {
      await setupTest({ task: existingTask });
    });

    it('should set isEditMode to true and copy task if provided', () => {
      expect(component.isEditMode).toBeTrue();
      expect(component.task.title).toBe('Test Task');
      expect(component.task).not.toBe(existingTask);
    });

    it('should close the dialog when onCancel is called', () => {
      component.onCancel();
      expect(mockDialogRef.close).toHaveBeenCalled();
    });

    it('should require confirmation before deleting', () => {
      component.onDelete();
      expect(component.showConfirmDelete).toBeTrue();
      expect(mockDialogRef.close).not.toHaveBeenCalled();
    });

    it('should close the dialog with delete data on second onDelete call', () => {
      component.onDelete();
      component.onDelete();
      expect(mockDialogRef.close).toHaveBeenCalledWith({ delete: true, id: 't1' });
    });

    it('should reset delete confirmation when resetDelete is called', () => {
      component.showConfirmDelete = true;
      component.resetDelete();
      expect(component.showConfirmDelete).toBeFalse();
    });
  });
});