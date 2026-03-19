import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ColumnDialog } from './column-dialog';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

describe('ColumnDialog', () => {
  let component: ColumnDialog;
  let fixture: ComponentFixture<ColumnDialog>;
  
  // Mock für MatDialogRef
  let mockDialogRef: any;

  // Hilfsfunktion für das Setup, um verschiedene Daten (Edit vs Create) zu testen
  async function setupTest(dialogData: any) {
    mockDialogRef = {
      close: jasmine.createSpy('close')
    };

    await TestBed.configureTestingModule({
      imports: [ColumnDialog],
      providers: [
        provideNoopAnimations(), // Verhindert Animations-Fehler
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: dialogData }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ColumnDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  describe('Create Mode', () => {
    beforeEach(async () => {
      await setupTest({ column: null });
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should set isEditMode to false if no column is provided', () => {
      expect(component.isEditMode).toBeFalse();
      expect(component.column.title).toBe('');
    });
  });

  describe('Edit Mode & Logic', () => {
    beforeEach(async () => {
      await setupTest({ column: { id: 'c1', title: 'To Do', isLocked: false } });
    });

    it('should set isEditMode to true if column is provided', () => {
      expect(component.isEditMode).toBeTrue();
      expect(component.column.title).toBe('To Do');
    });

    it('should close the dialog when onCancel is called', () => {
      component.onCancel();
      expect(mockDialogRef.close).toHaveBeenCalled();
    });

    it('should require confirmation before deleting (Branch 1)', () => {
      expect(component.showConfirmDelete).toBeFalse();
      
      component.onDelete();
      
      expect(component.showConfirmDelete).toBeTrue();
      expect(mockDialogRef.close).not.toHaveBeenCalled();
    });

    it('should close with delete data on second onDelete call (Branch 2)', () => {
      // Erster Klick setzt Confirmation
      component.onDelete(); 
      // Zweiter Klick führt Löschung aus
      component.onDelete(); 
      
      expect(mockDialogRef.close).toHaveBeenCalledWith({ delete: true, id: 'c1' });
    });

    it('should reset delete confirmation when resetDelete is called', () => {
      component.showConfirmDelete = true;
      component.resetDelete();
      expect(component.showConfirmDelete).toBeFalse();
    });
  });
});