"use client";

export function createDragDropHandlers<T>(
  items: T[],
  onReorder: (newItems: T[]) => void,
  getId: (item: T) => string
) {
  let dragId: string | null = null;

  function onDragStart(id: string) {
    dragId = id;
  }

  function onDrop(targetId: string) {
    if (!dragId || dragId === targetId) return;
    const fromIdx = items.findIndex((i) => getId(i) === dragId);
    const toIdx   = items.findIndex((i) => getId(i) === targetId);
    if (fromIdx === -1 || toIdx === -1) return;
    const next = [...items];
    const [moved] = next.splice(fromIdx, 1);
    next.splice(toIdx, 0, moved);
    onReorder(next);
    dragId = null;
  }

  function onDragOver(e: DragEvent) {
    e.preventDefault();
  }

  return { onDragStart, onDrop, onDragOver };
}

export function reorder<T>(list: T[], from: number, to: number): T[] {
  const result = [...list];
  const [removed] = result.splice(from, 1);
  result.splice(to, 0, removed);
  return result;
}
