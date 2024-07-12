import type {UniqueIdentifier} from '@dnd-kit-contextless/core';
import {Nano, nano, useNano} from '../utilities';

const SortableItemsNano = nano<UniqueIdentifier[]>([]);
export const useSortableItems = () => useNano(SortableItemsNano);
export const setSortableItems = (newSortableItems: UniqueIdentifier[]) => {
  SortableItemsNano.set(newSortableItems);
  updateSortableItemsIndexesMap(newSortableItems);
};
export const getSortableItems = () => SortableItemsNano.get();

// TODO: add `next` field to store planned index after drop
type SortableItemIndex = {curr: number};
type SortableItemsIndexesMap = Record<
  UniqueIdentifier,
  Nano<SortableItemIndex>
>;
const SortableItemsIndexesMapNano = nano<SortableItemsIndexesMap>({});
const useSortableItemsIndexesMap = () => useNano(SortableItemsIndexesMapNano);
const getSortableItemsIndexesMap = () => SortableItemsIndexesMapNano.get();

export const useSortableItemIndex = (id: UniqueIdentifier) => {
  const itemsIndexesMap = useSortableItemsIndexesMap();
  let itemIndexNano = itemsIndexesMap[id];
  if (!itemIndexNano) {
    const sortableItems = getSortableItems();
    const itemIdx = sortableItems.indexOf(id);
    itemIndexNano = nano({curr: itemIdx});
    itemsIndexesMap[id] = itemIndexNano;
  }

  return useNano(itemIndexNano);
};

// TODO: add deletion of old entries
const updateSortableItemsIndexesMap = (newItems: UniqueIdentifier[]) => {
  const itemsIndexesMap = getSortableItemsIndexesMap();
  newItems.forEach((itemId, itemIdx) => {
    let itemIndexNano = itemsIndexesMap[itemId];
    if (!itemIndexNano) {
      itemIndexNano = nano({curr: itemIdx});
      itemsIndexesMap[itemId] = itemIndexNano;
    } else {
      const prevItemIdx = itemIndexNano.get();
      if (prevItemIdx.curr !== itemIdx) {
        itemIndexNano.set({curr: itemIdx});
      }
    }
  });
};
