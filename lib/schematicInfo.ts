import { PlacedBlock } from '@/store/editorStore'
import { VariantType } from './blockVariants'
import { BLOCK_MAP } from './blocks'

export type MaterialEntry = {
  blockId: string
  variantType: VariantType
  displayName: string
  color: string
  count: number
  key: string  // unique key for checklist
}

export type VariantGroupCount = {
  group: string
  label: string
  count: number
}

export type SchematicInfo = {
  totalBlocks: number
  dimensions: { x: number; y: number; z: number }
  bounds: {
    min: { x: number; y: number; z: number }
    max: { x: number; y: number; z: number }
  }
  materials: MaterialEntry[]
  variantGroups: VariantGroupCount[]
  topBlock: MaterialEntry | null
}

function getVariantGroupLabel(variantType: VariantType): string {
  if (variantType === 'full') return 'Full Blocks'
  if (variantType === 'slab_bottom' || variantType === 'slab_top' || variantType === 'slab_double') return 'Slabs'
  if (variantType.startsWith('stairs_')) return 'Stairs'
  if (variantType === 'wall') return 'Walls'
  if (variantType === 'fence') return 'Fences'
  if (variantType.startsWith('fence_gate_')) return 'Fence Gates'
  if (variantType === 'door_lower' || variantType === 'door_upper') return 'Doors'
  if (variantType.startsWith('trapdoor_')) return 'Trapdoors'
  if (variantType === 'pressure_plate') return 'Pressure Plates'
  if (variantType.startsWith('button_')) return 'Buttons'
  if (variantType === 'carpet') return 'Carpets'
  return 'Other'
}

function getDisplayName(blockId: string, variantType: VariantType): string {
  const block = BLOCK_MAP.get(blockId)
  const baseName = block?.name ?? blockId.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())

  if (variantType === 'full') return baseName
  if (variantType === 'slab_bottom') return `${baseName} Slab (Bottom)`
  if (variantType === 'slab_top') return `${baseName} Slab (Top)`
  if (variantType === 'slab_double') return `${baseName} Slab (Double)`
  if (variantType === 'stairs_bottom_north') return `${baseName} Stairs (N)`
  if (variantType === 'stairs_bottom_south') return `${baseName} Stairs (S)`
  if (variantType === 'stairs_bottom_east') return `${baseName} Stairs (E)`
  if (variantType === 'stairs_bottom_west') return `${baseName} Stairs (W)`
  if (variantType === 'stairs_top_north') return `${baseName} Stairs Top (N)`
  if (variantType === 'stairs_top_south') return `${baseName} Stairs Top (S)`
  if (variantType === 'stairs_top_east') return `${baseName} Stairs Top (E)`
  if (variantType === 'stairs_top_west') return `${baseName} Stairs Top (W)`
  if (variantType === 'wall') return `${baseName} Wall`
  if (variantType === 'fence') return `${baseName} Fence`
  if (variantType.startsWith('fence_gate_')) return `${baseName} Fence Gate`
  if (variantType === 'door_lower') return `${baseName} Door`
  if (variantType === 'door_upper') return `${baseName} Door (Upper)`
  if (variantType === 'trapdoor_bottom') return `${baseName} Trapdoor`
  if (variantType === 'trapdoor_top') return `${baseName} Trapdoor (Top)`
  if (variantType.startsWith('trapdoor_open_')) return `${baseName} Trapdoor (Open)`
  if (variantType === 'pressure_plate') return `${baseName} Pressure Plate`
  if (variantType.startsWith('button_')) return `${baseName} Button`
  if (variantType === 'carpet') return `${baseName} Carpet`
  return baseName
}

export function computeSchematicInfo(blocks: Map<string, PlacedBlock>): SchematicInfo {
  if (blocks.size === 0) {
    return {
      totalBlocks: 0,
      dimensions: { x: 0, y: 0, z: 0 },
      bounds: { min: { x: 0, y: 0, z: 0 }, max: { x: 0, y: 0, z: 0 } },
      materials: [],
      variantGroups: [],
      topBlock: null,
    }
  }

  // Compute bounds
  let minX = Infinity, minY = Infinity, minZ = Infinity
  let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity

  blocks.forEach((_, key) => {
    const [x, y, z] = key.split(',').map(Number)
    minX = Math.min(minX, x); maxX = Math.max(maxX, x)
    minY = Math.min(minY, y); maxY = Math.max(maxY, y)
    minZ = Math.min(minZ, z); maxZ = Math.max(maxZ, z)
  })

  // Count materials
  const materialCounts = new Map<string, { blockId: string; variantType: VariantType; color: string; count: number }>()
  const variantGroupCounts = new Map<string, number>()

  blocks.forEach((block) => {
    const variantType = block.variantType ?? 'full'
    const matKey = `${block.id}::${variantType}`
    const blockDef = BLOCK_MAP.get(block.id)
    const color = blockDef?.color ?? block.color

    if (materialCounts.has(matKey)) {
      materialCounts.get(matKey)!.count++
    } else {
      materialCounts.set(matKey, {
        blockId: block.id,
        variantType,
        color,
        count: 1,
      })
    }

    // Variant group
    const groupLabel = getVariantGroupLabel(variantType)
    variantGroupCounts.set(groupLabel, (variantGroupCounts.get(groupLabel) ?? 0) + 1)
  })

  // Build material list sorted by count descending
  const materials: MaterialEntry[] = Array.from(materialCounts.entries())
    .map(([key, entry]) => ({
      key,
      blockId: entry.blockId,
      variantType: entry.variantType,
      displayName: getDisplayName(entry.blockId, entry.variantType),
      color: entry.color,
      count: entry.count,
    }))
    .sort((a, b) => b.count - a.count)

  // Variant groups sorted by count
  const variantGroups: VariantGroupCount[] = Array.from(variantGroupCounts.entries())
    .map(([group, count]) => ({ group, label: group, count }))
    .sort((a, b) => b.count - a.count)

  return {
    totalBlocks: blocks.size,
    dimensions: {
      x: maxX - minX + 1,
      y: maxY - minY + 1,
      z: maxZ - minZ + 1,
    },
    bounds: {
      min: { x: minX, y: minY, z: minZ },
      max: { x: maxX, y: maxY, z: maxZ },
    },
    materials,
    variantGroups,
    topBlock: materials[0] ?? null,
  }
}

// CSV export
export function exportMaterialsCSV(materials: MaterialEntry[]): string {
  const rows = [
    ['Block', 'Variant', 'Count'],
    ...materials.map(m => [m.displayName, m.variantType, String(m.count)]),
  ]
  return rows.map(r => r.map(csvCell).join(',')).join('\n')
}

// Quote a CSV cell, escape embedded quotes, and stop spreadsheet apps from
// treating block names from imported files as formulas.
function csvCell(value: string): string {
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value
  return `"${safe.replace(/"/g, '""')}"`
}