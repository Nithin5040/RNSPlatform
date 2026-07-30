import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosClient from "../api/axiosClient";


// ================================
// 📌 REGISTER THUNK (API CALL)
// ================================
export const registerCandidate = createAsyncThunk(
  "candidate/register",
  async (formData, { rejectWithValue }) => {
    try {
      const res = await axiosClient.post("/candidate/register", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Registration failed"
      );
    }
  }
);

// ================================
// 📌 SLICE
// ================================
const candidateSlice = createSlice({
  name: "candidate",
  initialState: {
    loading: false,
    response: null,
    error: null,
  },

  reducers: {
    clearState: (state) => {
      state.loading = false;
      state.response = null;
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder

      // ⏳ REGISTER — LOADING
      .addCase(registerCandidate.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.response = null;
      })

      // ✅ REGISTER — SUCCESS
      .addCase(registerCandidate.fulfilled, (state, action) => {
        state.loading = false;
        state.response = action.payload;
      })

      // ❌ REGISTER — FAILED
      .addCase(registerCandidate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// Export reducer + action
export const { clearState } = candidateSlice.actions;
export default candidateSlice.reducer;
