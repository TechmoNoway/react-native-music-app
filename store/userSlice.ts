import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UserState {
  user: { username: string; email: string } | null;
  isLoggedIn: boolean;
}

const initialState: UserState = {
  user: null,
  isLoggedIn: false,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    login: (
      state,
      action: PayloadAction<{ usernameOrEmail: string; password: string }>
    ) => {
      const { usernameOrEmail } = action.payload;
      if (usernameOrEmail.includes("@")) {
        state.user = { username: "", email: usernameOrEmail };
      } else {
        state.user = { username: usernameOrEmail, email: "" };
      }
      state.isLoggedIn = true;
    },
    logout: (state) => {
      state.user = null;
      state.isLoggedIn = false;
    },
  },
});

export const { login, logout } = userSlice.actions;
export default userSlice.reducer;
