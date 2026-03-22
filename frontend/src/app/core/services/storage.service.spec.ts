import { TestBed } from '@angular/core/testing';
import { StorageService } from './storage.service';

describe('StorageService', () => {
  let service: StorageService;
  let supabaseSpy: any;
  let storageFromSpy: any;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [StorageService]
    });
    service = TestBed.inject(StorageService);

    storageFromSpy = {
      upload: jasmine.createSpy('upload'),
      getPublicUrl: jasmine.createSpy('getPublicUrl'),
      remove: jasmine.createSpy('remove')
    };

    supabaseSpy = {
      storage: {
        from: jasmine.createSpy('from').and.returnValue(storageFromSpy)
      }
    };

    (service as any).supabase = supabaseSpy;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('uploadFile', () => {
    it('should upload a file and return the public URL', async () => {
      const mockFile = new File(['content'], 'test.png', { type: 'image/png' });
      const mockUploadResponse = { data: { path: 'task1/123_test.png' }, error: null };
      const mockUrlResponse = { data: { publicUrl: 'http://supabase.com/test.png' } };

      storageFromSpy.upload.and.resolveTo(mockUploadResponse);
      storageFromSpy.getPublicUrl.and.returnValue(mockUrlResponse);

      const url = await service.uploadFile(mockFile, 'task1');

      expect(url).toBe('http://supabase.com/test.png');
      expect(storageFromSpy.upload).toHaveBeenCalled();
      expect(supabaseSpy.storage.from).toHaveBeenCalledWith('task-attachments');
    });

    it('should throw an error if upload fails', async () => {
      const mockFile = new File(['content'], 'test.png');
      const mockError = new Error('Upload failed');
      
      storageFromSpy.upload.and.resolveTo({ data: null, error: mockError });

      await expectAsync(service.uploadFile(mockFile, 'task1')).toBeRejectedWith(mockError);
    });
  });

  describe('deleteFile', () => {
    const mockUrl = 'http://supabase.com/storage/v1/object/public/task-attachments/task1/test.png';

    it('should call remove with the correctly parsed file path', async () => {
      storageFromSpy.remove.and.resolveTo({ data: [{ name: 'test.png' }], error: null });

      await service.deleteFile(mockUrl);

      expect(supabaseSpy.storage.from).toHaveBeenCalledWith('task-attachments');
      expect(storageFromSpy.remove).toHaveBeenCalledWith(['task1/test.png']);
    });

    it('should return early if the URL is invalid', async () => {
      await service.deleteFile('http://wrong-url.com');
      expect(storageFromSpy.remove).not.toHaveBeenCalled();
    });

    it('should throw error and log it if removal fails', async () => {
      const mockError = new Error('Supabase Delete Error');
      storageFromSpy.remove.and.resolveTo({ data: null, error: mockError });
      
      const errorSpy = spyOn(console, 'error');

      await expectAsync(service.deleteFile(mockUrl)).toBeRejectedWith(mockError);
      expect(errorSpy).toHaveBeenCalledWith(jasmine.stringMatching('Supabase Storage Fehler'), mockError);
    });

    it('should log a warning if file was not found (data empty)', async () => {
      storageFromSpy.remove.and.resolveTo({ data: [], error: null });
      const warnSpy = spyOn(console, 'warn');

      await service.deleteFile(mockUrl);

      expect(warnSpy).toHaveBeenCalledWith(jasmine.stringMatching('nicht gefunden'));
    });
  });
});