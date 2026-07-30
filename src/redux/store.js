import { configureStore } from "@reduxjs/toolkit";
import candidateReducer from "./candidateSlice";

const store = configureStore({
  reducer: {
    candidate: candidateReducer,
  },
});

export default store;
