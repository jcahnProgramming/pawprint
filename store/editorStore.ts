import { create } from 'zustand'
import * as THREE from 'three'
import { BlockDefinition, BLOCKS } from '@/lib/blocks'

export type PlacedBlock = { id: string; color: string }

interface EditorState {
  isPointerLocked: boolean
  setPointerLocked: (v: boolean) => void
  selectedBlock: BlockDefinition
  setSelectedBlock: (b: BlockDefinition) => void
  blocks: Map<string, PlacedBlock>
  placeBlock: (x: number, y: number, z: number) => void
  removeBlock: (x: number, y: number, z: number) => void
  isPickerOpen: boolean
  setPickerOpen: (v: boolean) => void
  isErasing: boolean
  setErasing: (v: boolean) => void
}

export const useEditorStore = create<EditorState>((set, get) => ({
  isPointerLocked: false,
  setPointerLocked: (v) => set({ isPointerLocked: v }),

  selectedBlock: BLOCKS[0],
  setSelectedBlock: (b) => set({ selectedBlock: b }),

  blocks: new Map(),
  placeBlock: (x, y, z) => {
    const key = `${x},${y},${z}`
    const { selectedBlock, blocks } = get()
    const next = new Map(blocks)
    next.set(key, { id: selectedBlock.id, color: selectedBlock.color })
    set({ blocks: next })
  },
  removeBlock: (x, y, z) => {
    const key = `${x},${y},${z}`
    const next = new Map(get().blocks)
    next.delete(key)
    set({ blocks: next })
  },

  isPickerOpen: false,
  setPickerOpen: (v) => set({ isPickerOpen: v }),

  isErasing: false,
  setErasing: (v) => set({ isErasing: v }),
}))