import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface User {
  id: number | string;
  usernameOrEmail?: string;
  name: string;
  email: string;
  username?: string;
  avatar?: string;
  loginTime?: string;
  loginMethod?: string;
}

interface LoginPayload {
  usernameOrEmail: string;
  password: string;
}

interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const initialState: UserState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    login: (state, action: PayloadAction<LoginPayload | User>) => {
      // Nếu payload có password, đó là login request
      if ("password" in action.payload) {
        // Process login với usernameOrEmail và password
        const { usernameOrEmail } = action.payload;
        state.user = {
          id: Date.now(),
          usernameOrEmail,
          name: usernameOrEmail.includes("@")
            ? usernameOrEmail.split("@")[0]
            : usernameOrEmail,
          email: usernameOrEmail.includes("@")
            ? usernameOrEmail
            : `${usernameOrEmail}@example.com`,
          loginTime: new Date().toISOString(),
          loginMethod: "email",
        };
      } else {
        // Nếu payload là User object hoàn chỉnh
        state.user = action.payload;
      }
      state.isAuthenticated = true;
      state.isLoading = false;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.isLoading = false;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
  },
});

export const { login, logout, setLoading, updateUser } = userSlice.actions;
export default userSlice.reducer;
