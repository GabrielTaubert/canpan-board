import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

import { ProjectOverview } from './project-overview';
import { ProjectService } from '../../../core/services/project';
import { Project } from '../../../core/models/project.model';
import { Router } from '@angular/router';

describe('ProjectOverview', () => {
  let component: ProjectOverview;
  let fixture: ComponentFixture<ProjectOverview>;
  let mockProjectService: jasmine.SpyObj<ProjectService>;
  let mockProjects: Project[];

  beforeEach(async () => {
    // Recreate fresh objects each test to avoid cross-test mutation
    mockProjects = [
      { id: '1', name: 'Project Alpha', members: ['alice@test.com'], updatedAt: '2026-01-01T00:00:00Z', isOwner: true },
      { id: '2', name: 'Project Beta', members: ['bob@test.com', 'carol@test.com'], updatedAt: '2026-01-02T00:00:00Z', isOwner: false },
    ];

    mockProjectService = jasmine.createSpyObj('ProjectService', [
      'getProjects',
      'createProject',
      'updateProject',
      'deleteProject',
    ]);
    // Return a copy so component.projects !== mockProjects
    mockProjectService.getProjects.and.returnValue(of([...mockProjects]));
    mockProjectService.createProject.and.returnValue(
      of({ id: '3', name: 'New Project', members: ['alice@test.com'], updatedAt: '', isOwner: true })
    );
    mockProjectService.updateProject.and.returnValue(
      of({ ...mockProjects[0], name: 'Updated Name' })
    );
    mockProjectService.deleteProject.and.returnValue(of(void 0));

    await TestBed.configureTestingModule({
      imports: [ProjectOverview, RouterTestingModule],
      providers: [
        { provide: ProjectService, useValue: mockProjectService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectOverview);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load projects on init', () => {
    expect(mockProjectService.getProjects).toHaveBeenCalled();
    expect(component.projects.length).toBe(2);
    expect(component.projects[0].name).toBe('Project Alpha');
  });

  it('should render a card for each project', () => {
    const cards = fixture.nativeElement.querySelectorAll('.project-card');
    expect(cards.length).toBe(2);
  });

  it('should display project names in cards', () => {
    const cards = fixture.nativeElement.querySelectorAll('.project-card');
    expect(cards[0].querySelector('.project-name').textContent).toContain('Project Alpha');
    expect(cards[1].querySelector('.project-name').textContent).toContain('Project Beta');
  });

  it('should call createProject and reload list when creating a project', () => {
    component.newProjectName = 'New Project';
    component.createProject();

    expect(mockProjectService.createProject).toHaveBeenCalledWith('New Project');
    expect(mockProjectService.getProjects).toHaveBeenCalledTimes(2);
    expect(component.newProjectName).toBe('');
  });

  it('should not call createProject when project name is empty', () => {
    component.newProjectName = '   ';
    component.createProject();

    expect(mockProjectService.createProject).not.toHaveBeenCalled();
  });

  it('should trim whitespace from project name on create', () => {
    component.newProjectName = '  Trimmed  ';
    component.createProject();
    expect(mockProjectService.createProject).toHaveBeenCalledWith('Trimmed');
  });

  it('should remove project from list when deleting', () => {
    component.deleteProject('1');

    expect(mockProjectService.deleteProject).toHaveBeenCalledWith('1');
    expect(component.projects.find(p => p.id === '1')).toBeUndefined();
  });

  it('should navigate to project board when openProject is called', () => {
    const router = TestBed.inject(Router);
    const navigateSpy = spyOn(router, 'navigate');

    component.openProject('123');

    expect(navigateSpy).toHaveBeenCalledWith(['/project', '123', 'board']);
  });

  it('should navigate to members page when openMembers is called', () => {
    const router = TestBed.inject(Router);
    const navigateSpy = spyOn(router, 'navigate');

    component.openMembers('123');

    expect(navigateSpy).toHaveBeenCalledWith(['/project', '123', 'members']);
  });

  it('should set editingProjectId and editingName on startEdit', () => {
    component.startEdit(component.projects[0]);
    expect(component.editingProjectId).toBe('1');
    expect(component.editingName).toBe('Project Alpha');
  });

  it('should clear editing state on cancelEdit', () => {
    component.startEdit(component.projects[0]);
    component.cancelEdit();
    expect(component.editingProjectId).toBeNull();
    expect(component.editingName).toBe('');
  });

  it('should save edit and update the project in the list', () => {
    const updated: Project = { ...component.projects[0], name: 'Updated Name' };
    mockProjectService.updateProject.and.returnValue(of(updated));

    component.startEdit(component.projects[0]);
    component.editingName = 'Updated Name';
    component.saveEdit('1');

    expect(mockProjectService.updateProject).toHaveBeenCalledWith('1', 'Updated Name');
    expect(component.projects[0].name).toBe('Updated Name');
    expect(component.editingProjectId).toBeNull();
  });

  it('should trim whitespace from name on saveEdit', () => {
    const updated: Project = { ...component.projects[0], name: 'Trimmed Name' };
    mockProjectService.updateProject.and.returnValue(of(updated));

    component.startEdit(component.projects[0]);
    component.editingName = '  Trimmed Name  ';
    component.saveEdit('1');

    expect(mockProjectService.updateProject).toHaveBeenCalledWith('1', 'Trimmed Name');
  });

  it('should not save edit when editing name is blank', () => {
    component.startEdit(component.projects[0]);
    component.editingName = '   ';
    component.saveEdit('1');
    expect(mockProjectService.updateProject).not.toHaveBeenCalled();
  });
});
