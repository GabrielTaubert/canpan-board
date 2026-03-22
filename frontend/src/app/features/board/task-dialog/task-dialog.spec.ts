import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { TaskDialog } from './task-dialog';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TaskService } from '../../../core/services/task.service';
import { AuthService } from '../../../core/services/auth.service';
import { StorageService } from '../../../core/services/storage.service';
import { of, throwError } from 'rxjs';

describe('TaskDialog', () => {
  let component: TaskDialog;
  let fixture: ComponentFixture<TaskDialog>;
  let mockDialogRef: any;
  let mockTaskService: any;
  let mockAuthService: any;
  let mockStorageService: any;

  async function setupTest(dialogData: any) {
    mockDialogRef = { close: jasmine.createSpy('close') };
    mockTaskService = jasmine.createSpyObj('TaskService', ['getTaskDetail', 'addComment', 'deleteAttachment', 'addAttachmentUrl']);
    mockAuthService = jasmine.createSpyObj('AuthService', ['getCurrentUser']);
    mockStorageService = jasmine.createSpyObj('StorageService', ['uploadFile', 'deleteFile']);

    mockTaskService.getTaskDetail.and.returnValue(of({ description: 'Full detail' }));
    mockAuthService.getCurrentUser.and.returnValue(of({ id: 'u1', name: 'Test User' }));
    mockTaskService.addComment.and.returnValue(of({ id: 'c1', content: 'New Comment' }));
    mockTaskService.deleteAttachment.and.returnValue(of(null));
    mockTaskService.addAttachmentUrl.and.returnValue(of({ id: 'a-new', fileName: 'test.jpg', fileUrl: 'http://supabase.url/file.png' }));
    mockStorageService.uploadFile.and.resolveTo('http://supabase.url/file.png');
    mockStorageService.deleteFile.and.resolveTo();

    await TestBed.configureTestingModule({
      imports: [TaskDialog, NoopAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: dialogData },
        { provide: TaskService, useValue: mockTaskService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: StorageService, useValue: mockStorageService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TaskDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('should load full details on init in edit mode', async () => {
    await setupTest({ task: { id: 't1', title: 'Edit' }, columnId: 'c1' });
    expect(mockTaskService.getTaskDetail).toHaveBeenCalledWith('t1');
  });

  // Attachments

  it('should upload a file, call backend and update UI', async () => {
    await setupTest({ task: { id: 't1' }, columnId: 'c1' });
    const file = new File([''], 'test.jpg');
    const event = { target: { files: [file] } };

    await component.onFileSelected(event);

    expect(mockStorageService.uploadFile).toHaveBeenCalledWith(file, 't1');
    expect(mockTaskService.addAttachmentUrl).toHaveBeenCalledWith('t1', 'test.jpg', 'http://supabase.url/file.png');
    expect(component.task.attachments?.length).toBe(1);
    expect(component.isLoadingDetails).toBeFalse();
  });

  it('should handle upload error gracefully', async () => {
    await setupTest({ task: { id: 't1' }, columnId: 'c1' });
    mockStorageService.uploadFile.and.rejectWith(new Error('Upload failed'));
    spyOn(window, 'alert');

    await component.onFileSelected({ target: { files: [new File([], 'test.jpg')] } });

    expect(window.alert).toHaveBeenCalledWith(jasmine.stringMatching('Fehler beim Supabase-Upload'));
    expect(component.isLoadingDetails).toBeFalse();
  });

  it('should delete an attachment if confirmed', fakeAsync(async () => {
    await setupTest({ 
      task: { 
        id: 't1', 
        attachments: [{ id: 'a1', fileName: 'test.txt', fileUrl: 'url1' }] 
      }, 
      columnId: 'c1' 
    });
    
    spyOn(window, 'confirm').and.returnValue(true);
    mockStorageService.deleteFile.and.resolveTo();

    component.onDeleteAttachment({ id: 'a1', fileName: 'test.txt', fileUrl: 'url1' } as any);
    
    tick();
    fixture.detectChanges();

    expect(mockTaskService.deleteAttachment).toHaveBeenCalledWith('a1');
    expect(component.task.attachments?.length).toBe(0);
  }));

  it('should NOT delete if confirm is cancelled', async () => {
    await setupTest({ 
      task: { 
        id: 't1', 
        attachments: [{ id: 'a1', fileName: 'test.txt', fileUrl: 'url1' }] 
      }, 
      columnId: 'c1' 
    });
    
    spyOn(window, 'confirm').and.returnValue(false);
    component.onDeleteAttachment({ id: 'a1', fileName: 'test.txt' } as any);

    expect(mockTaskService.deleteAttachment).not.toHaveBeenCalled();
  });

  it('should identify image extensions correctly', async () => {
    await setupTest({ task: null, columnId: 'c1' });
    expect(component.isImage('test.PNG')).toBeTrue();
    expect(component.isImage('document.pdf')).toBeFalse();
  });

  it('should handle download via fetch and fallback to window.open on error', fakeAsync(async () => {
    await setupTest({ task: null, columnId: 'c1' });
    const mockFile = { fileName: 'test.jpg', fileUrl: 'http://test.url' } as any;

    spyOn(window, 'fetch').and.returnValue(Promise.reject('Network error'));
    const openSpy = spyOn(window, 'open');

    component.downloadFile(mockFile);
    
    tick();
    
    expect(openSpy).toHaveBeenCalledWith('http://test.url', '_blank');
  }));

  // Comments

  it('should add a comment and clear the input', async () => {
    await setupTest({ task: { id: 't1' }, columnId: 'c1' });
    component.newCommentContent = 'Nice work!';
    
    component.addComment();

    expect(mockTaskService.addComment).toHaveBeenCalledWith('t1', 'Nice work!', 'u1');
    expect(component.newCommentContent).toBe('');
    expect(component.task.comments?.length).toBe(1);
  });
});