import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../redux/store';
import { fetchTests, runTest, getTestResults } from '../redux/slices/testSlice';
import type { TestState } from '../redux/types';

export const useTest = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { tests, currentTest, loading, error } = useSelector(
    (state: any) => state.test as TestState
  );

  const loadTests = useCallback(async () => {
    await dispatch(fetchTests());
  }, [dispatch]);

  const startTest = useCallback(
    async (testId: string) => {
      await dispatch(runTest(testId));
    },
    [dispatch]
  );

  const getResults = useCallback(
    async (testId: string) => {
      await dispatch(getTestResults(testId));
    },
    [dispatch]
  );

  return {
    tests,
    currentTest,
    loading,
    error,
    loadTests,
    startTest,
    getResults,
  };
};