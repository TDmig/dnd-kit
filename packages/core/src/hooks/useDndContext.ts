import {PublicContextDescriptor, usePublicState} from '../store';

export function useDndContext() {
  return usePublicState();
}

export type UseDndContextReturnValue = PublicContextDescriptor;
