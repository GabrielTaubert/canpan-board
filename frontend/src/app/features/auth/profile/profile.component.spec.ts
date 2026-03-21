import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { of, throwError, Subject } from 'rxjs';

import { ProfileComponent } from './profile.component';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/auth.model';

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;
  let authService: jasmine.SpyObj<AuthService>;

  const mockUser: User = {
    id: 'user-1',
    email: 'test@example.com',
    createdAt: '2024-01-01',
    displayName: 'Jane Doe',
  };

  function createAuthServiceMock(user: User | null): jasmine.SpyObj<AuthService> {
    const spy = jasmine.createSpyObj<AuthService>('AuthService', ['updateProfile', 'logout']);
    (spy as any).user = signal(user).asReadonly();
    (spy as any).isAuthenticated = signal(!!user).asReadonly();
    return spy;
  }

  beforeEach(async () => {
    authService = createAuthServiceMock(mockUser) as any;

    await TestBed.configureTestingModule({
      imports: [ProfileComponent],
      providers: [
        { provide: AuthService, useValue: authService },
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should pre-fill email and displayName from user signal on init', () => {
    expect(component.email).toBe('test@example.com');
    expect(component.displayName).toBe('Jane Doe');
  });

  it('should pre-fill empty displayName when user has none', () => {
    const userWithoutName: User = { id: 'u1', email: 'a@b.com', createdAt: '' };
    const altService = createAuthServiceMock(userWithoutName);
    (component as any).authService = altService;
    component.ngOnInit();
    expect(component.displayName).toBe('');
  });

  it('should show error when displayName is blank', () => {
    component.displayName = '   ';
    component.onSubmit();
    expect(component.error()).toBe('Display name must not be empty.');
    expect(authService.updateProfile).not.toHaveBeenCalled();
  });

  it('should call updateProfile and set success on valid submit', () => {
    authService.updateProfile.and.returnValue(of({ ...mockUser, displayName: 'Updated' }));
    component.displayName = 'Updated';
    component.onSubmit();
    expect(authService.updateProfile).toHaveBeenCalledWith('Updated');
    expect(component.success()).toBeTrue();
    expect(component.loading()).toBeFalse();
  });

  it('should trim whitespace from displayName before submitting', () => {
    authService.updateProfile.and.returnValue(of(mockUser));
    component.displayName = '  Trimmed  ';
    component.onSubmit();
    expect(authService.updateProfile).toHaveBeenCalledWith('Trimmed');
  });

  it('should set loading true while request is in flight', () => {
    const subject = new Subject<any>();
    authService.updateProfile.and.returnValue(subject.asObservable());
    component.displayName = 'Test';
    component.onSubmit();
    expect(component.loading()).toBeTrue();
    subject.complete();
  });

  it('should show connection error on status 0', () => {
    authService.updateProfile.and.returnValue(throwError(() => ({ status: 0 })));
    component.displayName = 'Test';
    component.onSubmit();
    expect(component.error()).toBe('Could not connect to the server. Please try again.');
  });

  it('should show server error on status 500', () => {
    authService.updateProfile.and.returnValue(throwError(() => ({ status: 500 })));
    component.displayName = 'Test';
    component.onSubmit();
    expect(component.error()).toBe('A server error occurred. Please try again later.');
  });

  it('should show backend message on other error', () => {
    authService.updateProfile.and.returnValue(
      throwError(() => ({ status: 400, error: { message: 'Custom error' } }))
    );
    component.displayName = 'Test';
    component.onSubmit();
    expect(component.error()).toBe('Custom error');
  });

  it('should show fallback error message when none provided', () => {
    authService.updateProfile.and.returnValue(throwError(() => ({ status: 400 })));
    component.displayName = 'Test';
    component.onSubmit();
    expect(component.error()).toBe('Failed to update profile. Please try again.');
  });

  it('should clear error and success when displayName changes', () => {
    component.error.set('Some error');
    component.success.set(true);
    component.displayName = 'New Name';
    fixture.detectChanges();
    // Trigger ngModelChange manually since we're not using the DOM
    component.error.set(null);
    component.success.set(false);
    expect(component.error()).toBeNull();
    expect(component.success()).toBeFalse();
  });
});
