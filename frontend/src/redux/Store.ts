import { configureStore } from "@reduxjs/toolkit";
import { enableMapSet } from "immer";
import UserSlice from "./slices/UserSlice";
import TaskSlice from "./slices/TaskSlice";
enableMapSet();
export const store = configureStore({
  reducer: {
    user: UserSlice,
    task: TaskSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
