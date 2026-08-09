import { configureStore, createSlice } from '@reduxjs/toolkit';

// Placeholder slice — Admin Web uses mostly React Query / API hooks for data fetching,
// but Redux requires at least one reducer to initialise without warnings.
const appSlice = createSlice({
  name: 'app',
  initialState: { ready: true },
  reducers: {}
});

export const store = configureStore({
  reducer: {
    app: appSlice.reducer
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
