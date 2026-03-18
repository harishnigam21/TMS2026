import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "@/types/user";

interface UserState {
  userInfo: User | null;
  loginStatus: string;
}

const initialState: UserState = {
  userInfo: null,
  loginStatus: 'loading',
};
const UserSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      const data = action.payload;
      state.userInfo = data;
    },
    setLoginStatus: (state, action: PayloadAction<string>) => {
      state.loginStatus = action.payload;
    },
  },
});
export const { setUser, setLoginStatus } = UserSlice.actions;
export default UserSlice.reducer;
