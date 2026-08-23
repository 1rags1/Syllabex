"use client";

import {
  useCallback,
  useEffect,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";

/**
 * Persist React state in `localStorage` with SSR-safe hydration.
 * Returns `[value, setValue, hydrated]` so UI can avoid flicker before read.
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, Dispatch<SetStateAction<T>>, boolean] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item !== null) {
        setStoredValue(JSON.parse(item) as T);
      }
    } catch (error) {
      console.warn(`useLocalStorage: failed to read key "${key}"`, error);
    } finally {
      setHydrated(true);
    }
  }, [key]);

  const setValue: Dispatch<SetStateAction<T>> = useCallback(
    (value) => {
      setStoredValue((prev) => {
        const nextValue =
          typeof value === "function"
            ? (value as (prevState: T) => T)(prev)
            : value;

        try {
          window.localStorage.setItem(key, JSON.stringify(nextValue));
        } catch (error) {
          console.warn(`useLocalStorage: failed to write key "${key}"`, error);
        }

        return nextValue;
      });
    },
    [key]
  );

  return [storedValue, setValue, hydrated];
}
