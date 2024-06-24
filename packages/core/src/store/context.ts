import {noop} from '../utilities/other';
import {defaultMeasuringConfiguration} from '../components/DndContext/defaults';
import {DroppableContainersMap} from './constructors';
import type {InternalContextDescriptor, PublicContextDescriptor} from './types';
import {nano, useNano} from '../utilities/state/nano-state';

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
  over: null,
  measureDroppableContainers: noop,
};

const InternalStateNano = nano<InternalContextDescriptor>(
  defaultInternalContext
);
export const useInternalState = () => useNano(InternalStateNano);
export const setInternalState = (newInternalState: InternalContextDescriptor) =>
  InternalStateNano.set(newInternalState);

const PublicStateNano = nano<PublicContextDescriptor>(defaultPublicContext);
export const usePublicState = () => useNano(PublicStateNano);
export const setPublicState = (newPublicState: PublicContextDescriptor) =>
  PublicStateNano.set(newPublicState);
