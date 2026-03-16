import { Task } from "@/types/task";
import { createSlice } from "@reduxjs/toolkit";

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
    setTask: (state, action) => {
      const data = action.payload.data;
      state.tasks = data;
    },
    addTask: (state, action) => {
      state.tasks.push(action.payload);
    },
  },
});
export const { setTask, addTask } = TaskSlice.actions;
export default TaskSlice.reducer;
