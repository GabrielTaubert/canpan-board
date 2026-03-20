export interface Project {
  id: string;
  name: string;
  members: string[];
}

export type MemberRole = 'OWNER' | 'MEMBER';

export interface Member {
  userId: string;
  email: string;
  role: MemberRole;
}
