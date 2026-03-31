import { configureStore } from "@reduxjs/toolkit";
import diagnosisReducer from "./slices/diagnosisSlice";
import patientReducer from "./slices/patientSlice";
import authReducer from "./slices/auth-slice";
import userReducer from "./slices/userSlice";
import roleReducer from "./slices/roleSlice";
import visitReducer from "./slices/visitSlice";
import notificationReducer from "./slices/notification-slice";

export const store = configureStore({
  reducer: {
    diagnosis: diagnosisReducer,
    patient: patientReducer,
    auth: authReducer,
    user: userReducer,
    role: roleReducer,
    visit: visitReducer,
    notifications: notificationReducer,
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
