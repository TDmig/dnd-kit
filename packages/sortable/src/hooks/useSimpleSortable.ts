import {useMemo} from 'react';
import {
  useDraggable,
  useDroppable,
  UseDraggableArguments,
  UseDroppableArguments,
} from '@dnd-kit-contextless/core';
import type {Data} from '@dnd-kit-contextless/core';
import {useCombinedRefs} from '@dnd-kit/utilities';

import type {Disabled, SortableData} from '../types';
import {defaultAttributes} from './defaults';
import {getSortableItems, useSortableItemIndex} from '../state';
import {useSortableState} from '../state/sortable-state.nano';

export interface Arguments
  extends Omit<UseDraggableArguments, 'disabled'>,
    Pick<UseDroppableArguments, 'resizeObserverConfig'> {
  disabled?: boolean | Disabled;
}

export function useSimpleSortable({
  attributes: userDefinedAttributes,
  disabled: localDisabled,
  data: customData,
  id,
  resizeObserverConfig,
}: Arguments) {
  const {containerId, disabled: globalDisabled} = useSortableState();
  const disabled: Disabled = normalizeLocalDisabled(
    localDisabled,
    globalDisabled
  );

  const {curr: index} = useSortableItemIndex(id);
  const data = useMemo<SortableData & Data>(
    () => ({sortable: {containerId, index, items: []}, ...customData}),
    [containerId, customData, index]
  );

  const {
    rect,
    node,
    isOver,
    setNodeRef: setDroppableNodeRef,
  } = useDroppable({
    id,
    data,
    disabled: disabled.droppable,
    returnOver: false,
    resizeObserverConfig: {
      getUpdateMeasurementsFor: () => {
        const items = getSortableItems();
        return items.slice(items.indexOf(id));
      },
      ...resizeObserverConfig,
    },
  });

  const {
    active,
    attributes,
    setNodeRef: setDraggableNodeRef,
    listeners,
    isDragging,
    setActivatorNodeRef,
  } = useDraggable({
    id,
    data,
    attributes: {
      ...defaultAttributes,
      ...userDefinedAttributes,
    },
    returnOver: false,
    disabled: disabled.draggable,
  });

  const setNodeRef = useCombinedRefs(setDroppableNodeRef, setDraggableNodeRef);
  const isSorting = Boolean(active);

  return {
    attributes,
    data,
    rect,
    index,
    isOver,
    isSorting,
    isDragging,
    listeners,
    node,
    setNodeRef,
    setActivatorNodeRef,
    setDroppableNodeRef,
    setDraggableNodeRef,
  };
}

function normalizeLocalDisabled(
  localDisabled: Arguments['disabled'],
  globalDisabled: Disabled
) {
  if (typeof localDisabled === 'boolean') {
    return {
      draggable: localDisabled,
      // Backwards compatibility
      droppable: false,
    };
  }

  return {
    draggable: localDisabled?.draggable ?? globalDisabled.draggable,
    droppable: localDisabled?.droppable ?? globalDisabled.droppable,
  };
}
