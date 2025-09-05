// Utility functions for proper cleanup in React components
import { useEffect, useRef } from 'react';

/**
 * Hook to track if component is still mounted
 * Useful for preventing state updates after unmount
 */
export const useIsMounted = () => {
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return isMountedRef;
};

/**
 * Hook for cleanup of async operations
 * Returns a function to check if component is still mounted
 */
export const useAsyncCleanup = () => {
  const isMountedRef = useIsMounted();

  return {
    isMounted: () => isMountedRef.current,
    safeSetState: <T>(setter: (value: T) => void) => (value: T) => {
      if (isMountedRef.current) {
        setter(value);
      }
    }
  };
};

/**
 * Debounce function to prevent excessive API calls
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), wait);
  };
};

/**
 * Safe async wrapper that handles cleanup
 */
export const safeAsync = <T>(
  asyncFn: () => Promise<T>,
  isMounted: () => boolean
): Promise<T | null> => {
  return asyncFn()
    .then(result => {
      if (isMounted()) {
        return result;
      }
      return null;
    })
    .catch(error => {
      if (isMounted()) {
        throw error;
      }
      return null;
    });
};