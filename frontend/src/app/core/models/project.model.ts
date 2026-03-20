export interface Project {
  id: string;
  name: string;
  members: string[];
  updatedAt: string;
  isOwner: boolean;
}

export type MemberRole = 'OWNER' | 'MEMBER';

export interface Member {
  userId: string;
  email: string;
  role: MemberRole;
}
