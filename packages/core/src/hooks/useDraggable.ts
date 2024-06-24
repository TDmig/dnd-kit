import {useMemo} from 'react';
import {
  Transform,
  useNodeRef,
  useIsomorphicLayoutEffect,
  useLatestValue,
  useUniqueId,
} from '@dnd-kit/utilities';

import {Data, useInternalState} from '../store';
import type {UniqueIdentifier} from '../types';
import {useSyntheticListeners, SyntheticListenerMap} from './utilities';
import {useActiveDraggableState} from '../components/DndContext/DndContext';
import { useOverElem } from '../store/context';

export interface UseDraggableArguments {
  id: UniqueIdentifier;
  data?: Data;
  disabled?: boolean;
  returnOver?: boolean;
  attributes?: {
    role?: string;
    roleDescription?: string;
    tabIndex?: number;
  };
}

export interface DraggableAttributes {
  role: string;
  tabIndex: number;
  'aria-disabled': boolean;
  'aria-pressed': boolean | undefined;
  'aria-roledescription': string;
  'aria-describedby': string;
}

export type DraggableSyntheticListeners = SyntheticListenerMap | undefined;

const defaultRole = 'button';

const ID_PREFIX = 'Droppable';

export function useDraggable({
  id,
  data,
  disabled = false,
  returnOver = true,
  attributes,
}: UseDraggableArguments) {
  const key = useUniqueId(ID_PREFIX);
  const {
    activators,
    activatorEvent,
    active,
    activeNodeRect,
    ariaDescribedById,
    draggableNodes,
  } = useInternalState();
  const overElem = useOverElem(returnOver);
  const {
    role = defaultRole,
    roleDescription = 'draggable',
    tabIndex = 0,
  } = attributes ?? {};
  const isDragging = active?.id === id;
  let transform: Transform | null = useActiveDraggableState(isDragging);
  if (!isDragging) {
    transform = null;
  }
  const [node, setNodeRef] = useNodeRef();
  const [activatorNode, setActivatorNodeRef] = useNodeRef();
  const listeners = useSyntheticListeners(activators, id);
  const dataRef = useLatestValue(data);

  useIsomorphicLayoutEffect(
    () => {
      draggableNodes.set(id, {id, key, node, activatorNode, data: dataRef});

      return () => {
        const node = draggableNodes.get(id);

        if (node && node.key === key) {
          draggableNodes.delete(id);
        }
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [draggableNodes, id]
  );

  const memoizedAttributes: DraggableAttributes = useMemo(
    () => ({
      role,
      tabIndex,
      'aria-disabled': disabled,
      'aria-pressed': isDragging && role === defaultRole ? true : undefined,
      'aria-roledescription': roleDescription,
      'aria-describedby': ariaDescribedById.draggable,
    }),
    [
      disabled,
      role,
      tabIndex,
      isDragging,
      roleDescription,
      ariaDescribedById.draggable,
    ]
  );

  return {
    active,
    activatorEvent,
    activeNodeRect,
    attributes: memoizedAttributes,
    isDragging,
    listeners: disabled ? undefined : listeners,
    node,
    over: overElem,
    setNodeRef,
    setActivatorNodeRef,
    transform,
  };
}
