import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../redux/store';
import { login, logout } from '../redux/slices/authSlice';
import type { AuthState, LoginCredentials } from '../redux/types';

export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, token, isAuthenticated, loading, error } = useSelector(
    (state: any) => state.auth as AuthState
  );

  const loginUser = useCallback(
    async (credentials: LoginCredentials) => {
      await dispatch(login(credentials));
    },
    [dispatch]
  );

  const logoutUser = useCallback(async () => {
    await dispatch(logout());
  }, [dispatch]);

  return {
    user,
    token,
    isAuthenticated,
    loading,
    error,
    login: loginUser,
    logout: logoutUser,
  };
};