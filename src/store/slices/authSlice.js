import { createSlice } from '@reduxjs/toolkit';

const getStoredUser = () => {
  try { return JSON.parse(localStorage.getItem('freshnaps_user')) || null; } catch { return null; }
};
const getStoredToken = () => localStorage.getItem('freshnaps_token') || null;

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: getStoredUser(),
    token: getStoredToken(),
    isLoading: false,
    error: null,
  },
  reducers: {
    loginStart: (state) => { state.isLoading = true; state.error = null; },
    loginSuccess: (state, action) => {
      state.isLoading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      localStorage.setItem('freshnaps_user', JSON.stringify(action.payload.user));
      localStorage.setItem('freshnaps_token', action.payload.token);
    },
    loginFailure: (state, action) => { state.isLoading = false; state.error = action.payload; },
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem('freshnaps_user');
      localStorage.removeItem('freshnaps_token');
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      localStorage.setItem('freshnaps_user', JSON.stringify(state.user));
    },
    clearError: (state) => { state.error = null; },
  },
});

export const { loginStart, loginSuccess, loginFailure, logout, updateUser, clearError } = authSlice.actions;
export default authSlice.reducer;
