// src/store/authSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "./axiosInstance";

// Initial State
interface AuthState {
  admin: any;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isError: boolean;
  error: string | null;
}

const loadInitialState = (): AuthState => {
  try {
    const token = localStorage.getItem("token");
    const admin = JSON.parse(localStorage.getItem("admin") || "null");
    if (token && admin) {
      return {
        admin,
        token,
        isAuthenticated: true,
        isLoading: false,
        isError: false,
        error: null,
      };
    }
  } catch {
    localStorage.clear();
  }

  return {
    admin: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
    isError: false,
    error: null,
  };
};

// Login thunk (expects { username, password })
export const login = createAsyncThunk<
  { admin: any; token: string },
  { username: string; password: string },
  { rejectValue: string }
>("auth/login", async (payload, { rejectWithValue }) => {
  try {
    const response = await api.post("/admin/auth/login", payload);
    const { admin, tokens } = response.data;

    if (!admin || !tokens?.access?.token) {
      throw new Error("Invalid response from server");
    }

    // Save to localStorage (consistent key "admin")
    localStorage.setItem("token", tokens.access.token);
    localStorage.setItem("admin", JSON.stringify(admin));

    return { admin, token: tokens.access.token };
  } catch (err: any) {
    // Ensure string is returned as reject value
    return rejectWithValue(
      err?.response?.data?.message || err?.message || "Login failed"
    );
  }
});

// Slice
const authSlice = createSlice({
  name: "auth",
  initialState: loadInitialState() as AuthState,
  reducers: {
    logout: (state) => {
      state.admin = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isError = false;
      state.error = null;
      localStorage.clear();
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.admin = action.payload.admin;
        state.token = action.payload.token;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.error = (action.payload as string) || "Login failed";
        state.isAuthenticated = false;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
