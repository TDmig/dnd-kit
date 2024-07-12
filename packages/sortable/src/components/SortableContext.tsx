import React, {useEffect, useMemo, useRef} from 'react';
import {useDndContext, UniqueIdentifier} from '@dnd-kit-contextless/core';
import {useIsomorphicLayoutEffect, useUniqueId} from '@dnd-kit/utilities';

import type {Disabled, SortingStrategy} from '../types';
import {getSortedRects, itemsEqual, normalizeDisabled} from '../utilities';
import {rectSortingStrategy} from '../strategies';
import {
  setSortableState,
  type SortableStateDescriptor,
} from '../state/sortable-state.nano';
import {setSortableItems} from '../state';

export interface Props {
  children: React.ReactNode;
  items: (UniqueIdentifier | {id: UniqueIdentifier})[];
  strategy?: SortingStrategy;
  id?: string;
  disabled?: boolean | Disabled;
}

export const ID_PREFIX = 'Sortable';

export function SortableContext({
  children,
  id,
  items: userDefinedItems,
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
  const items = useMemo<UniqueIdentifier[]>(
    () =>
      userDefinedItems.map((item) =>
        typeof item === 'object' && 'id' in item ? item.id : item
      ),
    [userDefinedItems]
  );
  const isDragging = active != null;
  const activeIndex = active ? items.indexOf(active.id) : -1;
  const overIndex = over ? items.indexOf(over.id) : -1;
  const previousItemsRef = useRef(items);
  const itemsHaveChanged = !itemsEqual(items, previousItemsRef.current);
  const disableTransforms =
    (overIndex !== -1 && activeIndex === -1) || itemsHaveChanged;
  const disabled = normalizeDisabled(disabledProp);

  useIsomorphicLayoutEffect(() => {
    if (itemsHaveChanged && isDragging) {
      measureDroppableContainers(items);
    }
  }, [itemsHaveChanged, items, isDragging, measureDroppableContainers]);

  useEffect(() => {
    previousItemsRef.current = items;
  }, [items]);

  useEffect(
    () => {
      const context: SortableStateDescriptor = {
        activeIndex,
        containerId,
        disabled,
        disableTransforms,
        overIndex,
        useDragOverlay,
        sortedRects: getSortedRects(items, droppableRects),
        strategy,
      };

      setSortableState(context);
      setSortableItems(items);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      activeIndex,
      containerId,
      disabled.draggable,
      disabled.droppable,
      disableTransforms,
      items,
      overIndex,
      droppableRects,
      useDragOverlay,
      strategy,
    ]
  );

  return <>{children}</>;
}
