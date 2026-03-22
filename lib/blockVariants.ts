// Block variant types
export type VariantType =
  | 'full'
  | 'slab_bottom'
  | 'slab_top'
  | 'slab_double'
  | 'stairs_bottom_north'
  | 'stairs_bottom_south'
  | 'stairs_bottom_east'
  | 'stairs_bottom_west'
  | 'stairs_top_north'
  | 'stairs_top_south'
  | 'stairs_top_east'
  | 'stairs_top_west'
  | 'wall'
  | 'fence'
  | 'fence_gate_north'
  | 'fence_gate_south'
  | 'fence_gate_east'
  | 'fence_gate_west'
  | 'trapdoor_bottom'
  | 'trapdoor_top'
  | 'trapdoor_open_north'
  | 'trapdoor_open_south'
  | 'trapdoor_open_east'
  | 'trapdoor_open_west'
  | 'door_lower'
  | 'door_upper'
  | 'pressure_plate'
  | 'button_north'
  | 'button_south'
  | 'button_east'
  | 'button_west'
  | 'carpet'

export type VariantGroup =
  | 'slab'
  | 'stairs'
  | 'wall'
  | 'fence'
  | 'fence_gate'
  | 'trapdoor'
  | 'door'
  | 'pressure_plate'
  | 'button'
  | 'carpet'

export type BlockVariant = {
  type: VariantType
  label: string
  icon: string
  blockId: string        // full MC block ID for this variant
  group: VariantGroup | 'full'
}

// Radial menu display groups (shown as segments)
export type RadialSegment = {
  group: VariantGroup | 'full'
  label: string
  icon: string
  variants: BlockVariant[]
}

// Block family definition
export type BlockFamily = {
  baseId: string         // e.g. 'stone'
  name: string           // e.g. 'Stone'
  segments: RadialSegment[]
}

// Helper to make a full block variant
function full(baseId: string, label: string): BlockVariant {
  return { type: 'full', label, icon: '🧱', blockId: baseId, group: 'full' }
}

// Helper to make slab variants
function slabs(id: string): RadialSegment {
  return {
    group: 'slab',
    label: 'Slab',
    icon: '▬',
    variants: [
      { type: 'slab_bottom', label: 'Slab (Bottom)', icon: '▬', blockId: `${id}_slab`, group: 'slab' },
      { type: 'slab_top', label: 'Slab (Top)', icon: '▬', blockId: `${id}_slab`, group: 'slab' },
      { type: 'slab_double', label: 'Slab (Double)', icon: '▬', blockId: `${id}_slab`, group: 'slab' },
    ],
  }
}

// Helper to make stair variants
function stairs(id: string): RadialSegment {
  return {
    group: 'stairs',
    label: 'Stairs',
    icon: '◤',
    variants: [
      { type: 'stairs_bottom_north', label: 'Stairs N', icon: '◤', blockId: `${id}_stairs`, group: 'stairs' },
      { type: 'stairs_bottom_south', label: 'Stairs S', icon: '◥', blockId: `${id}_stairs`, group: 'stairs' },
      { type: 'stairs_bottom_east', label: 'Stairs E', icon: '◢', blockId: `${id}_stairs`, group: 'stairs' },
      { type: 'stairs_bottom_west', label: 'Stairs W', icon: '◣', blockId: `${id}_stairs`, group: 'stairs' },
      { type: 'stairs_top_north', label: 'Stairs N (Top)', icon: '◤', blockId: `${id}_stairs`, group: 'stairs' },
      { type: 'stairs_top_south', label: 'Stairs S (Top)', icon: '◥', blockId: `${id}_stairs`, group: 'stairs' },
      { type: 'stairs_top_east', label: 'Stairs E (Top)', icon: '◢', blockId: `${id}_stairs`, group: 'stairs' },
      { type: 'stairs_top_west', label: 'Stairs W (Top)', icon: '◣', blockId: `${id}_stairs`, group: 'stairs' },
    ],
  }
}

