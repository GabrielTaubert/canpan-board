export interface Task {
  id: string;
  title: string;
  description: string;
  columnId: string;    // Wichtig für den Move-Request
  columnName?: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  storypoints?: number;
  assignedTo?: string;
  createdAt?: string;
  updatedAt?: string; 
  label?: TaskLabel;
  attachments?: TaskAttachment[];
  comments?: TaskComment[];
}

export interface TaskLabel {
  id: string;
  labelText: string;
  color: string;
}

export interface TaskAttachment {
  id: string;
  fileName: string;
  fileUrl: string;
}

export interface TaskComment {
  id: string;
  userId: string;
  authorName: string;
  content: string;
  createdAt: string;
}