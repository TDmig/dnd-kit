import {useEffect} from 'react';

import type {DndMonitorListener} from './types';
import {registerDndMonitorListener} from './useDndMonitorProvider';

export function useDndMonitor(listener: DndMonitorListener) {
  useEffect(() => {
    const unsubscribe = registerDndMonitorListener(listener);

    return unsubscribe;
  }, [listener]);
}
