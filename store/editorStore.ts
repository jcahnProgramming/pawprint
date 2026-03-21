import { create } from 'zustand'
import * as THREE from 'three'

interface EditorState {
  isPointerLocked: boolean
  hoveredBlock: THREE.Vector3 | null
  setPointerLocked: (locked: boolean) => void
  setHoveredBlock: (pos: THREE.Vector3 | null) => void
}

export const useEditorStore = create<EditorState>((set) => ({
  isPointerLocked: false,
  hoveredBlock: null,
  setPointerLocked: (locked) => set({ isPointerLocked: locked }),
  setHoveredBlock: (pos) => set({ hoveredBlock: pos }),
}))