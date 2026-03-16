import { Task } from "@/types/task";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface TaskState {
  tasks: Task[];
}

const initialState: TaskState = {
  tasks: [],
};

const TaskSlice = createSlice({
  name: "task",
  initialState,
  reducers: {
    setTask: (state, action: PayloadAction<Task[]>) => {
      state.tasks = action.payload;
    },
    addTask: (state, action: PayloadAction<Task>) => {
      state.tasks.push(action.payload);
    },
    updateTask: (state, action: PayloadAction<Task>) => {
      state.tasks = state.tasks.map((item) => {
        if (item.id == action.payload.id) {
          return { ...item, completed: action.payload.completed };
        } else {
          return item;
        }
      });
    },
    deleteTask: (state, action: PayloadAction<number>) => {
      state.tasks = state.tasks.filter((item) => item.id != action.payload);
    },
  },
});
export const { setTask, addTask, updateTask, deleteTask } = TaskSlice.actions;
export default TaskSlice.reducer;
