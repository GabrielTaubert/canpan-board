import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MainLayout } from './main-layout';
import { provideRouter, Router, NavigationEnd } from '@angular/router';
import { Subject } from 'rxjs';

describe('MainLayout', () => {
  let component: MainLayout;
  let fixture: ComponentFixture<MainLayout>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainLayout],
      providers: [
        provideRouter([])
      ]
    })
    .compileComponents();

    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(MainLayout);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Soll den Header nicht anzeigen, wenn der pfad eine auth route hat
  it('should hide header when navigating to an auth route', () => {
    const event = new NavigationEnd(1, '/auth/login', '/auth/login');
    (router.events as Subject<any>).next(event);

    expect(component.showHeader).toBeFalse();
  });

  // Soll den Header anzeigen, wenn der pfad eine nicht auth route hat
  it('should show header when navigating to a non-auth route', () => {
    const event = new NavigationEnd(1, '/dashboard', '/dashboard');
    (router.events as Subject<any>).next(event);

    expect(component.showHeader).toBeTrue();
  });
});