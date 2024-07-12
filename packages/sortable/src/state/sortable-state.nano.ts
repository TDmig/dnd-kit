import type {ClientRect, UniqueIdentifier} from '@dnd-kit-contextless/core';

import type {Disabled, SortingStrategy} from '../types';
import {getSortedRects, nano, useNano} from '../utilities';
import {rectSortingStrategy} from '../strategies';

// TODO: import from core
type RectMap = Map<UniqueIdentifier, ClientRect>;

// TODO: move
export const ID_PREFIX = 'Sortable';

export interface SortableStateDescriptor {
  activeIndex: number;
  containerId: string;
  disabled: Disabled;
  disableTransforms: boolean;
  overIndex: number;
  useDragOverlay: boolean;
  sortedRects: ClientRect[];
  strategy: SortingStrategy;
}

const defaultSortableState: SortableStateDescriptor = {
  activeIndex: -1,
  containerId: ID_PREFIX,
  disableTransforms: false,
  overIndex: -1,
  useDragOverlay: false,
  sortedRects: [],
  strategy: rectSortingStrategy,
  disabled: {
    draggable: false,
    droppable: false,
  },
};

const SortableStateNano = nano<SortableStateDescriptor>(defaultSortableState);
export const useSortableState = () => useNano(SortableStateNano);
export const setSortableState = (newSortableState: SortableStateDescriptor) =>
  SortableStateNano.set(newSortableState);
export const getSortableState = () => SortableStateNano.get();

export const setSortedRects = (
  items: UniqueIdentifier[],
  droppableRects: RectMap,
  ignoreEmpty = false
) => {
  const prevSortableState = SortableStateNano.get();
  const prevSortedRects = prevSortableState.sortedRects;
  const newSortedRects = getSortedRects(items, droppableRects);
  if (prevSortableState.sortedRects === newSortedRects) {
    return;
  }

  // extra check to avoid renders on every expansion of `items`
  // even if they are all empty
  // TODO: not sure how does that affect functionality, find out
  if (ignoreEmpty) {
    const allWereEmpty = !prevSortedRects.filter(Boolean).length;
    const allBecameEmpty = !newSortedRects.filter(Boolean).length;
    if (allWereEmpty && allBecameEmpty) {
      return;
    }
  }

  setSortableState({
    ...prevSortableState,
    sortedRects: newSortedRects,
  });
};
