import { create } from 'zustand'
import { BlockDefinition, BLOCKS } from '@/lib/blocks'
import { ProjectRecord, saveProject, getAllProjects } from '@/lib/projectDB'
import { VariantType } from '@/lib/blockVariants'

export type PlacedBlock = { id: string; color: string; variantType: VariantType }
export type ActionbarSlot = BlockDefinition | null
export type Actionbar = {
  id: string
  name: string
  slots: ActionbarSlot[]
}

export type ToolType = 'place' | 'line' | 'rectangle' | 'fill' | 'copy' | 'paste' | 'mirror'

type HistoryEntry =
  | { type: 'place'; key: string; block: PlacedBlock }
  | { type: 'remove'; key: string; previous: PlacedBlock | undefined }
  | { type: 'bulk'; placed: Map<string, PlacedBlock>; removed: Map<string, PlacedBlock> }

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
  selectedVariant: VariantType
  setSelectedVariant: (v: VariantType) => void
  isVariantMenuOpen: boolean
  setVariantMenuOpen: (v: boolean) => void
  blocks: Map<string, PlacedBlock>
  placeBlock: (x: number, y: number, z: number) => void
  removeBlock: (x: number, y: number, z: number) => void
  bulkPlace: (positions: { x: number; y: number; z: number }[]) => void
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
  undoStack: HistoryEntry[]
  redoStack: HistoryEntry[]
  undo: () => string | null
  redo: () => string | null
  undoMessage: string | null
  setUndoMessage: (msg: string | null) => void
  activeTool: ToolType
  setActiveTool: (tool: ToolType) => void
  toolPointA: { x: number; y: number; z: number } | null
  setToolPointA: (p: { x: number; y: number; z: number } | null) => void
  clipboard: { blocks: Map<string, PlacedBlock>; size: { x: number; y: number; z: number } } | null
  setClipboard: (c: { blocks: Map<string, PlacedBlock>; size: { x: number; y: number; z: number } } | null) => void
  currentProjectId: string | null
  currentProjectName: string
  setCurrentProject: (id: string | null, name: string) => void
  projects: ProjectRecord[]
  setProjects: (projects: ProjectRecord[]) => void
  isProjectPanelOpen: boolean
  setProjectPanelOpen: (v: boolean) => void
  isInfoPanelOpen: boolean
  setInfoPanelOpen: (v: boolean) => void
  saveCurrentProject: () => Promise<void>
  loadProject: (project: ProjectRecord) => void
  refreshProjects: () => Promise<void>
}

