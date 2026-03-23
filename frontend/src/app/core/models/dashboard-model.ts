export interface ColumnStats {
  columnName: string;
  taskCount: number;
  storyPointsSum: number;
}

export interface UserStats {
  userId: string;
  totalStoryPoints: number;
  openTasksCount: number;
}

export interface DashboardProgress {
  progress: number;
  status: 'RUNNING' | 'COMPLETED';
  result: ColumnStats[] | null;
}