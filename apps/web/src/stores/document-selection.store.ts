import { create } from 'zustand';

interface DocumentSelectionState {
  selectedIds: Set<string>;
  lastSelectedId: string | null;

  // Actions
  select: (id: string) => void;
  deselect: (id: string) => void;
  toggle: (id: string) => void;
  selectAll: (ids: string[]) => void;
  deselectAll: () => void;
  selectRange: (fromId: string, toId: string, allIds: string[]) => void;

  // Getters
  isSelected: (id: string) => boolean;
  getSelectedIds: () => string[];
  getSelectedCount: () => number;
}

export const useDocumentSelection = create<DocumentSelectionState>((set, get) => ({
  selectedIds: new Set(),
  lastSelectedId: null,

  select: (id) =>
    set((state) => ({
      selectedIds: new Set(state.selectedIds).add(id),
      lastSelectedId: id,
    })),

  deselect: (id) =>
    set((state) => {
      const newSet = new Set(state.selectedIds);
      newSet.delete(id);
      return { selectedIds: newSet };
    }),

  toggle: (id) => {
    const { selectedIds, select, deselect } = get();
    if (selectedIds.has(id)) {
      deselect(id);
    } else {
      select(id);
    }
  },

  selectAll: (ids) =>
    set({
      selectedIds: new Set(ids),
      lastSelectedId: ids[ids.length - 1] || null,
    }),

  deselectAll: () =>
    set({
      selectedIds: new Set(),
      lastSelectedId: null,
    }),

  selectRange: (fromId, toId, allIds) => {
    const fromIndex = allIds.indexOf(fromId);
    const toIndex = allIds.indexOf(toId);

    if (fromIndex === -1 || toIndex === -1) return;

    const [start, end] =
      fromIndex < toIndex ? [fromIndex, toIndex] : [toIndex, fromIndex];
    const rangeIds = allIds.slice(start, end + 1);

    set((state) => ({
      selectedIds: new Set([...state.selectedIds, ...rangeIds]),
      lastSelectedId: toId,
    }));
  },

  isSelected: (id) => get().selectedIds.has(id),
  getSelectedIds: () => Array.from(get().selectedIds),
  getSelectedCount: () => get().selectedIds.size,
}));
