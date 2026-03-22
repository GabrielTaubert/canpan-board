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
    mockAuthService = { user: jasmine.createSpy('user').and.returnValue({ id: 'u1', email: 'test@example.com' }) };
    mockStorageService = jasmine.createSpyObj('StorageService', ['uploadFile', 'deleteFile']);

    mockTaskService.getTaskDetail.and.returnValue(of({ description: 'Full detail' }));
    mockTaskService.addComment.and.returnValue(of({ id: 'c1', content: 'New Comment', authorName: 'test@example.com' }));
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

  // Core & UI

  it('should get avatar color based on name hash', async () => {
    await setupTest({ task: null, columnId: 'c1' });
    const color1 = component.getAvatarColor('Elias');
    const color2 = component.getAvatarColor('Elias');
    const color3 = component.getAvatarColor('Other');
    expect(color1).toBe(color2);
    expect(color1).not.toBe(color3);
  });

  it('should parse short name from email', async () => {
    await setupTest({ task: null, columnId: 'c1' });
    expect(component.getShortName('max.mustermann@web.de')).toBe('max.mustermann');
    expect(component.getShortName(null)).toBe('Unbekannter User');
  });

  it('should handle error when loading task details', async () => {
    mockTaskService.getTaskDetail.and.returnValue(throwError(() => new Error('Load Error')));
    await setupTest({ task: { id: 't1' }, columnId: 'c1' });
    expect(component.isLoadingDetails).toBeFalse(); // Deckt Zeile 100 ab
  });

  // Comments

  it('should add a comment and update UI locally', async () => {
    await setupTest({ task: { id: 't1', comments: [] }, columnId: 'c1' });
    component.newCommentContent = 'My new comment';
    component.addComment();

    expect(mockTaskService.addComment).toHaveBeenCalledWith('t1', 'My new comment', 'u1');
    expect(component.task.comments?.length).toBe(1);
    expect(component.newCommentContent).toBe('');
  });

  it('should not add comment if content is empty or task id missing', async () => {
    await setupTest({ task: {}, columnId: 'c1' }); // Fehlende ID
    component.newCommentContent = '   ';
    component.addComment();
    expect(mockTaskService.addComment).not.toHaveBeenCalled();
  });

  it('should handle comment error', async () => {
    await setupTest({ task: { id: 't1' }, columnId: 'c1' });
    mockTaskService.addComment.and.returnValue(throwError(() => new Error('Error')));
    spyOn(console, 'error');
    component.newCommentContent = 'Error Test';
    component.addComment();
    expect(console.error).toHaveBeenCalled();
  });

  // Attachments & Downloads

  it('should handle backend error after successful supabase upload', async () => {
    await setupTest({ task: { id: 't1' }, columnId: 'c1' });
    mockTaskService.addAttachmentUrl.and.returnValue(throwError(() => new Error('DB Error')));
    spyOn(window, 'alert');

    await component.onFileSelected({ target: { files: [new File([], 'test.jpg')] } });

    expect(window.alert).toHaveBeenCalledWith(jasmine.stringMatching('Link konnte nicht im Task gespeichert werden'));
    expect(component.isLoadingDetails).toBeFalse();
  });

  it('should handle delete attachment error', async () => {
    await setupTest({ task: { id: 't1', attachments: [{id: 'a1', fileName: 'f'}] }, columnId: 'c1' });
    spyOn(window, 'confirm').and.returnValue(true);
    mockTaskService.deleteAttachment.and.returnValue(throwError(() => new Error('Delete Error')));
    spyOn(window, 'alert');

    component.onDeleteAttachment({id: 'a1', fileName: 'f'} as any);
    expect(window.alert).toHaveBeenCalled();
  });

  it('should trigger successful download via fetch blob', fakeAsync(async () => {
    await setupTest({ task: null, columnId: 'c1' });
    const mockBlob = new Blob(['content'], { type: 'text/plain' });
    
    // Wir mocken die fetch-API Kette
    spyOn(window, 'fetch').and.resolveTo({
      blob: () => Promise.resolve(mockBlob)
    } as Response);
    
    // Spies für die DOM-Manipulation beim Download
    const mockURL = 'blob:local-url';
    spyOn(window.URL, 'createObjectURL').and.returnValue(mockURL);
    spyOn(window.URL, 'revokeObjectURL');
    const linkSpy = jasmine.createSpyObj('a', ['click']);
    spyOn(document, 'createElement').and.returnValue(linkSpy);
    spyOn(document.body, 'appendChild');
    spyOn(document.body, 'removeChild');

    component.downloadFile({ fileName: 'test.txt', fileUrl: 'http://remote.url' } as any);
    
    tick();
    
    expect(window.fetch).toHaveBeenCalledWith('http://remote.url');
    expect(document.createElement).toHaveBeenCalledWith('a');
    expect(linkSpy.download).toBe('test.txt');
    expect(linkSpy.click).toHaveBeenCalled();
  }));

  it('should open image in new tab', async () => {
    await setupTest({ task: null, columnId: 'c1' });
    const spy = spyOn(window, 'open');
    component.openFullImage('http://test.url');
    expect(spy).toHaveBeenCalledWith('http://test.url', '_blank');
  });
});