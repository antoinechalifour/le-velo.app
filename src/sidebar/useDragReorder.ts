import { useState } from 'react'

export type DragReorder = {
  dragFrom: number | null
  dragOver: number | null
  isOverTarget: (idx: number) => boolean
  isDragging: (idx: number) => boolean
  handlers: (idx: number) => {
    draggable: true
    onDragStart: (e: React.DragEvent) => void
    onDragOver: (e: React.DragEvent) => void
    onDragLeave: () => void
    onDrop: (e: React.DragEvent) => void
    onDragEnd: () => void
  }
}

export function useDragReorder(
  onReorder: (from: number, to: number) => void,
): DragReorder {
  const [dragFrom, setDragFrom] = useState<number | null>(null)
  const [dragOver, setDragOver] = useState<number | null>(null)

  return {
    dragFrom,
    dragOver,
    isOverTarget: (idx) =>
      dragOver === idx && dragFrom !== null && dragFrom !== idx,
    isDragging: (idx) => dragFrom === idx,
    handlers: (idx) => ({
      draggable: true,
      onDragStart: (e) => {
        setDragFrom(idx)
        e.dataTransfer.effectAllowed = 'move'
        e.dataTransfer.setData('text/plain', String(idx))
      },
      onDragOver: (e) => {
        e.preventDefault()
        if (dragFrom !== null) setDragOver(idx)
      },
      onDragLeave: () => {
        if (dragOver === idx) setDragOver(null)
      },
      onDrop: (e) => {
        e.preventDefault()
        if (dragFrom !== null) onReorder(dragFrom, idx)
        setDragFrom(null)
        setDragOver(null)
      },
      onDragEnd: () => {
        setDragFrom(null)
        setDragOver(null)
      },
    }),
  }
}
