import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { TaskDialog } from './task-dialog';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TaskService } from '../../../core/services/task.service';
import { AuthService } from '../../../core/services/auth.service';
import { StorageService } from '../../../core/services/storage.service';
import { MemberService } from '../../../core/services/member';
import { UserHelperService } from '../../../core/services/utils/user-helper.service';
import { Observable, of, throwError } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('TaskDialog', () => {
  let component: TaskDialog;
  let fixture: ComponentFixture<TaskDialog>;
  let mockDialogRef: any;
  let mockTaskService: any;
  let mockAuthService: any;
  let mockStorageService: any;
  let mockMemberService: any;
  let mockUserHelper: any;

  async function setupTest(dialogData: any, memberReturn?: Observable<any>) {
    mockDialogRef = { close: jasmine.createSpy('close') };
    mockTaskService = jasmine.createSpyObj('TaskService', ['getTaskDetail', 'addComment', 'deleteAttachment', 'addAttachmentUrl']);
    mockStorageService = jasmine.createSpyObj('StorageService', ['uploadFile', 'deleteFile']);
    mockMemberService = jasmine.createSpyObj('MemberService', ['getMembers']);
    mockUserHelper = jasmine.createSpyObj('UserHelperService', ['getAvatarColor', 'getShortName']);

    mockAuthService = { 
      user: jasmine.createSpy('user').and.returnValue({ id: 'u1', email: 'test@example.com' }) 
    };

    mockTaskService.getTaskDetail.and.returnValue(of({ description: 'Full detail' }));
    mockTaskService.addComment.and.returnValue(of({ id: 'c1', content: 'New Comment' }));
    mockTaskService.deleteAttachment.and.returnValue(of(null));
    mockTaskService.addAttachmentUrl.and.returnValue(of({ id: 'a-new', fileName: 'test.jpg', fileUrl: 'http://supabase.url/file.png' }));
    mockStorageService.uploadFile.and.resolveTo('http://supabase.url/file.png');
    mockStorageService.deleteFile.and.resolveTo();

    mockMemberService.getMembers.and.returnValue(memberReturn || of([{ userId: 'u1', email: 'test@test.de' }]));

    await TestBed.configureTestingModule({
      imports: [TaskDialog, NoopAnimationsModule, HttpClientTestingModule],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: dialogData },
        { provide: TaskService, useValue: mockTaskService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: StorageService, useValue: mockStorageService },
        { provide: MemberService, useValue: mockMemberService },
        { provide: UserHelperService, useValue: mockUserHelper }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TaskDialog);
    component = fixture.componentInstance;
    fixture.detectChanges(); 
  }

  // Core & Init

  it('should load members and task details on init', async () => {
    await setupTest({ task: { id: 't1' }, columnId: 'c1', projectId: 'p123' });
    expect(mockMemberService.getMembers).toHaveBeenCalledWith('p123');
    expect(mockTaskService.getTaskDetail).toHaveBeenCalledWith('t1');
  });

  it('should log error if no projectId is provided', async () => {
    spyOn(console, 'error');
    await setupTest({ task: null, columnId: 'c1', projectId: null });
    expect(console.error).toHaveBeenCalledWith(jasmine.stringMatching('Keine projectId übergeben'));
  });

  it('should handle member loading error', async () => {
  const errorResponse = new Error('API Fail');
  
  const consoleSpy = spyOn(console, 'error');

  await setupTest(
    { task: null, columnId: 'c1', projectId: 'p123' }, 
    throwError(() => errorResponse)
  );

  expect(consoleSpy).toHaveBeenCalledWith('Fehler beim Laden der Member', errorResponse);
});

  // UI
  
  it('should identify image extensions correctly', async () => {
    await setupTest({ projectId: 'p1' });
    expect(component.isImage('test.PNG')).toBeTrue();
    expect(component.isImage('document.pdf')).toBeFalse();
  });

  // Comments

  it('should add a comment and update UI locally', async () => {
    await setupTest({ task: { id: 't1', comments: [] }, columnId: 'c1', projectId: 'p1' });
    component.newCommentContent = 'My new comment';
    component.addComment();

    expect(mockTaskService.addComment).toHaveBeenCalledWith('t1', 'My new comment', 'u1');
    expect(component.task.comments?.length).toBe(1);
    expect(component.newCommentContent).toBe('');
  });

  it('should handle comment error', async () => {
    await setupTest({ task: { id: 't1' }, projectId: 'p1' });
    mockTaskService.addComment.and.returnValue(throwError(() => new Error('Error')));
    spyOn(console, 'error');
    component.newCommentContent = 'Error Test';
    component.addComment();
    expect(console.error).toHaveBeenCalledWith(jasmine.stringMatching('Fehler beim Kommentieren'), jasmine.any(Error));
  });

  // Attachments

  it('should handle backend error after successful supabase upload', async () => {
    await setupTest({ task: { id: 't1' }, projectId: 'p1' });
    mockTaskService.addAttachmentUrl.and.returnValue(throwError(() => new Error('DB Error')));
    spyOn(window, 'alert');

    await component.onFileSelected({ target: { files: [new File([], 'test.jpg')] } });

    expect(window.alert).toHaveBeenCalledWith(jasmine.stringMatching('Link konnte nicht im Task gespeichert werden'));
    expect(component.isLoadingDetails).toBeFalse();
  });

  it('should handle download via fetch and fallback on error', fakeAsync(async () => {
    await setupTest({ task: null, projectId: 'p1' });
    spyOn(window, 'fetch').and.returnValue(Promise.reject('Network error'));
    const openSpy = spyOn(window, 'open');

    component.downloadFile({ fileName: 'test.jpg', fileUrl: 'http://test.url' } as any);
    tick();
    expect(openSpy).toHaveBeenCalledWith('http://test.url', '_blank');
  }));

  // Delete

  it('should delete attachment if confirmed and handle storage error gracefully', fakeAsync(async () => {
    await setupTest({ 
      task: { 
        id: 't1', 
        // WICHTIG: fileName muss hier dabei sein!
        attachments: [{ id: 'a1', fileName: 'test.jpg', fileUrl: 'url' }] 
      }, 
      projectId: 'p1' 
    });
    
    spyOn(window, 'confirm').and.returnValue(true);
    spyOn(console, 'warn');
    mockStorageService.deleteFile.and.rejectWith(new Error('S3 Error'));

    component.onDeleteAttachment({ id: 'a1', fileName: 'test.jpg', fileUrl: 'url' } as any);
    
    tick();
    fixture.detectChanges();

    expect(mockTaskService.deleteAttachment).toHaveBeenCalled();
    expect(console.warn).toHaveBeenCalledWith(jasmine.stringMatching('Datei konnte nicht aus Storage gelöscht werden'), jasmine.any(Error));
    expect(component.task.attachments?.length).toBe(0);
  }));
});