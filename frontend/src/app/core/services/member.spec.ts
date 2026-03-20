import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { MemberService } from './member';
import { Member } from '../models/project.model';

describe('MemberService', () => {
  let service: MemberService;
  let httpMock: HttpTestingController;

  const mockMember: Member = { userId: 'user-1', email: 'member@test.com', role: 'MEMBER' };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(MemberService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get members for a project', () => {
    const members: Member[] = [mockMember];

    service.getMembers('proj-1').subscribe(result => {
      expect(result).toEqual(members);
    });

    const req = httpMock.expectOne('/api/projects/proj-1/members');
    expect(req.request.method).toBe('GET');
    req.flush(members);
  });

  it('should add a member to a project', () => {
    service.addMember('proj-1', 'member@test.com').subscribe(result => {
      expect(result).toEqual(mockMember);
    });

    const req = httpMock.expectOne('/api/projects/proj-1/members');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ email: 'member@test.com' });
    req.flush(mockMember);
  });

  it('should remove a member from a project', () => {
    service.removeMember('proj-1', 'user-1').subscribe();

    const req = httpMock.expectOne('/api/projects/proj-1/members/user-1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('should update a member role', () => {
    const updated: Member = { ...mockMember, role: 'OWNER' };

    service.updateRole('proj-1', 'user-1', 'OWNER').subscribe(result => {
      expect(result.role).toBe('OWNER');
    });

    const req = httpMock.expectOne('/api/projects/proj-1/members/user-1/role');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ role: 'OWNER' });
    req.flush(updated);
  });
});
