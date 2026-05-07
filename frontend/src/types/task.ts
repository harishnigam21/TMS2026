export interface Note {
  id: number;
  taskId: number;
  note: string;
  priority: number;
  prevPriority?: number;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}
export interface Task {
  id: number;
  title: string;
  completed: boolean;
  star: boolean;
  description: string;
  notes: Note[];
  noteCount: number;
  createdAt: string;
  updatedAt: string;
}
