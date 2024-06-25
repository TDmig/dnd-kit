import type {UniqueIdentifier} from '@dnd-kit-contextless/core';

export type SortableData = {
  sortable: {
    containerId: UniqueIdentifier;
    items: UniqueIdentifier[];
    index: number;
  };
};
