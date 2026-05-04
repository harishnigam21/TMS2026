import { Pagination } from "@/types/pagination";
import { Note, Task } from "@/types/task";
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
          updatedAt: action.payload.updatedAt,
        };
      }
    },
    starTask: (state, action: PayloadAction<Task>) => {
      const index = state.tasks.findIndex(
        (item) => item.id === action.payload.id,
      );

      if (index !== -1) {
        state.tasks[index] = {
          ...state.tasks[index],
          star: action.payload.star,
          updatedAt: action.payload.updatedAt,
        };
      }
    },
    deleteTask: (state, action: PayloadAction<number>) => {
      state.tasks = state.tasks.filter((item) => item.id != action.payload);
    },
    setPagination: (state, action: PayloadAction<Pagination>) => {
      state.pagination = action.payload;
    },
    addNote: (state, action: PayloadAction<Note>) => {
      const index = state.tasks.findIndex(
        (item) => item.id === action.payload.taskId,
      );

      if (index !== -1) {
        state.tasks[index] = {
          ...state.tasks[index],
          updatedAt: action.payload.updatedAt,
          notes: [...state.tasks[index].notes, action.payload],
        };
      }
    },
    updateNote: (state, action: PayloadAction<Note>) => {
      const index = state.tasks.findIndex(
        (item) => item.id === action.payload.taskId,
      );

      if (index !== -1) {
        state.tasks[index] = {
          ...state.tasks[index],
          updatedAt: action.payload.updatedAt,
          notes: state.tasks[index].notes.map((item) => {
            if (item.id == action.payload.id) {
              return action.payload;
            } else {
              return item;
            }
          }),
        };
      }
    },
    deleteNote: (state, action: PayloadAction<Note>) => {
      const index = state.tasks.findIndex(
        (item) => item.id === action.payload.taskId,
      );

      if (index !== -1) {
        state.tasks[index] = {
          ...state.tasks[index],
          updatedAt: action.payload.updatedAt,
          notes: state.tasks[index].notes.filter((item) => {
            if (item.id != action.payload.id) {
              return item;
            }
          }),
        };
      }
    },
    markNote: (state, action: PayloadAction<Note>) => {
      const index = state.tasks.findIndex(
        (item) => item.id === action.payload.taskId,
      );

      if (index !== -1) {
        state.tasks[index] = {
          ...state.tasks[index],
          updatedAt: action.payload.updatedAt,
          notes: state.tasks[index].notes.map((item) => {
            if (item.id == action.payload.id) {
              return action.payload;
            } else {
              return item;
            }
          }),
        };
      }
    },
  },
});
export const {
  setTask,
  addTask,
  updateTask,
  starTask,
  deleteTask,
  setPagination,
  addNote,
  updateNote,
  deleteNote,
  markNote,
} = TaskSlice.actions;
export default TaskSlice.reducer;
