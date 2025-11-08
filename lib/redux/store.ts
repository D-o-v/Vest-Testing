import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { setTokenGetter, setLogoutDispatcher } from '../services/api';

// Import reducers with type annotations
import { authReducer, logoutAction, testReducer } from './slices';

// Import types
import type { AuthState, TestState } from './types';

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth'], // Only persist auth state
};

const rootReducer = combineReducers({
  auth: authReducer,
  test: testReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

// Set up token getter and logout dispatcher for API instance
setTokenGetter(() => {
  const state = store.getState() as any;
  return state?.auth?.token || null;
});

setLogoutDispatcher(() => {
  store.dispatch(logoutAction());
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Infer the `RootState` and `AppDispatch` types from the store itself
declare module '@reduxjs/toolkit' {
  interface GetDefaultMiddlewareOptions {
    serializableCheck?: boolean | {
      ignoredActions?: string[];
      ignoredActionPaths?: string[];
      ignoredPaths?: string[];
      warnAfter?: number;
    };
    immutableCheck?: boolean | {
      warnAfter?: number;
    };
    thunk?: boolean;
  }
}