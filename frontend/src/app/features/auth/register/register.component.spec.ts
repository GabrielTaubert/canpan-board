import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError, Subject } from 'rxjs';

import { RegisterComponent } from './register.component';
import { AuthService } from '../../../core/services/auth.service';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: Router;

  const mockResponse = {
    accessToken: 'token',
    refreshToken: 'refresh',
    userId: 'user-1',
    email: 'test@example.com',
    tokenType: 'Bearer',
    expiresIn: 3600,
  };

  beforeEach(async () => {
    authService = jasmine.createSpyObj('AuthService', ['register']);

    await TestBed.configureTestingModule({
      imports: [RegisterComponent],
      providers: [
        { provide: AuthService, useValue: authService },
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show error when all fields are empty', () => {
    component.onSubmit();
    expect(component.error()).toBe('Please fill in all fields.');
  });

  it('should show error when passwords do not match', () => {
    component.email = 'test@example.com';
    component.password = 'password123';
    component.confirmPassword = 'different';
    component.onSubmit();
    expect(component.error()).toBe('Passwords do not match.');
  });

  it('should show error when password is too short', () => {
    component.email = 'test@example.com';
    component.password = '123';
    component.confirmPassword = '123';
    component.onSubmit();
    expect(component.error()).toBe('Password must be at least 6 characters.');
  });

  it('should call register and set success state on valid input', () => {
    authService.register.and.returnValue(of(mockResponse));
    component.email = 'test@example.com';
    component.password = 'password123';
    component.confirmPassword = 'password123';
    component.onSubmit();
    expect(authService.register).toHaveBeenCalledWith({ email: 'test@example.com', password: 'password123' });
    expect(component.success()).toBeTrue();
    expect(component.loading()).toBeFalse();
  });

  it('should navigate to login after 2 seconds on success', fakeAsync(() => {
    authService.register.and.returnValue(of(mockResponse));
    spyOn(router, 'navigate');
    component.email = 'test@example.com';
    component.password = 'password123';
    component.confirmPassword = 'password123';
    component.onSubmit();
    tick(2000);
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  }));

  it('should show connection error on status 0', () => {
    authService.register.and.returnValue(throwError(() => ({ status: 0 })));
    component.email = 'test@example.com';
    component.password = 'password123';
    component.confirmPassword = 'password123';
    component.onSubmit();
    expect(component.error()).toBe('Could not connect to the server. Please try again.');
  });

  it('should show duplicate email error on status 409', () => {
    authService.register.and.returnValue(throwError(() => ({ status: 409 })));
    component.email = 'test@example.com';
    component.password = 'password123';
    component.confirmPassword = 'password123';
    component.onSubmit();
    expect(component.error()).toBe('An account with this email already exists.');
  });

  it('should show server error on status 500', () => {
    authService.register.and.returnValue(throwError(() => ({ status: 500 })));
    component.email = 'test@example.com';
    component.password = 'password123';
    component.confirmPassword = 'password123';
    component.onSubmit();
    expect(component.error()).toBe('A server error occurred. Please try again later.');
  });

  it('should show backend message on other error status', () => {
    authService.register.and.returnValue(throwError(() => ({ status: 400, error: { message: 'Custom error' } })));
    component.email = 'test@example.com';
    component.password = 'password123';
    component.confirmPassword = 'password123';
    component.onSubmit();
    expect(component.error()).toBe('Custom error');
  });

  it('should show fallback message when no error message available', () => {
    authService.register.and.returnValue(throwError(() => ({ status: 400 })));
    component.email = 'test@example.com';
    component.password = 'password123';
    component.confirmPassword = 'password123';
    component.onSubmit();
    expect(component.error()).toBe('Registration failed. Please try again.');
  });

  it('should extract error from string body', () => {
    authService.register.and.returnValue(throwError(() => ({ status: 400, error: 'String error body' })));
    component.email = 'test@example.com';
    component.password = 'password123';
    component.confirmPassword = 'password123';
    component.onSubmit();
    expect(component.error()).toBe('String error body');
  });

  it('should clear error when clearError is called', () => {
    component.error.set('Some error');
    component.clearError();
    expect(component.error()).toBeNull();
  });

  it('should not throw when clearError is called with no error', () => {
    component.error.set(null);
    expect(() => component.clearError()).not.toThrow();
  });

  it('should set loading true while request is in flight', () => {
    const subject = new Subject<typeof mockResponse>();
    authService.register.and.returnValue(subject.asObservable());
    component.email = 'test@example.com';
    component.password = 'password123';
    component.confirmPassword = 'password123';
    component.onSubmit();
    expect(component.loading()).toBeTrue();
    subject.complete();
  });
});
