import { create } from 'zustand'
import * as THREE from 'three'
import { BlockDefinition, BLOCKS } from '@/lib/blocks'

export type PlacedBlock = { id: string; color: string }
export type ActionbarSlot = BlockDefinition | null
export type Actionbar = {
  id: string
  name: string
  slots: ActionbarSlot[]
}

function makeActionbar(name: string): Actionbar {
  return {
    id: Math.random().toString(36).slice(2),
    name,
    slots: Array(9).fill(null),
  }
}

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
  pickerTargetSlot: number | null
  setPickerTargetSlot: (slot: number | null) => void
  isErasing: boolean
  setErasing: (v: boolean) => void
  actionbars: Actionbar[]
  activeActionbarIndex: number
  activeSlotIndex: number
  setActiveSlot: (slot: number) => void
  setActiveActionbar: (index: number) => void
  addActionbar: () => void
  setSlotBlock: (actionbarIndex: number, slotIndex: number, block: BlockDefinition | null) => void
  scrollActionbar: (delta: number) => void
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

  pickerTargetSlot: null,
  setPickerTargetSlot: (slot) => set({ pickerTargetSlot: slot }),

  isErasing: false,
  setErasing: (v) => set({ isErasing: v }),

  actionbars: [makeActionbar('Hotbar 1')],
  activeActionbarIndex: 0,
  activeSlotIndex: 0,

  setActiveSlot: (slot) => {
    const { actionbars, activeActionbarIndex } = get()
    const bar = actionbars[activeActionbarIndex]
    if (!bar) return
    const block = bar.slots[slot]
    set({ activeSlotIndex: slot })
    if (block) set({ selectedBlock: block })
  },

  setActiveActionbar: (index) => {
    const { actionbars } = get()
    if (index < 0 || index >= actionbars.length) return
    const bar = actionbars[index]
    const block = bar.slots[get().activeSlotIndex]
    set({ activeActionbarIndex: index })
    if (block) set({ selectedBlock: block })
  },

  addActionbar: () => {
    const { actionbars } = get()
    set({ actionbars: [...actionbars, makeActionbar(`Hotbar ${actionbars.length + 1}`)] })
  },

  setSlotBlock: (actionbarIndex, slotIndex, block) => {
    const { actionbars, activeActionbarIndex, activeSlotIndex } = get()
    const next = actionbars.map((bar, i) => {
      if (i !== actionbarIndex) return bar
      const slots = [...bar.slots]
      slots[slotIndex] = block
      return { ...bar, slots }
    })
    set({ actionbars: next })
    if (actionbarIndex === activeActionbarIndex && slotIndex === activeSlotIndex && block) {
      set({ selectedBlock: block })
    }
  },

  scrollActionbar: (delta) => {
    const { activeActionbarIndex, actionbars } = get()
    const next = (activeActionbarIndex + delta + actionbars.length) % actionbars.length
    get().setActiveActionbar(next)
  },
}))