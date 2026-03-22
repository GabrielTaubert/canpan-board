export interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  storypoints?: number;
  columnId?: string;    // Wichtig für den Move-Request
  assignedTo?: any;     // Später ein User-Objekt
  
  // Diese Felder kommen nur im DetailDto vor:
  label?: TaskLabel;
  attachments?: TaskAttachment[];
  comments?: TaskComment[];
  createdAt?: string;
  updatedAt?: string;
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
  createdAt: string; // ISO-String vom Backend
}