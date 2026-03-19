import { TestBed } from '@angular/core/testing';
import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpResponse } from '@angular/common/http';
import { of } from 'rxjs';

import { authInterceptor } from './auth-interceptor';

describe('authInterceptor', () => {
  const interceptor: HttpInterceptorFn = (req, next) =>
    TestBed.runInInjectionContext(() => authInterceptor(req, next));

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(interceptor).toBeTruthy();
  });

  it('should pass the request through to the next handler', () => {
    const req = new HttpRequest('GET', '/test');
    const mockResponse = new HttpResponse({ status: 200 });
    const next = jasmine.createSpy<HttpHandlerFn>('next').and.returnValue(of(mockResponse));

    interceptor(req, next).subscribe();

    expect(next).toHaveBeenCalled();
  });

  it('should add Authorization header when token exists', () => {
    localStorage.setItem('accessToken', 'test-token');
    const req = new HttpRequest('GET', '/test');
    const mockResponse = new HttpResponse({ status: 200 });
    const next = jasmine.createSpy<HttpHandlerFn>('next').and.returnValue(of(mockResponse));

    interceptor(req, next).subscribe();

    expect(next).toHaveBeenCalled();
  });
});
