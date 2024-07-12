import {useCallback, useEffect, useRef} from 'react';
import {
  useIsomorphicLayoutEffect,
  useLatestValue,
  useNodeRef,
  useUniqueId,
} from '@dnd-kit/utilities';

import {Action, Data, useInternalState} from '../store';
import type {ClientRect, UniqueIdentifier} from '../types';

import {useResizeObserver} from './utilities';
import {useIsOver, useOverElem} from '../store/context';

interface ResizeObserverConfig {
  /** Whether the ResizeObserver should be disabled entirely */
  disabled?: boolean;
  /** Resize events may affect the layout and position of other droppable containers.
   * Specify an array of `UniqueIdentifier` of droppable containers that should also be re-measured
   * when this droppable container resizes. Specifying an empty array re-measures all droppable containers.
   */
  getUpdateMeasurementsFor?: () => UniqueIdentifier[];
  /** Represents the debounce timeout between when resize events are observed and when elements are re-measured */
  timeout?: number;
}

export interface UseDroppableArguments {
  id: UniqueIdentifier;
  disabled?: boolean;
  returnOver?: boolean;
  data?: Data;
  resizeObserverConfig?: ResizeObserverConfig;
}

const ID_PREFIX = 'Droppable';

const defaultResizeObserverConfig = {
  timeout: 25,
};

export function useDroppable({
  data,
  disabled = false,
  returnOver = true,
  id,
  resizeObserverConfig,
}: UseDroppableArguments) {
  const key = useUniqueId(ID_PREFIX);
  const {active, dispatch, measureDroppableContainers} = useInternalState();
  const overElem = useOverElem(returnOver);
  const isOver = useIsOver(id);
  const previous = useRef({disabled});
  const resizeObserverConnected = useRef(false);
  const rect = useRef<ClientRect | null>(null);
  const callbackId = useRef<NodeJS.Timeout | null>(null);
  const {
    disabled: resizeObserverDisabled,
    getUpdateMeasurementsFor,
    timeout: resizeObserverTimeout,
  } = {
    ...defaultResizeObserverConfig,
    ...resizeObserverConfig,
  };
  const handleResize = useCallback(
    () => {
      if (!resizeObserverConnected.current) {
        // ResizeObserver invokes the `handleResize` callback as soon as `observe` is called,
        // assuming the element is rendered and displayed.
        resizeObserverConnected.current = true;
        return;
      }

      if (callbackId.current != null) {
        clearTimeout(callbackId.current);
      }

      callbackId.current = setTimeout(() => {
        const ids = getUpdateMeasurementsFor ? getUpdateMeasurementsFor() : id;
        measureDroppableContainers(Array.isArray(ids) ? ids : [ids]);
        callbackId.current = null;
      }, resizeObserverTimeout);
    },
    //eslint-disable-next-line react-hooks/exhaustive-deps
    [resizeObserverTimeout]
  );
  const resizeObserver = useResizeObserver({
    callback: handleResize,
    disabled: resizeObserverDisabled || !active,
  });
  const handleNodeChange = useCallback(
    (newElement: HTMLElement | null, previousElement: HTMLElement | null) => {
      if (!resizeObserver) {
        return;
      }

      if (previousElement) {
        resizeObserver.unobserve(previousElement);
        resizeObserverConnected.current = false;
      }

      if (newElement) {
        resizeObserver.observe(newElement);
      }
    },
    [resizeObserver]
  );
  const [nodeRef, setNodeRef] = useNodeRef(handleNodeChange);
  const dataRef = useLatestValue(data);

  useEffect(() => {
    if (!resizeObserver || !nodeRef.current) {
      return;
    }

    resizeObserver.disconnect();
    resizeObserverConnected.current = false;
    resizeObserver.observe(nodeRef.current);
  }, [nodeRef, resizeObserver]);

  useIsomorphicLayoutEffect(
    () => {
      dispatch({
        type: Action.RegisterDroppable,
        element: {
          id,
          key,
          disabled,
          node: nodeRef,
          rect,
          data: dataRef,
        },
      });

      return () =>
        dispatch({
          type: Action.UnregisterDroppable,
          key,
          id,
        });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [id]
  );

  useEffect(() => {
    if (disabled !== previous.current.disabled) {
      dispatch({
        type: Action.SetDroppableDisabled,
        id,
        key,
        disabled,
      });

      previous.current.disabled = disabled;
    }
  }, [id, key, disabled, dispatch]);

  return {
    active,
    rect,
    isOver,
    node: nodeRef,
    over: overElem,
    setNodeRef,
  };
}
