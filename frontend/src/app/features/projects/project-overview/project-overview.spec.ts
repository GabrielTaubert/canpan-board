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

  const mockProjects: Project[] = [
    { id: '1', name: 'Project Alpha', members: ['alice@test.com'] },
    { id: '2', name: 'Project Beta', members: ['bob@test.com', 'carol@test.com'] }
  ];

  beforeEach(async () => {
    mockProjectService = jasmine.createSpyObj('ProjectService', [
      'getProjects',
      'createProject',
      'deleteProject'
    ]);
    mockProjectService.getProjects.and.returnValue(of(mockProjects));
    mockProjectService.createProject.and.returnValue(
      of({ id: '3', name: 'New Project', members: ['alice@test.com'] })
    );
    mockProjectService.deleteProject.and.returnValue(of(void 0));

    await TestBed.configureTestingModule({
      imports: [ProjectOverview, RouterTestingModule],
      providers: [
        { provide: ProjectService, useValue: mockProjectService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectOverview);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load projects on init', () => {
    expect(mockProjectService.getProjects).toHaveBeenCalled();
    expect(component.projects).toEqual(mockProjects);
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

  it('should remove project from list when deleting', () => {
    component.deleteProject('1');

    expect(mockProjectService.deleteProject).toHaveBeenCalledWith('1');
    expect(component.projects.find(p => p.id === '1')).toBeUndefined();
  });

  it('should navigate to project board when openProject is called', () => {
    const router = TestBed.inject(Router);
    const navigateSpy = spyOn(router, 'navigate');

    const projectId = '123';
    component.openProject(projectId);

    expect(navigateSpy).toHaveBeenCalledWith(['/project', projectId, 'board']);
  });
});
