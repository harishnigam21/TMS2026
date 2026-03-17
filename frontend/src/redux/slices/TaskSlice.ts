import { Pagination } from "@/types/pagination";
import { Task } from "@/types/task";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface TaskState {
  tasks: Task[];
  pagination: Pagination | null;
}

const initialState: TaskState = {
  tasks: [],
  pagination: null,
};

const TaskSlice = createSlice({
  name: "task",
  initialState,
  reducers: {
    setTask: (state, action: PayloadAction<Task[]>) => {
      state.tasks = action.payload;
    },
    addTask: (state, action: PayloadAction<Task>) => {
      state.tasks.unshift(action.payload);
    },
    updateTask: (state, action: PayloadAction<Task>) => {
      const index = state.tasks.findIndex(
        (item) => item.id === action.payload.id,
      );

      if (index !== -1) {
        state.tasks[index] = {
          ...state.tasks[index],
          completed: action.payload.completed,
        };
      }
    },
    deleteTask: (state, action: PayloadAction<number>) => {
      state.tasks = state.tasks.filter((item) => item.id != action.payload);
    },
    setPagination: (state, action: PayloadAction<Pagination>) => {
      state.pagination = action.payload;
    },
    addNote: (state, action: PayloadAction<{ id: number; note: string }>) => {
      const index = state.tasks.findIndex(
        (item) => item.id === action.payload.id,
      );

      if (index !== -1) {
        state.tasks[index] = {
          ...state.tasks[index],
          notes: [...state.tasks[index].notes, action.payload.note],
        };
      }
    },
  },
});
export const {
  setTask,
  addTask,
  updateTask,
  deleteTask,
  setPagination,
  addNote,
} = TaskSlice.actions;
export default TaskSlice.reducer;
