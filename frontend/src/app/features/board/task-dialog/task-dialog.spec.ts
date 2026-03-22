import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TaskDialog } from './task-dialog';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TaskService } from '../../../core/services/task.service';
import { AuthService } from '../../../core/services/auth.service';
import { StorageService } from '../../../core/services/storage.service';
import { of } from 'rxjs';

describe('TaskDialog', () => {
  let component: TaskDialog;
  let fixture: ComponentFixture<TaskDialog>;
  let mockDialogRef: any;
  let mockTaskService: any;
  let mockAuthService: any;
  let mockStorageService: any;

  async function setupTest(dialogData: any) {
    mockDialogRef = { close: jasmine.createSpy('close') };
    mockTaskService = jasmine.createSpyObj('TaskService', ['getTaskDetail', 'addComment', 'deleteAttachment']);
    mockAuthService = jasmine.createSpyObj('AuthService', ['getCurrentUser']);
    mockStorageService = jasmine.createSpyObj('StorageService', ['uploadFile', 'deleteFile']);

    // Default Mocks
    mockTaskService.getTaskDetail.and.returnValue(of({ description: 'Full detail' }));
    mockAuthService.getCurrentUser.and.returnValue(of({ id: 'u1', name: 'Test User' }));
    mockTaskService.addComment.and.returnValue(of({ id: 'c1', content: 'New Comment' }));
    mockTaskService.deleteAttachment.and.returnValue(of(null));
    mockStorageService.uploadFile.and.resolveTo('http://supabase.url/file.png');

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
    expect(component.task.description).toBe('Full detail');
  });

  it('should add a comment using the current user', async () => {
    await setupTest({ task: { id: 't1' }, columnId: 'c1' });
    component.newCommentContent = 'Hello World';
    
    component.addComment();

    expect(mockAuthService.getCurrentUser).toHaveBeenCalled();
    expect(mockTaskService.addComment).toHaveBeenCalledWith('t1', 'Hello World', 'u1');
    expect(component.task.comments?.length).toBe(1);
    expect(component.newCommentContent).toBe('');
  });

  it('should upload a file and update local attachments', async () => {
    await setupTest({ task: { id: 't1' }, columnId: 'c1' });
    const file = new File([''], 'test.jpg');
    const event = { target: { files: [file] } };

    await component.onFileSelected(event);

    expect(mockStorageService.uploadFile).toHaveBeenCalledWith(file, 't1');
    expect(component.task.attachments?.length).toBe(1);
    expect(component.task.attachments?.[0].fileUrl).toBe('http://supabase.url/file.png');
  });

  it('should delete an attachment from service and storage', async () => {
    await setupTest({ task: { id: 't1', attachments: [{ id: 'a1', fileUrl: 'url1' }] }, columnId: 'c1' });
    
    component.deleteAttachment({ id: 'a1', fileUrl: 'url1' } as any);

    expect(mockTaskService.deleteAttachment).toHaveBeenCalledWith('a1');
    // Warten auf das asynchrone deleteFile im subscribe
    fixture.whenStable().then(() => {
      expect(mockStorageService.deleteFile).toHaveBeenCalledWith('url1');
    });
  });

  it('should close with task data onSave', async () => {
    await setupTest({ task: null, columnId: 'c1' });
    component.task.title = 'Manual Title';
    component.onSave();
    expect(mockDialogRef.close).toHaveBeenCalledWith(jasmine.objectContaining({ title: 'Manual Title' }));
  });
});