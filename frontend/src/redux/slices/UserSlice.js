import { createSlice } from "@reduxjs/toolkit";
const UserSlice = createSlice({
  name: "user",
  initialState: {
    userInfo: null,
    loginStatus: false,
  },
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
