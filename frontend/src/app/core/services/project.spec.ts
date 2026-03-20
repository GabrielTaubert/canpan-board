import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { ProjectService } from './project';
import { Project } from '../models/project.model';

describe('ProjectService', () => {
  let service: ProjectService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ProjectService]
    });
    service = TestBed.inject(ProjectService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get projects', () => {
    const mockProjects: Project[] = [
      { id: '1', name: 'Test Project', members: ['user@test.com'], updatedAt: '2026-01-01T00:00:00Z', isOwner: true }
    ];

    service.getProjects().subscribe(projects => {
      expect(projects).toEqual(mockProjects);
    });

    const req = httpMock.expectOne('/api/projects');
    expect(req.request.method).toBe('GET');
    req.flush(mockProjects);
  });

  it('should create a project', () => {
    const mockProject: Project = { id: '1', name: 'New Project', members: ['user@test.com'], updatedAt: '2026-01-01T00:00:00Z', isOwner: true };

    service.createProject('New Project').subscribe(project => {
      expect(project).toEqual(mockProject);
    });

    const req = httpMock.expectOne('/api/projects');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ name: 'New Project' });
    req.flush(mockProject);
  });

  it('should delete a project', () => {
    service.deleteProject('1').subscribe();

    const req = httpMock.expectOne('/api/projects/1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('should update a project name', () => {
    const mockProject: Project = { id: '1', name: 'Updated Name', members: ['user@test.com'], updatedAt: '2026-01-01T00:00:00Z', isOwner: true };

    service.updateProject('1', 'Updated Name').subscribe(project => {
      expect(project).toEqual(mockProject);
    });

    const req = httpMock.expectOne('/api/projects/1');
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ name: 'Updated Name' });
    req.flush(mockProject);
  });
});
