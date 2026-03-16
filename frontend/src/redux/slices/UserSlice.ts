import { createSlice } from "@reduxjs/toolkit";
import { User } from "@/types/user";

interface UserState {
  userInfo: User | null;
  loginStatus: boolean;
}

const initialState: UserState = {
  userInfo: null,
  loginStatus: false,
};
const UserSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action) => {
      const data = action.payload.data;
      state.userInfo = data;
    },
    setLoginStatus: (state, action) => {
      state.loginStatus = action.payload.data;
    },
  },
});
export const { setUser, setLoginStatus } = UserSlice.actions;
export default UserSlice.reducer;
