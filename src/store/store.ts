import { configureStore } from "@reduxjs/toolkit";
import diagnosisReducer from "./slices/diagnosisSlice";
import patientReducer from "./slices/patientSlice";
import authReducer from "./slices/auth-slice";

export const store = configureStore({
  reducer: {
    diagnosis: diagnosisReducer,
    patient: patientReducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["diagnosis/setImageFile"],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