// Helper for wall
function wall(id: string): RadialSegment {
  return {
    group: 'wall',
    label: 'Wall',
    icon: '▩',
    variants: [
      { type: 'wall', label: 'Wall', icon: '▩', blockId: `${id}_wall`, group: 'wall' },
    ],
  }
}

// Helper for fence
function fence(id: string): RadialSegment {
  return {
    group: 'fence',
    label: 'Fence',
    icon: '⊞',
    variants: [
      { type: 'fence', label: 'Fence', icon: '⊞', blockId: `${id}_fence`, group: 'fence' },
    ],
  }
}

// Helper for fence gate
function fenceGate(id: string): RadialSegment {
  return {
    group: 'fence_gate',
    label: 'Fence Gate',
    icon: '🚪',
    variants: [
      { type: 'fence_gate_north', label: 'Gate N', icon: '🚪', blockId: `${id}_fence_gate`, group: 'fence_gate' },
      { type: 'fence_gate_south', label: 'Gate S', icon: '🚪', blockId: `${id}_fence_gate`, group: 'fence_gate' },
      { type: 'fence_gate_east', label: 'Gate E', icon: '🚪', blockId: `${id}_fence_gate`, group: 'fence_gate' },
      { type: 'fence_gate_west', label: 'Gate W', icon: '🚪', blockId: `${id}_fence_gate`, group: 'fence_gate' },
    ],
  }
}

// Helper for trapdoor
function trapdoor(id: string): RadialSegment {
  return {
    group: 'trapdoor',
    label: 'Trapdoor',
    icon: '⬜',
    variants: [
      { type: 'trapdoor_bottom', label: 'Trapdoor (Bottom)', icon: '⬜', blockId: `${id}_trapdoor`, group: 'trapdoor' },
      { type: 'trapdoor_top', label: 'Trapdoor (Top)', icon: '⬜', blockId: `${id}_trapdoor`, group: 'trapdoor' },
      { type: 'trapdoor_open_north', label: 'Trapdoor Open N', icon: '⬜', blockId: `${id}_trapdoor`, group: 'trapdoor' },
      { type: 'trapdoor_open_south', label: 'Trapdoor Open S', icon: '⬜', blockId: `${id}_trapdoor`, group: 'trapdoor' },
      { type: 'trapdoor_open_east', label: 'Trapdoor Open E', icon: '⬜', blockId: `${id}_trapdoor`, group: 'trapdoor' },
      { type: 'trapdoor_open_west', label: 'Trapdoor Open W', icon: '⬜', blockId: `${id}_trapdoor`, group: 'trapdoor' },
    ],
  }
}

// Helper for door
function door(id: string): RadialSegment {
  return {
    group: 'door',
    label: 'Door',
    icon: '🚪',
    variants: [
      { type: 'door_lower', label: 'Door', icon: '🚪', blockId: `${id}_door`, group: 'door' },
    ],
  }
}

// Helper for pressure plate
function pressurePlate(id: string): RadialSegment {
  return {
    group: 'pressure_plate',
    label: 'Pressure Plate',
    icon: '▱',
    variants: [
      { type: 'pressure_plate', label: 'Pressure Plate', icon: '▱', blockId: `${id}_pressure_plate`, group: 'pressure_plate' },
    ],
  }
}

// Helper for button
function button(id: string): RadialSegment {
  return {
    group: 'button',
    label: 'Button',
    icon: '⬛',
    variants: [
      { type: 'button_north', label: 'Button N', icon: '⬛', blockId: `${id}_button`, group: 'button' },
      { type: 'button_south', label: 'Button S', icon: '⬛', blockId: `${id}_button`, group: 'button' },
      { type: 'button_east', label: 'Button E', icon: '⬛', blockId: `${id}_button`, group: 'button' },
      { type: 'button_west', label: 'Button W', icon: '⬛', blockId: `${id}_button`, group: 'button' },
    ],
  }
}

