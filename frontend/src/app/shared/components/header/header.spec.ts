import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { Header } from './header';
import { AuthService } from '../../../core/services/auth.service';

describe('Header', () => {
  let component: Header;
  let fixture: ComponentFixture<Header>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let router: Router;

  beforeEach(async () => {
    mockAuthService = jasmine.createSpyObj('AuthService', ['logout']);

    await TestBed.configureTestingModule({
      imports: [Header],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: mockAuthService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Header);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the logout button', () => {
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('.logout-btn');
    expect(button).toBeTruthy();
    expect(button.textContent?.trim()).toBe('Logout');
  });

  it('should call authService.logout and navigate to /login when logout() is called', () => {
    spyOn(router, 'navigate');
    component.logout();
    expect(mockAuthService.logout).toHaveBeenCalledOnceWith();
    expect(router.navigate).toHaveBeenCalledOnceWith(['/login']);
  });

  it('should trigger logout() when the logout button is clicked', () => {
    spyOn(component, 'logout');
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('.logout-btn');
    button.click();
    expect(component.logout).toHaveBeenCalled();
  });
});
