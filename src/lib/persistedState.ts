/*
Storage Hook
*/

import React from "react";

export const usePersistedState = <T>(key: string, defaultValue: T) => {
  const [state, setState] = React.useState<T>(() => {
    try {
      const item = sessionStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  const setPersistedState = React.useCallback(
    (value: T | ((prev: T) => T)) => {
      setState((prev) => {
        const newValue = value instanceof Function ? value(prev) : value;
        try {
          sessionStorage.setItem(key, JSON.stringify(newValue));
        } catch (e) {
          console.warn("Failed to save to storage:", e);
        }
        return newValue;
      });
    },
    [key],
  );

  const clearPersistedState = React.useCallback(() => {
    try {
      sessionStorage.removeItem(key);
    } catch (e) {
      console.warn("Failed to clear storage:", e);
    }
    setState(defaultValue);
  }, [key, defaultValue]);

  return [state, setPersistedState, clearPersistedState] as const;
};