// Helper for carpet
function carpet(id: string): RadialSegment {
  return {
    group: 'carpet',
    label: 'Carpet',
    icon: '▬',
    variants: [
      { type: 'carpet', label: 'Carpet', icon: '▬', blockId: `${id}_carpet`, group: 'carpet' },
    ],
  }
}

// ── Block families ────────────────────────────────────────────────────────────

export const BLOCK_FAMILIES: BlockFamily[] = [
  // Stone
  { baseId: 'stone', name: 'Stone', segments: [slabs('stone'), stairs('stone')] },
  { baseId: 'granite', name: 'Granite', segments: [slabs('granite'), stairs('granite'), wall('granite')] },
  { baseId: 'polished_granite', name: 'Polished Granite', segments: [slabs('polished_granite'), stairs('polished_granite')] },
  { baseId: 'diorite', name: 'Diorite', segments: [slabs('diorite'), stairs('diorite'), wall('diorite')] },
  { baseId: 'polished_diorite', name: 'Polished Diorite', segments: [slabs('polished_diorite'), stairs('polished_diorite')] },
  { baseId: 'andesite', name: 'Andesite', segments: [slabs('andesite'), stairs('andesite'), wall('andesite')] },
  { baseId: 'polished_andesite', name: 'Polished Andesite', segments: [slabs('polished_andesite'), stairs('polished_andesite')] },
  { baseId: 'cobblestone', name: 'Cobblestone', segments: [slabs('cobblestone'), stairs('cobblestone'), wall('cobblestone')] },
  { baseId: 'mossy_cobblestone', name: 'Mossy Cobblestone', segments: [slabs('mossy_cobblestone'), stairs('mossy_cobblestone'), wall('mossy_cobblestone')] },
  { baseId: 'stone_bricks', name: 'Stone Bricks', segments: [slabs('stone_brick'), stairs('stone_brick'), wall('stone_brick')] },
  { baseId: 'mossy_stone_bricks', name: 'Mossy Stone Bricks', segments: [slabs('mossy_stone_brick'), stairs('mossy_stone_brick'), wall('mossy_stone_brick')] },
  { baseId: 'deepslate', name: 'Deepslate', segments: [wall('deepslate')] },
  { baseId: 'cobbled_deepslate', name: 'Cobbled Deepslate', segments: [slabs('cobbled_deepslate'), stairs('cobbled_deepslate'), wall('cobbled_deepslate')] },
  { baseId: 'polished_deepslate', name: 'Polished Deepslate', segments: [slabs('polished_deepslate'), stairs('polished_deepslate'), wall('polished_deepslate')] },
  { baseId: 'deepslate_bricks', name: 'Deepslate Bricks', segments: [slabs('deepslate_brick'), stairs('deepslate_brick'), wall('deepslate_brick')] },
  { baseId: 'deepslate_tiles', name: 'Deepslate Tiles', segments: [slabs('deepslate_tile'), stairs('deepslate_tile'), wall('deepslate_tile')] },
  { baseId: 'bricks', name: 'Bricks', segments: [slabs('brick'), stairs('brick'), wall('brick')] },
  { baseId: 'mud_bricks', name: 'Mud Bricks', segments: [slabs('mud_brick'), stairs('mud_brick'), wall('mud_brick')] },
  { baseId: 'sandstone', name: 'Sandstone', segments: [slabs('sandstone'), stairs('sandstone'), wall('sandstone')] },
  { baseId: 'smooth_sandstone', name: 'Smooth Sandstone', segments: [slabs('smooth_sandstone'), stairs('smooth_sandstone')] },
  { baseId: 'red_sandstone', name: 'Red Sandstone', segments: [slabs('red_sandstone'), stairs('red_sandstone'), wall('red_sandstone')] },
  { baseId: 'smooth_red_sandstone', name: 'Smooth Red Sandstone', segments: [slabs('smooth_red_sandstone'), stairs('smooth_red_sandstone')] },
  { baseId: 'nether_bricks', name: 'Nether Bricks', segments: [slabs('nether_brick'), stairs('nether_brick'), fence('nether_brick'), wall('nether_brick')] },
  { baseId: 'red_nether_bricks', name: 'Red Nether Bricks', segments: [slabs('red_nether_brick'), stairs('red_nether_brick'), wall('red_nether_brick')] },
  { baseId: 'blackstone', name: 'Blackstone', segments: [slabs('blackstone'), stairs('blackstone'), wall('blackstone')] },
  { baseId: 'polished_blackstone', name: 'Polished Blackstone', segments: [slabs('polished_blackstone'), stairs('polished_blackstone'), wall('polished_blackstone'), pressurePlate('polished_blackstone'), button('polished_blackstone')] },
  { baseId: 'polished_blackstone_bricks', name: 'Polished Blackstone Bricks', segments: [slabs('polished_blackstone_brick'), stairs('polished_blackstone_brick'), wall('polished_blackstone_brick')] },
  { baseId: 'prismarine', name: 'Prismarine', segments: [slabs('prismarine'), stairs('prismarine'), wall('prismarine')] },
  { baseId: 'prismarine_bricks', name: 'Prismarine Bricks', segments: [slabs('prismarine_brick'), stairs('prismarine_brick')] },
  { baseId: 'dark_prismarine', name: 'Dark Prismarine', segments: [slabs('dark_prismarine'), stairs('dark_prismarine')] },
  { baseId: 'end_stone_bricks', name: 'End Stone Bricks', segments: [slabs('end_stone_brick'), stairs('end_stone_brick'), wall('end_stone_brick')] },
  { baseId: 'purpur_block', name: 'Purpur', segments: [slabs('purpur'), stairs('purpur')] },
  { baseId: 'quartz_block', name: 'Quartz', segments: [slabs('quartz'), stairs('quartz')] },
  { baseId: 'smooth_quartz', name: 'Smooth Quartz', segments: [slabs('smooth_quartz'), stairs('smooth_quartz')] },
  { baseId: 'calcite', name: 'Calcite', segments: [] },
  { baseId: 'tuff', name: 'Tuff', segments: [slabs('tuff'), stairs('tuff'), wall('tuff')] },
  { baseId: 'tuff_bricks', name: 'Tuff Bricks', segments: [slabs('tuff_brick'), stairs('tuff_brick'), wall('tuff_brick')] },
  { baseId: 'polished_tuff', name: 'Polished Tuff', segments: [slabs('polished_tuff'), stairs('polished_tuff'), wall('polished_tuff')] },
  { baseId: 'basalt', name: 'Basalt', segments: [] },
  { baseId: 'polished_basalt', name: 'Polished Basalt', segments: [] },
  { baseId: 'cobbled_deepslate', name: 'Cobbled Deepslate', segments: [slabs('cobbled_deepslate'), stairs('cobbled_deepslate'), wall('cobbled_deepslate')] },

  // Wood
  { baseId: 'oak_planks', name: 'Oak', segments: [slabs('oak'), stairs('oak'), fence('oak'), fenceGate('oak'), door('oak'), trapdoor('oak'), pressurePlate('oak'), button('oak')] },
  { baseId: 'spruce_planks', name: 'Spruce', segments: [slabs('spruce'), stairs('spruce'), fence('spruce'), fenceGate('spruce'), door('spruce'), trapdoor('spruce'), pressurePlate('spruce'), button('spruce')] },
  { baseId: 'birch_planks', name: 'Birch', segments: [slabs('birch'), stairs('birch'), fence('birch'), fenceGate('birch'), door('birch'), trapdoor('birch'), pressurePlate('birch'), button('birch')] },
  { baseId: 'jungle_planks', name: 'Jungle', segments: [slabs('jungle'), stairs('jungle'), fence('jungle'), fenceGate('jungle'), door('jungle'), trapdoor('jungle'), pressurePlate('jungle'), button('jungle')] },
  { baseId: 'acacia_planks', name: 'Acacia', segments: [slabs('acacia'), stairs('acacia'), fence('acacia'), fenceGate('acacia'), door('acacia'), trapdoor('acacia'), pressurePlate('acacia'), button('acacia')] },
  { baseId: 'dark_oak_planks', name: 'Dark Oak', segments: [slabs('dark_oak'), stairs('dark_oak'), fence('dark_oak'), fenceGate('dark_oak'), door('dark_oak'), trapdoor('dark_oak'), pressurePlate('dark_oak'), button('dark_oak')] },
  { baseId: 'mangrove_planks', name: 'Mangrove', segments: [slabs('mangrove'), stairs('mangrove'), fence('mangrove'), fenceGate('mangrove'), door('mangrove'), trapdoor('mangrove'), pressurePlate('mangrove'), button('mangrove')] },
  { baseId: 'cherry_planks', name: 'Cherry', segments: [slabs('cherry'), stairs('cherry'), fence('cherry'), fenceGate('cherry'), door('cherry'), trapdoor('cherry'), pressurePlate('cherry'), button('cherry')] },
  { baseId: 'bamboo_planks', name: 'Bamboo', segments: [slabs('bamboo'), stairs('bamboo'), fence('bamboo'), fenceGate('bamboo'), door('bamboo'), trapdoor('bamboo'), pressurePlate('bamboo'), button('bamboo')] },
  { baseId: 'crimson_planks', name: 'Crimson', segments: [slabs('crimson'), stairs('crimson'), fence('crimson'), fenceGate('crimson'), door('crimson'), trapdoor('crimson'), pressurePlate('crimson'), button('crimson')] },
  { baseId: 'warped_planks', name: 'Warped', segments: [slabs('warped'), stairs('warped'), fence('warped'), fenceGate('warped'), door('warped'), trapdoor('warped'), pressurePlate('warped'), button('warped')] },

  // Wool / Carpet
  { baseId: 'white_wool', name: 'White Wool', segments: [carpet('white')] },
  { baseId: 'orange_wool', name: 'Orange Wool', segments: [carpet('orange')] },
  { baseId: 'magenta_wool', name: 'Magenta Wool', segments: [carpet('magenta')] },
  { baseId: 'light_blue_wool', name: 'Light Blue Wool', segments: [carpet('light_blue')] },
  { baseId: 'yellow_wool', name: 'Yellow Wool', segments: [carpet('yellow')] },
  { baseId: 'lime_wool', name: 'Lime Wool', segments: [carpet('lime')] },
  { baseId: 'pink_wool', name: 'Pink Wool', segments: [carpet('pink')] },
  { baseId: 'gray_wool', name: 'Gray Wool', segments: [carpet('gray')] },
  { baseId: 'light_gray_wool', name: 'Light Gray Wool', segments: [carpet('light_gray')] },
  { baseId: 'cyan_wool', name: 'Cyan Wool', segments: [carpet('cyan')] },
  { baseId: 'purple_wool', name: 'Purple Wool', segments: [carpet('purple')] },
  { baseId: 'blue_wool', name: 'Blue Wool', segments: [carpet('blue')] },
  { baseId: 'brown_wool', name: 'Brown Wool', segments: [carpet('brown')] },
  { baseId: 'green_wool', name: 'Green Wool', segments: [carpet('green')] },
  { baseId: 'red_wool', name: 'Red Wool', segments: [carpet('red')] },
  { baseId: 'black_wool', name: 'Black Wool', segments: [carpet('black')] },

  // Concrete
  { baseId: 'white_concrete', name: 'White Concrete', segments: [] },
  { baseId: 'orange_concrete', name: 'Orange Concrete', segments: [] },
  { baseId: 'magenta_concrete', name: 'Magenta Concrete', segments: [] },
  { baseId: 'light_blue_concrete', name: 'Light Blue Concrete', segments: [] },
  { baseId: 'yellow_concrete', name: 'Yellow Concrete', segments: [] },
  { baseId: 'lime_concrete', name: 'Lime Concrete', segments: [] },
  { baseId: 'pink_concrete', name: 'Pink Concrete', segments: [] },
  { baseId: 'gray_concrete', name: 'Gray Concrete', segments: [] },
  { baseId: 'light_gray_concrete', name: 'Light Gray Concrete', segments: [] },
  { baseId: 'cyan_concrete', name: 'Cyan Concrete', segments: [] },
  { baseId: 'purple_concrete', name: 'Purple Concrete', segments: [] },
  { baseId: 'blue_concrete', name: 'Blue Concrete', segments: [] },
  { baseId: 'brown_concrete', name: 'Brown Concrete', segments: [] },
  { baseId: 'green_concrete', name: 'Green Concrete', segments: [] },
  { baseId: 'red_concrete', name: 'Red Concrete', segments: [] },
  { baseId: 'black_concrete', name: 'Black Concrete', segments: [] },

  // Metal/ore blocks (no variants)
  { baseId: 'iron_block', name: 'Iron Block', segments: [] },
  { baseId: 'gold_block', name: 'Gold Block', segments: [] },
  { baseId: 'diamond_block', name: 'Diamond Block', segments: [] },
  { baseId: 'copper_block', name: 'Copper Block', segments: [slabs('cut_copper'), stairs('cut_copper')] },
]

