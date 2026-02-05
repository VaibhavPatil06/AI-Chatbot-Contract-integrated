import { configureStore } from '@reduxjs/toolkit';
import chatSlice from './slices/chatSlice';
import walletSlice from './slices/walletSlice';
import subscriptionSlice from './slices/subscriptionSlice';
import uiSlice from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    chat: chatSlice,
    wallet: walletSlice,
    subscription: subscriptionSlice,
    ui: uiSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;