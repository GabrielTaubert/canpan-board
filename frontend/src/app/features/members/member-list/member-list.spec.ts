import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { signal } from '@angular/core';
import { of } from 'rxjs';

import { MemberList } from './member-list';
import { MemberService } from '../../../core/services/member';
import { AuthService } from '../../../core/services/auth.service';
import { Member } from '../../../core/models/project.model';

describe('MemberList', () => {
  let component: MemberList;
  let fixture: ComponentFixture<MemberList>;
  let memberService: jasmine.SpyObj<MemberService>;
  let authService: jasmine.SpyObj<AuthService>;
  let dialog: jasmine.SpyObj<MatDialog>;

  const mockMembers: Member[] = [
    { userId: 'user-1', email: 'owner@test.com', role: 'OWNER' },
    { userId: 'user-2', email: 'member@test.com', role: 'MEMBER' },
  ];

  function createAuthServiceMock(userId: string) {
    return {
      user: signal<{ id: string; email: string; createdAt: string } | null>({ id: userId, email: 'owner@test.com', createdAt: '' }).asReadonly(),
      isAuthenticated: signal(true).asReadonly(),
      logout: jasmine.createSpy('logout'),
      login: jasmine.createSpy('login'),
      register: jasmine.createSpy('register'),
      getToken: jasmine.createSpy('getToken'),
      getCurrentUser: jasmine.createSpy('getCurrentUser'),
    };
  }

  beforeEach(async () => {
    memberService = jasmine.createSpyObj('MemberService', ['getMembers', 'addMember', 'removeMember', 'updateRole']);
    authService = createAuthServiceMock('user-1') as any;
    dialog = jasmine.createSpyObj('MatDialog', ['open']);

    memberService.getMembers.and.returnValue(of(mockMembers));

    await TestBed.configureTestingModule({
      imports: [MemberList],
      providers: [
        { provide: MemberService, useValue: memberService },
        { provide: AuthService, useValue: authService },
        { provide: MatDialog, useValue: dialog },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: (key: string) => key === 'id' ? 'project-123' : null } } },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MemberList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load members on init and set projectId', () => {
    expect(component.projectId).toBe('project-123');
    expect(memberService.getMembers).toHaveBeenCalledWith('project-123');
    expect(component.members).toEqual(mockMembers);
  });

  it('should set isOwner true when current user has OWNER role', () => {
    expect(component.isOwner).toBeTrue();
  });

  it('should set isOwner false when current user has MEMBER role', () => {
    (component as any)['authService'] = createAuthServiceMock('user-2');
    component.loadMembers();
    expect(component.isOwner).toBeFalse();
  });

  it('should call removeMember and reload members', () => {
    memberService.removeMember.and.returnValue(of(undefined));
    component.removeMember('user-2');
    expect(memberService.removeMember).toHaveBeenCalledWith('project-123', 'user-2');
    expect(memberService.getMembers).toHaveBeenCalledTimes(2);
  });

  it('should toggle role from OWNER to MEMBER', () => {
    memberService.updateRole.and.returnValue(of({ ...mockMembers[0], role: 'MEMBER' }));
    component.toggleRole(mockMembers[0]);
    expect(memberService.updateRole).toHaveBeenCalledWith('project-123', 'user-1', 'MEMBER');
  });

  it('should toggle role from MEMBER to OWNER', () => {
    memberService.updateRole.and.returnValue(of({ ...mockMembers[1], role: 'OWNER' }));
    component.toggleRole(mockMembers[1]);
    expect(memberService.updateRole).toHaveBeenCalledWith('project-123', 'user-2', 'OWNER');
  });

  it('should open dialog and add member when email is returned', () => {
    memberService.addMember.and.returnValue(of({ userId: 'user-3', email: 'new@test.com', role: 'MEMBER' }));
    spyOn((component as any)['dialog'], 'open').and.returnValue({ afterClosed: () => of({ email: 'new@test.com' }) } as any);
    component.openAddMemberDialog();
    expect(memberService.addMember).toHaveBeenCalledWith('project-123', 'new@test.com');
  });

  it('should not add member when dialog is closed without email', () => {
    spyOn((component as any)['dialog'], 'open').and.returnValue({ afterClosed: () => of(null) } as any);
    component.openAddMemberDialog();
    expect(memberService.addMember).not.toHaveBeenCalled();
  });

  it('should not add member when dialog returns empty result', () => {
    spyOn((component as any)['dialog'], 'open').and.returnValue({ afterClosed: () => of({}) } as any);
    component.openAddMemberDialog();
    expect(memberService.addMember).not.toHaveBeenCalled();
  });
});
