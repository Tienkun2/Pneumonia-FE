import { configureStore } from "@reduxjs/toolkit";
import diagnosisReducer from "./slices/diagnosis-slice";
import patientReducer from "./slices/patient-slice";
import authReducer from "./slices/auth-slice";
import userReducer from "./slices/user-slice";
import roleReducer from "./slices/role-slice";
import visitReducer from "./slices/visit-slice";
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
