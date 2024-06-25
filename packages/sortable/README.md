# @dnd-kit-contextless/sortable

[![Stable release](https://img.shields.io/npm/v/@dnd-kit-contextless/sortable.svg)](https://npm.im/@dnd-kit-contextless/sortable)

The sortable preset provides the building blocks to build sortable interfaces with @dnd-kit. This is a fork of `@dnd-kit/sortable`, but without `React.createContext` or `React.useContext`.

## Installation

To get started, install the sortable preset via npm or yarn:

```
npm install @dnd-kit-contextless/sortable
```

## Architecture

The sortable preset builds on top of the primitives exposed by `@dnd-kit-contextless/core` to help building sortable interfaces.

The sortable preset exposes two main concepts: `SortableContext` and the `useSortable` hook:

- The SortableContext provides information via context that is consumed by the `useSortable` hook.
- The useSortable hook is an abstraction that composes the `useDroppable` and `useDraggable` hooks.

## Usage

Visit original [docs.dndkit.com](https://docs.dndkit.com/presets/sortable) to learn how to use the Sortable preset.
