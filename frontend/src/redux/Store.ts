import { configureStore } from "@reduxjs/toolkit";
import UserSlice from "./slices/UserSlice";
import TaskSlice from "./slices/TaskSlice";

export const store = configureStore({
  reducer: {
    user: UserSlice,
    task: TaskSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;