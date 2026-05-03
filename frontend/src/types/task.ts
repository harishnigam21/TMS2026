export interface Note {
  id: number;
  taskId: number;
  note: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}
export interface Task {
  id: number;
  title: string;
  completed: boolean;
  description: string;
  notes: Note[];
  createdAt: string;
  updatedAt: string;
}
