import { useState, useCallback } from 'react';

interface UseUndoRedoOptions {
  maxHistorySize?: number;
}

export function useUndoRedo<T>(initialState: T, options: UseUndoRedoOptions = {}) {
  const { maxHistorySize = 50 } = options;
  
  const [history, setHistory] = useState<T[]>([initialState]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentState = history[currentIndex];

  const setState = useCallback((newState: T | ((prev: T) => T)) => {
    setHistory((prevHistory) => {
      const current = prevHistory[currentIndex];
      const nextState = typeof newState === 'function' 
        ? (newState as (prev: T) => T)(current)
        : newState;
      
      // Remove any future states after current index
      const newHistory = prevHistory.slice(0, currentIndex + 1);
      newHistory.push(nextState);
      
      // Limit history size
      if (newHistory.length > maxHistorySize) {
        return newHistory.slice(newHistory.length - maxHistorySize);
      }
      
      return newHistory;
    });
    
    setCurrentIndex((prev) => {
      const newIndex = prev + 1;
      return Math.min(newIndex, maxHistorySize - 1);
    });
  }, [currentIndex, maxHistorySize]);

  const undo = useCallback(() => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const redo = useCallback(() => {
    setCurrentIndex((prev) => Math.min(history.length - 1, prev + 1));
  }, [history.length]);

  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  const resetHistory = useCallback((newInitialState: T) => {
    setHistory([newInitialState]);
    setCurrentIndex(0);
  }, []);

  return {
    state: currentState,
    setState,
    undo,
    redo,
    canUndo,
    canRedo,
    resetHistory,
  };
}
