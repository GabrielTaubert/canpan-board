import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { DashboardService } from './dashboard.service';
import { UserStats, DashboardProgress, ColumnStats } from '../models/dashboard-model';

describe('DashboardService', () => {
  let service: DashboardService;
  let httpMock: HttpTestingController;
  const projectId = 'proj-123';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [DashboardService]
    });
    service = TestBed.inject(DashboardService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getUserStats', () => {
    it('should return an array of UserStats', () => {
      const mockUserStats: UserStats[] = [
        { userId: 'u1', totalStoryPoints: 15, openTasksCount: 3 },
        { userId: 'u2', totalStoryPoints: 8, openTasksCount: 1 }
      ];

      service.getUserStats(projectId).subscribe(stats => {
        expect(stats.length).toBe(2);
        expect(stats[0].userId).toBe('u1');
        expect(stats[0].totalStoryPoints).toBe(15);
      });

      const req = httpMock.expectOne(`/api/projects/${projectId}/dashboard/user-stats`);
      expect(req.request.method).toBe('GET');
      req.flush(mockUserStats);
    });
  });

  describe('startCalculation', () => {
    it('should trigger a POST and return a jobId', () => {
      const mockResponse = { jobId: 'job-abc' };

      service.startCalculation(projectId).subscribe(res => {
        expect(res.jobId).toBe('job-abc');
      });

      const req = httpMock.expectOne(`/api/projects/${projectId}/dashboard/calculate`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({});
      req.flush(mockResponse);
    });
  });

  describe('getJobStatus', () => {
    it('should return DashboardProgress with ColumnStats when completed', () => {
      const jobId = 'job-abc';
      const mockColumnStats: ColumnStats[] = [
        { columnName: 'To Do', taskCount: 5, storyPointsSum: 20 },
        { columnName: 'Done', taskCount: 2, storyPointsSum: 10 }
      ];

      const mockProgress: DashboardProgress = {
        progress: 100,
        status: 'COMPLETED',
        result: mockColumnStats
      };

      service.getJobStatus(projectId, jobId).subscribe(progress => {
        expect(progress.status).toBe('COMPLETED');
        expect(progress.progress).toBe(100);
        expect(progress.result?.length).toBe(2);
        expect(progress.result?.[0].columnName).toBe('To Do');
      });

      const req = httpMock.expectOne(`/api/projects/${projectId}/dashboard/jobs/${jobId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockProgress);
    });

    it('should return DashboardProgress with null result when running', () => {
      const jobId = 'job-abc';
      const mockProgress: DashboardProgress = {
        progress: 45,
        status: 'RUNNING',
        result: null
      };

      service.getJobStatus(projectId, jobId).subscribe(progress => {
        expect(progress.status).toBe('RUNNING');
        expect(progress.result).toBeNull();
      });

      const req = httpMock.expectOne(`/api/projects/${projectId}/dashboard/jobs/${jobId}`);
      req.flush(mockProgress);
    });
  });
});