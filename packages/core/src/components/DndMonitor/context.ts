import {createContext} from 'react';

import type {RegisterListener} from './types';
import {nano, useNano} from '../../utilities/state/nano-state';

export const DndMonitorContext = createContext<RegisterListener | null>(null);
const DndMonitorStateNano = nano<RegisterListener | null>(null);
export const useDndMonitorState = () => useNano(DndMonitorStateNano);
export const setDndMonitorState = (
  newDndMonitorState: RegisterListener | null
) => DndMonitorStateNano.set(newDndMonitorState);
