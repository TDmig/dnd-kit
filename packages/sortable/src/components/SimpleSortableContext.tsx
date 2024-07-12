import React, {useEffect, useMemo, useRef} from 'react';
import {useDndContext, UniqueIdentifier} from '@dnd-kit-contextless/core';
import {useUniqueId} from '@dnd-kit/utilities';

import type {Disabled, SortingStrategy} from '../types';
import {itemsEqual, normalizeDisabled} from '../utilities';
import {rectSortingStrategy} from '../strategies';
import {setSortableItems} from '../state';
import {
  SortableStateDescriptor,
  getSortableState,
  setSortableState,
  setSortedRects,
} from '../state/sortable-state.nano';

export interface Props {
  children: React.ReactNode;
  items: (UniqueIdentifier | {id: UniqueIdentifier})[];
  strategy?: SortingStrategy;
  id?: string;
  disabled?: boolean | Disabled;
}

export const ID_PREFIX = 'Sortable';

export function SimpleSortableContext({
  children,
  id,
  items: userDefinedItemObjects,
  strategy = rectSortingStrategy,
  disabled: disabledProp = false,
}: Props) {
  const {
    active,
    dragOverlay,
    droppableRects,
    over,
    measureDroppableContainers,
  } = useDndContext();
  const containerId = useUniqueId(ID_PREFIX, id);
  const useDragOverlay = Boolean(dragOverlay.rect !== null);
  const userDefinedItems = useMemo<UniqueIdentifier[]>(
    () =>
      userDefinedItemObjects.map((item) =>
        typeof item === 'object' && 'id' in item ? item.id : item
      ),
    [userDefinedItemObjects]
  );
  const isDragging = active != null;
  const previousItemsRef = useRef<UniqueIdentifier[]>([]);
  const disabled = normalizeDisabled(disabledProp);

  const {activeIndex, overIndex, disableTransforms} = useMemo(() => {
    const itemsHaveChanged = !itemsEqual(
      userDefinedItems,
      previousItemsRef.current
    );

    const activeIndex = active ? userDefinedItems.indexOf(active.id) : -1;
    const overIndex = over ? userDefinedItems.indexOf(over.id) : -1;
    const disableTransforms =
      (overIndex !== -1 && activeIndex === -1) || itemsHaveChanged;

    return {activeIndex, overIndex, disableTransforms};
  }, [active, over, userDefinedItems]);

  useEffect(() => {
    const itemsHaveChanged = !itemsEqual(
      userDefinedItems,
      previousItemsRef.current
    );

    // not sure if it should be called only if items change
    // in prev code, it was called if anything changes
    setSortedRects(userDefinedItems, droppableRects, true);
    if (!itemsHaveChanged) {
      return;
    }

    if (isDragging) {
      measureDroppableContainers(userDefinedItems);
    }

    previousItemsRef.current = userDefinedItems;
    setSortableItems(userDefinedItems);
  }, [
    userDefinedItems,
    isDragging,
    measureDroppableContainers,
    droppableRects,
  ]);

  useEffect(
    () => {
      const prevSortableState = getSortableState();
      const context: SortableStateDescriptor = {
        activeIndex,
        containerId,
        disabled,
        disableTransforms,
        overIndex,
        useDragOverlay,
        sortedRects: prevSortableState.sortedRects,
        strategy,
      };

      setSortableState(context);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      activeIndex,
      containerId,
      disabled.draggable,
      disabled.droppable,
      disableTransforms,
      overIndex,
      useDragOverlay,
      strategy,
    ]
  );

  return <>{children}</>;
}
