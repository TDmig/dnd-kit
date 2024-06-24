import React from 'react';

interface Props {
  children: React.ReactNode;
}

// const defaultTransform: Transform = {
//   x: 0,
//   y: 0,
//   scaleX: 1,
//   scaleY: 1,
// };

// FIXME: packages/core/src/components/DragOverlay/DragOverlay.tsx
// was used in overlay to nullify internal and activeDraggable
// is it still needed??
export function NullifiedContextProvider({children}: Props) {
  return <>{children}</>;
}
