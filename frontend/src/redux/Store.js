import { configureStore } from "@reduxjs/toolkit";
import UserSlice from "./slices/UserSlice";
const Store = configureStore({
  reducer: {
    user: UserSlice,
  },
});
export default Store;
