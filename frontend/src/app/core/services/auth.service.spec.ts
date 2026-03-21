import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from '../services/auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return false for isAuthenticated when no token exists', () => {
    expect(service.isAuthenticated()).toBeFalse();
  });

  it('should call login API and store auth data on success', () => {
    const mockResponse = {
      accessToken: 'test-access-token',
      refreshToken: 'test-refresh-token',
      userId: 'user-123',
      email: 'test@example.com',
      tokenType: 'Bearer',
      expiresIn: 3600
    };

    service.login({ email: 'test@example.com', password: 'password123' }).subscribe();

    const req = httpMock.expectOne('/api/auth/login');
    req.flush(mockResponse);

    expect(localStorage.getItem('accessToken')).toBe('test-access-token');
    expect(localStorage.getItem('refreshToken')).toBe('test-refresh-token');
    expect(localStorage.getItem('user')).toContain('user-123');
  });

  it('should call register API and store auth data on success', () => {
    const mockResponse = {
      accessToken: 'register-access-token',
      refreshToken: 'register-refresh-token',
      userId: 'user-456',
      email: 'new@example.com',
      tokenType: 'Bearer',
      expiresIn: 3600
    };

    service.register({ email: 'new@example.com', password: 'password123' }).subscribe();

    const req = httpMock.expectOne('/api/auth/register');
    req.flush(mockResponse);

    expect(localStorage.getItem('accessToken')).toBe('register-access-token');
    expect(localStorage.getItem('refreshToken')).toBe('register-refresh-token');
  });

  it('should clear localStorage on logout', () => {
    localStorage.setItem('accessToken', 'test-token');
    localStorage.setItem('refreshToken', 'test-refresh');
    localStorage.setItem('user', '{"id":"user-123"}');

    service.logout();

    expect(localStorage.getItem('accessToken')).toBeNull();
    expect(localStorage.getItem('refreshToken')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
  });

  it('should call getCurrentUser API', () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      createdAt: '2024-01-01'
    };

    service.getCurrentUser().subscribe(user => {
      expect(user).toEqual(mockUser);
    });

    const req = httpMock.expectOne('/api/auth/me');
    req.flush(mockUser);
  });

  it('should return null from getToken when no token stored', () => {
    localStorage.clear();
    expect(service.getToken()).toBeNull();
  });

  it('should call updateProfile API and return updated user', () => {
    const mockUser = {
      id: 'user-1',
      email: 'test@example.com',
      createdAt: '2024-01-01',
      displayName: 'John Doe',
    };

    service.updateProfile('John Doe').subscribe(user => {
      expect(user.displayName).toBe('John Doe');
    });

    const req = httpMock.expectOne('/api/auth/profile');
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ displayName: 'John Doe' });
    req.flush(mockUser);
  });

  it('should load token and user from localStorage on initialization', () => {
    localStorage.setItem('accessToken', 'stored-token');
    localStorage.setItem('user', JSON.stringify({ id: 'stored-user', email: 'stored@test.com' }));

    const newService = new AuthService(TestBed.inject(HttpClientTestingModule as any));
    expect(newService.getToken()).toBe('stored-token');
  });
});
