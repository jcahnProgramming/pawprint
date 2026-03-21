import { create } from 'zustand'
import { BlockDefinition, BLOCKS } from '@/lib/blocks'

export type PlacedBlock = { id: string; color: string }
export type ActionbarSlot = BlockDefinition | null
export type Actionbar = {
  id: string
  name: string
  slots: ActionbarSlot[]
}

type HistoryEntry =
  | { type: 'place'; key: string; block: PlacedBlock }
  | { type: 'remove'; key: string; previous: PlacedBlock | undefined }

function makeActionbar(name: string): Actionbar {
  return {
    id: Math.random().toString(36).slice(2),
    name,
    slots: Array(9).fill(null),
  }
}

const MAX_HISTORY = 100

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
  // Undo/redo
  undoStack: HistoryEntry[]
  redoStack: HistoryEntry[]
  undo: () => string | null
  redo: () => string | null
  undoMessage: string | null
  setUndoMessage: (msg: string | null) => void
}

export const useEditorStore = create<EditorState>((set, get) => ({
  isPointerLocked: false,
  setPointerLocked: (v) => set({ isPointerLocked: v }),

  selectedBlock: BLOCKS[0],
  setSelectedBlock: (b) => set({ selectedBlock: b }),

  blocks: new Map(),

  placeBlock: (x, y, z) => {
    const key = `${x},${y},${z}`
    const { selectedBlock, blocks, undoStack } = get()
    const previous = blocks.get(key)
    const next = new Map(blocks)
    next.set(key, { id: selectedBlock.id, color: selectedBlock.color })

    const entry: HistoryEntry = { type: 'place', key, block: { id: selectedBlock.id, color: selectedBlock.color } }
    const newStack = [...undoStack, entry].slice(-MAX_HISTORY)

    set({ blocks: next, undoStack: newStack, redoStack: [] })
  },

  removeBlock: (x, y, z) => {
    const key = `${x},${y},${z}`
    const { blocks, undoStack } = get()
    const previous = blocks.get(key)
    if (!previous) return

    const next = new Map(blocks)
    next.delete(key)

    const entry: HistoryEntry = { type: 'remove', key, previous }
    const newStack = [...undoStack, entry].slice(-MAX_HISTORY)

    set({ blocks: next, undoStack: newStack, redoStack: [] })
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

  // Undo/redo
  undoStack: [],
  redoStack: [],
  undoMessage: null,
  setUndoMessage: (msg) => set({ undoMessage: msg }),

  undo: () => {
    const { undoStack, redoStack, blocks } = get()
    if (undoStack.length === 0) return null

    const entry = undoStack[undoStack.length - 1]
    const newUndo = undoStack.slice(0, -1)
    const next = new Map(blocks)
    let message = ''

    if (entry.type === 'place') {
      next.delete(entry.key)
      message = `Undid place ${entry.block.id.replace(/_/g, ' ')}`
    } else {
      if (entry.previous) next.set(entry.key, entry.previous)
      message = `Undid remove ${entry.previous?.id.replace(/_/g, ' ') ?? 'block'}`
    }

    set({
      blocks: next,
      undoStack: newUndo,
      redoStack: [...redoStack, entry],
    })

    return message
  },

  redo: () => {
    const { redoStack, undoStack, blocks } = get()
    if (redoStack.length === 0) return null

    const entry = redoStack[redoStack.length - 1]
    const newRedo = redoStack.slice(0, -1)
    const next = new Map(blocks)
    let message = ''

    if (entry.type === 'place') {
      next.set(entry.key, entry.block)
      message = `Redid place ${entry.block.id.replace(/_/g, ' ')}`
    } else {
      next.delete(entry.key)
      message = `Redid remove ${entry.previous?.id.replace(/_/g, ' ') ?? 'block'}`
    }

    set({
      blocks: next,
      redoStack: newRedo,
      undoStack: [...undoStack, entry],
    })

    return message
  },
}))