export const useEditorStore = create<EditorState>((set, get) => ({
  isPointerLocked: false,
  setPointerLocked: (v) => set({ isPointerLocked: v }),

  selectedBlock: BLOCKS[0],
  setSelectedBlock: (b) => set({ selectedBlock: b }),

  selectedVariant: 'full',
  setSelectedVariant: (v) => set({ selectedVariant: v }),

  isVariantMenuOpen: false,
  setVariantMenuOpen: (v) => set({ isVariantMenuOpen: v }),

  blocks: new Map(),

  placeBlock: (x, y, z) => {
    const key = `${x},${y},${z}`
    const { selectedBlock, selectedVariant, blocks, undoStack } = get()
    const next = new Map(blocks)
    const placed = new Map<string, PlacedBlock>()

    const newBlock: PlacedBlock = {
      id: selectedBlock.id,
      color: selectedBlock.color,
      variantType: selectedVariant,
    }
    next.set(key, newBlock)
    placed.set(key, newBlock)

    if (selectedVariant === 'door_lower') {
      const upperKey = `${x},${y + 1},${z}`
      const upperBlock: PlacedBlock = {
        id: selectedBlock.id,
        color: selectedBlock.color,
        variantType: 'door_upper',
      }
      next.set(upperKey, upperBlock)
      placed.set(upperKey, upperBlock)
    }

    const entry: HistoryEntry = { type: 'bulk', placed, removed: new Map() }
    set({ blocks: next, undoStack: [...undoStack, entry].slice(-MAX_HISTORY), redoStack: [] })
  },

  removeBlock: (x, y, z) => {
    const key = `${x},${y},${z}`
    const { blocks, undoStack } = get()
    const target = blocks.get(key)
    if (!target) return

    const next = new Map(blocks)
    const removed = new Map<string, PlacedBlock>()

    next.delete(key)
    removed.set(key, target)

    if (target.variantType === 'door_lower') {
      const upperKey = `${x},${y + 1},${z}`
      const upper = next.get(upperKey)
      if (upper?.variantType === 'door_upper') {
        next.delete(upperKey)
        removed.set(upperKey, upper)
      }
    } else if (target.variantType === 'door_upper') {
      const lowerKey = `${x},${y - 1},${z}`
      const lower = next.get(lowerKey)
      if (lower?.variantType === 'door_lower') {
        next.delete(lowerKey)
        removed.set(lowerKey, lower)
      }
    }

    const entry: HistoryEntry = { type: 'bulk', placed: new Map(), removed }
    set({ blocks: next, undoStack: [...undoStack, entry].slice(-MAX_HISTORY), redoStack: [] })
  },

  bulkPlace: (positions) => {
    const { selectedBlock, selectedVariant, blocks, undoStack } = get()
    const next = new Map(blocks)
    const placed = new Map<string, PlacedBlock>()
    const removed = new Map<string, PlacedBlock>()
    positions.forEach(({ x, y, z }) => {
      const key = `${x},${y},${z}`
      const existing = next.get(key)
      if (existing) removed.set(key, existing)
      const block: PlacedBlock = {
        id: selectedBlock.id,
        color: selectedBlock.color,
        variantType: selectedVariant,
      }
      next.set(key, block)
      placed.set(key, block)
    })
    const entry: HistoryEntry = { type: 'bulk', placed, removed }
    set({ blocks: next, undoStack: [...undoStack, entry].slice(-MAX_HISTORY), redoStack: [] })
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
    } else if (entry.type === 'remove') {
      if (entry.previous) next.set(entry.key, entry.previous)
      message = `Undid remove ${entry.previous?.id.replace(/_/g, ' ') ?? 'block'}`
    } else if (entry.type === 'bulk') {
      entry.placed.forEach((_, key) => next.delete(key))
      entry.removed.forEach((block, key) => next.set(key, block))
      message = `Undid ${entry.placed.size} block${entry.placed.size !== 1 ? 's' : ''}`
    }

    set({ blocks: next, undoStack: newUndo, redoStack: [...redoStack, entry] })
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
    } else if (entry.type === 'remove') {
      next.delete(entry.key)
      message = `Redid remove ${entry.previous?.id.replace(/_/g, ' ') ?? 'block'}`
    } else if (entry.type === 'bulk') {
      entry.placed.forEach((block, key) => next.set(key, block))
      entry.removed.forEach((_, key) => next.delete(key))
      message = `Redid ${entry.placed.size} block${entry.placed.size !== 1 ? 's' : ''}`
    }

    set({ blocks: next, redoStack: newRedo, undoStack: [...undoStack, entry] })
    return message
  },

  activeTool: 'place',
  setActiveTool: (tool) => set({ activeTool: tool, toolPointA: null }),
  toolPointA: null,
  setToolPointA: (p) => set({ toolPointA: p }),
  clipboard: null,
  setClipboard: (c) => set({ clipboard: c }),

  currentProjectId: null,
  currentProjectName: 'Untitled Build',
  setCurrentProject: (id, name) => set({ currentProjectId: id, currentProjectName: name }),

  projects: [],
  setProjects: (projects) => set({ projects }),

  isProjectPanelOpen: false,
  setProjectPanelOpen: (v) => set({ isProjectPanelOpen: v }),

  isInfoPanelOpen: false,
  setInfoPanelOpen: (v) => set({ isInfoPanelOpen: v }),

  saveCurrentProject: async () => {
    const { blocks, currentProjectId, currentProjectName } = get()
    const id = currentProjectId ?? Math.random().toString(36).slice(2)
    const blocksObj: Record<string, PlacedBlock> = {}
    blocks.forEach((block, key) => { blocksObj[key] = block })
    const project: ProjectRecord = {
      id,
      name: currentProjectName,
      createdAt: currentProjectId
        ? (get().projects.find(p => p.id === id)?.createdAt ?? Date.now())
        : Date.now(),
      updatedAt: Date.now(),
      blockCount: blocks.size,
      blocks: blocksObj,
    }
    await saveProject(project)
    set({ currentProjectId: id })
    await get().refreshProjects()
  },

  loadProject: (project) => {
    const blocks = new Map<string, PlacedBlock>()
    Object.entries(project.blocks).forEach(([key, block]) => {
      blocks.set(key, {
        id: (block as PlacedBlock).id,
        color: (block as PlacedBlock).color,
        variantType: (block as PlacedBlock).variantType ?? 'full',
      })
    })
    set({
      blocks,
      currentProjectId: project.id,
      currentProjectName: project.name,
      undoStack: [],
      redoStack: [],
    })
  },

  refreshProjects: async () => {
    const projects = await getAllProjects()
    set({ projects })
  },
}))