import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { NotificationService, NotificationDto } from "@/services/notification-service";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

// --- Thunks ---
export const fetchNotifications = createAsyncThunk(
  "notifications/fetchAll",
  async (page: number = 1) => {
    return await NotificationService.getNotifications(page, 20);
  }
);

export const fetchUnreadCount = createAsyncThunk(
  "notifications/fetchUnreadCount",
  async () => {
    return await NotificationService.getUnreadCount();
  }
);

export const markAllReadApi = createAsyncThunk(
  "notifications/markAllReadApi",
  async () => {
    await NotificationService.markAllAsRead();
  }
);

export const markOneReadApi = createAsyncThunk(
  "notifications/markOneReadApi",
  async (id: string, { dispatch }) => {
    await NotificationService.markOneAsRead(id);
    // Refresh badge from server after marking read
    dispatch(fetchUnreadCount());
    return id;
  }
);

// --- Types ---
export interface NotificationItem extends NotificationDto {
  formattedTime: string;
}

interface NotificationState {
  items: NotificationItem[];
  unreadCount: number;
  isLoading: boolean;
  totalPages: number;
  currentPage: number;
}

// Helper to format time in Vietnamese
const formatTime = (iso: string): string => {
  try {
    return formatDistanceToNow(new Date(iso), { addSuffix: true, locale: vi });
  } catch {
    return "Vừa xong";
  }
};

const initialState: NotificationState = {
  items: [],
  unreadCount: 0,
  isLoading: false,
  totalPages: 1,
  currentPage: 1,
};

const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    // Called by WebSocket to prepend incoming notification
    pushNotification: (state, action: PayloadAction<NotificationDto>) => {
      const dto = action.payload;
      state.items.unshift({
        ...dto,
        formattedTime: formatTime(dto.createdAt),
      });
      // unreadCount will be refreshed from API separately
    },
    markAsRead: (state, action: PayloadAction<string>) => {
      const item = state.items.find(n => n.id === action.payload);
      if (item && !item.isRead) {
        item.isRead = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    clearNotifications: (state) => {
      state.items = [];
      state.unreadCount = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.isLoading = false;
        const { data, totalPages, currentPage } = action.payload;
        state.items = data.map(dto => ({
          ...dto,
          formattedTime: formatTime(dto.createdAt),
        }));
        state.totalPages = totalPages;
        state.currentPage = currentPage;
      })
      .addCase(fetchNotifications.rejected, (state) => {
        state.isLoading = false;
      })
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload;
      })
      .addCase(markAllReadApi.fulfilled, (state) => {
        state.items.forEach(n => n.isRead = true);
        state.unreadCount = 0;
      })
      .addCase(markOneReadApi.fulfilled, (state, action) => {
        const item = state.items.find(n => n.id === action.payload);
        if (item) item.isRead = true;
        // unreadCount will be refreshed from server via fetchUnreadCount
      });
  },
});

export const { pushNotification, markAsRead, clearNotifications } = notificationSlice.actions;
export default notificationSlice.reducer;
