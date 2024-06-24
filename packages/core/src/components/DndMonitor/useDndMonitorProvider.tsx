import {useCallback, useState} from 'react';

import type {DndMonitorListener, DndMonitorEvent} from './types';
import {nano} from '../../utilities/state/nano-state';

const dndMonitorListenersNano = nano<Set<DndMonitorListener>>(new Set());
export const registerDndMonitorListener = (listener: DndMonitorListener) => {
  const dndMonitorListeners = dndMonitorListenersNano.get();
  dndMonitorListeners.add(listener);
  dndMonitorListenersNano.set(dndMonitorListeners);
};

export const dispatchDndMonitorEvent = ({type, event}: DndMonitorEvent) => {
  const dndMonitorListeners = dndMonitorListenersNano.get();
  dndMonitorListeners.forEach((listener) => listener[type]?.(event as any));
};

export function useDndMonitorProvider() {
  const [listeners] = useState(() => new Set<DndMonitorListener>());

  const registerListener = useCallback(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    [listeners]
  );

  const dispatch = useCallback(
    ({type, event}: DndMonitorEvent) => {
      listeners.forEach((listener) => listener[type]?.(event as any));
    },
    [listeners]
  );

  return [dispatch, registerListener] as const;
}
