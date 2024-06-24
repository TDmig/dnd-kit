import {noop} from '../utilities/other';
import {defaultMeasuringConfiguration} from '../components/DndContext/defaults';
import {DroppableContainersMap} from './constructors';
import type {
  Over,
  InternalContextDescriptor,
  PublicContextDescriptor,
} from './types';
import {nano, useNano} from '../utilities/state/nano-state';
import type {Nano} from '../utilities/state/nano-state';
import type {UniqueIdentifier} from '../types';

export const defaultPublicContext: PublicContextDescriptor = {
  activatorEvent: null,
  active: null,
  activeNode: null,
  activeNodeRect: null,
  collisions: null,
  containerNodeRect: null,
  draggableNodes: new Map(),
  droppableRects: new Map(),
  droppableContainers: new DroppableContainersMap(),
  over: null,
  dragOverlay: {
    nodeRef: {
      current: null,
    },
    rect: null,
    setRef: noop,
  },
  scrollableAncestors: [],
  scrollableAncestorRects: [],
  measuringConfiguration: defaultMeasuringConfiguration,
  measureDroppableContainers: noop,
  windowRect: null,
  measuringScheduled: false,
};

export const defaultInternalContext: InternalContextDescriptor = {
  activatorEvent: null,
  activators: [],
  active: null,
  activeNodeRect: null,
  ariaDescribedById: {
    draggable: '',
  },
  dispatch: noop,
  draggableNodes: new Map(),
  measureDroppableContainers: noop,
};

const OverElemNano = nano<Over | null>(null);
export const useOverElem = (shouldReturnOver = true) =>
  useNano(OverElemNano, !shouldReturnOver);
export const setOverElem = (newOverElem: Over | null) => {
  const prevOver = OverElemNano.get();
  OverElemNano.set(newOverElem);
  moveOverInMap(newOverElem?.id ?? null, prevOver?.id ?? null);
};

type OverMap = Record<UniqueIdentifier, Nano<boolean>>;

const falseNano = nano<boolean>(false);
const overMapNano = nano<OverMap>({});
const useOverMap = () => useNano(overMapNano);

export const moveOverInMap = (
  toId: UniqueIdentifier | null,
  fromId: UniqueIdentifier | null
) => {
  console.log({toId, fromId});
  const currMap = overMapNano.get();
  if (fromId !== null && currMap[fromId]) currMap[fromId].set(false);
  if (toId !== null) {
    if (currMap[toId]) {
      currMap[toId].set(true);
    } else {
      currMap[toId] = nano(true);
      overMapNano.set({...currMap});
    }
  }
};

export const useIsOver = (id: UniqueIdentifier) => {
  const overMap = useOverMap();
  return useNano(overMap[id] ?? falseNano);
};

const InternalStateNano = nano<InternalContextDescriptor>(
  defaultInternalContext
);
export const useInternalState = () => useNano(InternalStateNano);
export const setInternalState = (
  newInternalState: InternalContextDescriptor
) => {
  console.log({newInternalState});
  InternalStateNano.set(newInternalState);
};

const PublicStateNano = nano<PublicContextDescriptor>(defaultPublicContext);
export const usePublicState = () => useNano(PublicStateNano);
export const setPublicState = (newPublicState: PublicContextDescriptor) =>
  PublicStateNano.set(newPublicState);
