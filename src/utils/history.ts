import { TransformState } from '@/types/project';

const MAX_HISTORY = 20;

export const pushToHistory = (
  history: TransformState[],
  item: TransformState
): TransformState[] => {
  const newHistory = [...history, item];
  if (newHistory.length > MAX_HISTORY) {
    newHistory.shift();
  }
  return newHistory;
};

export const undo = (
  currentHistory: TransformState[],
  currentItem: TransformState
): { previous: TransformState; newHistory: TransformState[]; redoItem: TransformState } | null => {
  if (currentHistory.length === 0) return null;

  const previous = currentHistory[currentHistory.length - 1];
  const newHistory = currentHistory.slice(0, -1);
  const redoItem = currentItem;

  return { previous, newHistory, redoItem };
};

export const redo = (
  currentRedoStack: TransformState[],
  currentItem: TransformState
): { next: TransformState; newRedoStack: TransformState[]; undoItem: TransformState } | null => {
  if (currentRedoStack.length === 0) return null;

  const next = currentRedoStack[currentRedoStack.length - 1];
  const newRedoStack = currentRedoStack.slice(0, -1);
  const undoItem = currentItem;

  return { next, newRedoStack, undoItem };
};
