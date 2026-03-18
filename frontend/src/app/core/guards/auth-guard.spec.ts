import { TestBed } from '@angular/core/testing';
import { CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

import { authGuard } from './auth-guard';

describe('authGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => authGuard(...guardParameters));

  let mockRouter: any;

  beforeEach(() => {
    mockRouter = {
      navigate: jasmine.createSpy('navigate')
    };
    
    localStorage.clear();
    
    TestBed.configureTestingModule({
      providers: [
        {
          provide: Router,
          useValue: mockRouter
        },
        {
          provide: AuthService,
          useValue: {
            isAuthenticated: () => false
          }
        }
      ],
    });
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });

  it('should allow activation when authenticated', () => {
    TestBed.overrideProvider(AuthService, {
      useValue: {
        isAuthenticated: () => true
      }
    });
    
    const route = {} as ActivatedRouteSnapshot;
    const state = { url: '/projects' } as RouterStateSnapshot;
    const result = executeGuard(route, state);
    expect(result).toBeTrue();
  });

  it('should deny activation and redirect to login when not authenticated', () => {
    const route = {} as ActivatedRouteSnapshot;
    const state = { url: '/projects' } as RouterStateSnapshot;
    const result = executeGuard(route, state);
    expect(result).toBeFalse();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
  });
});