// Fast lookup map: baseId → BlockFamily
export const FAMILY_MAP = new Map<string, BlockFamily>(
  BLOCK_FAMILIES.map(f => [f.baseId, f])
)

// Get the family for a given block ID
export function getBlockFamily(blockId: string): BlockFamily | null {
  // Strip variant suffixes to find base
  const base = blockId
    .replace(/_stairs$/, '_planks')
    .replace(/_slab$/, '_planks')
    .replace(/_fence_gate$/, '_planks')
    .replace(/_fence$/, '_planks')
    .replace(/_door$/, '_planks')
    .replace(/_trapdoor$/, '_planks')
    .replace(/_pressure_plate$/, '_planks')
    .replace(/_button$/, '_planks')
    .replace(/_carpet$/, '_wool')
    .replace(/_wall$/, '')

  return FAMILY_MAP.get(blockId) || FAMILY_MAP.get(base) || null
}

// Get variant type from a stored block's variantType field
export function getVariantLabel(variantType: VariantType): string {
  const labels: Record<VariantType, string> = {
    full: 'Full Block',
    slab_bottom: 'Slab (Bottom)',
    slab_top: 'Slab (Top)',
    slab_double: 'Double Slab',
    stairs_bottom_north: 'Stairs ↑',
    stairs_bottom_south: 'Stairs ↓',
    stairs_bottom_east: 'Stairs →',
    stairs_bottom_west: 'Stairs ←',
    stairs_top_north: 'Stairs ↑ (Top)',
    stairs_top_south: 'Stairs ↓ (Top)',
    stairs_top_east: 'Stairs → (Top)',
    stairs_top_west: 'Stairs ← (Top)',
    wall: 'Wall',
    fence: 'Fence',
    fence_gate_north: 'Gate ↑',
    fence_gate_south: 'Gate ↓',
    fence_gate_east: 'Gate →',
    fence_gate_west: 'Gate ←',
    trapdoor_bottom: 'Trapdoor (Floor)',
    trapdoor_top: 'Trapdoor (Ceiling)',
    trapdoor_open_north: 'Trapdoor Open ↑',
    trapdoor_open_south: 'Trapdoor Open ↓',
    trapdoor_open_east: 'Trapdoor Open →',
    trapdoor_open_west: 'Trapdoor Open ←',
    door_lower: 'Door',
    door_upper: 'Door (Upper)',
    pressure_plate: 'Pressure Plate',
    button_north: 'Button ↑',
    button_south: 'Button ↓',
    button_east: 'Button →',
    button_west: 'Button ←',
    carpet: 'Carpet',
  }
  return labels[variantType] ?? variantType
}