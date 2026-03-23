import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ProjectDashboard } from './dashboard';
import { DashboardService } from '../../../../core/services/dashboard.service';
import { MemberService } from '../../../../core/services/member';
import { UserHelperService } from '../../../../core/services/utils/user-helper.service';
import { of, throwError } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { DashboardProgress, UserStats } from '../../../../core/models/dashboard-model';
import { Member } from '../../../../core/models/project.model';

describe('ProjectDashboard', () => {
  let component: ProjectDashboard;
  let fixture: ComponentFixture<ProjectDashboard>;
  let mockDashboardService: jasmine.SpyObj<DashboardService>;
  let mockMemberService: jasmine.SpyObj<MemberService>;
  let mockUserHelper: jasmine.SpyObj<UserHelperService>;

  const mockProjectId = 'p123';

  beforeEach(async () => {
    mockDashboardService = jasmine.createSpyObj('DashboardService', [
      'getUserStats',
      'startCalculation',
      'getJobStatus'
    ]);
    mockMemberService = jasmine.createSpyObj('MemberService', ['getMembers']);
    // UserHelper hängen wir meist als Mock rein, falls er komplexe Logik hat
    mockUserHelper = jasmine.createSpyObj('UserHelperService', ['getAvatarColor', 'getShortName']);

    // Default Mocks
    mockDashboardService.getUserStats.and.returnValue(of([]));
    mockDashboardService.startCalculation.and.returnValue(of({ jobId: 'job-1' }));
    mockDashboardService.getJobStatus.and.returnValue(of({ 
      progress: 0, 
      status: 'RUNNING', 
      result: null 
    }));
    mockMemberService.getMembers.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [ProjectDashboard, NoopAnimationsModule],
      providers: [
        { provide: DashboardService, useValue: mockDashboardService },
        { provide: MemberService, useValue: mockMemberService },
        { provide: UserHelperService, useValue: mockUserHelper }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectDashboard);
    component = fixture.componentInstance;
    component.projectId = mockProjectId;
  });

  it('should load initial data including members on init', () => {
    fixture.detectChanges();
    expect(mockMemberService.getMembers).toHaveBeenCalledWith(mockProjectId);
    expect(mockDashboardService.getUserStats).toHaveBeenCalledWith(mockProjectId);
  });

  describe('Member Logic', () => {
    it('should return the correct email for a known userId', () => {
      component.members = [
        { userId: 'u1', email: 'elias@test.de' } as Member,
        { userId: 'u2', email: 'admin@test.de' } as Member
      ];

      expect(component.getUserEmail('u1')).toBe('elias@test.de');
    });

    it('should return "Unbekannter User" if member is not found', () => {
      component.members = [];
      expect(component.getUserEmail('unknown')).toBe('Unbekannter User');
    });
  });

  it('should poll job status and update progress', fakeAsync(() => {
    mockDashboardService.startCalculation.and.returnValue(of({ jobId: 'job-1' }));
    mockDashboardService.getJobStatus.and.returnValue(of({ 
      progress: 50, 
      status: 'RUNNING', 
      result: null 
    } as DashboardProgress));

    fixture.detectChanges(); // ngOnInit
    tick(2000); 
    expect(component.calculationProgress).toBe(50);

    mockDashboardService.getJobStatus.and.returnValue(of({ 
      progress: 100, 
      status: 'COMPLETED', 
      result: [{ columnName: 'Done', taskCount: 1, storyPointsSum: 5 }] 
    } as DashboardProgress));

    tick(2000);
    expect(component.isCalculating).toBeFalse();
    expect(component.columnStats.length).toBe(1);
    
    component.ngOnDestroy();
  }));

  it('should unsubscribe on destroy', fakeAsync(() => {
    fixture.detectChanges(); 
    // Wir greifen auf das private Member zu (daher ['pollingSub'])
    const subSpy = spyOn(component['pollingSub']!, 'unsubscribe').and.callThrough();
    component.ngOnDestroy();
    expect(subSpy).toHaveBeenCalled();
  }));
});