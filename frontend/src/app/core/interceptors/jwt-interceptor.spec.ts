import { TestBed } from '@angular/core/testing';
import { HttpClient, HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { JwtInterceptor } from '../interceptors/jwt-interceptor';

describe('JwtInterceptor', () => {
  let httpMock: HttpTestingController;
  let httpClient: HttpClient;

  // Initialisieren der Testdaten
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: HTTP_INTERCEPTORS,
          useClass: JwtInterceptor,
          multi: true,
        },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    });

    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    
    localStorage.clear();
  });

  // Immer sicherstellen, dass keine Requests offen bleiben
  afterEach(() => {
    httpMock.verify();
  });

  // Testen ob man authorisiert ist, wenn Token existiert
  it('should add Authorization header if token exists', () => {
    const mockToken = 'mein-super-geheimes-token';
    localStorage.setItem('token', mockToken);

    httpClient.get('/api/data').subscribe();

    const req = httpMock.expectOne('/api/data');
    
    expect(req.request.headers.has('Authorization')).toBeTrue();
    expect(req.request.headers.get('Authorization')).toBe(`Bearer ${mockToken}`);
    
    req.flush({});
  });

  // Testen ob man nicht authorisiert ist, wenn Token nicht existiert
  it('should NOT add Authorization header if token is missing', () => {
    localStorage.removeItem('token');

    httpClient.get('/api/data').subscribe();

    const req = httpMock.expectOne('/api/data');
    expect(req.request.headers.has('Authorization')).toBeFalse();
    
    req.flush({});
  });
});