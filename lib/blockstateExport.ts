import { VariantType } from './blockVariants'

// Resolve the correct MC block ID for a given base block + variant
// e.g. oak_planks + stairs_bottom_north → oak_stairs
export function resolveExportBlockId(blockId: string, variantType: VariantType): string {
  if (variantType === 'full') return blockId

  const wood = blockId.replace('_planks', '')

  // ── Stairs ────────────────────────────────────────────────────────────────
  if (variantType.startsWith('stairs_')) {
    if (blockId.endsWith('_planks')) return `${wood}_stairs`
    // Stone variants
    const stairMap: Record<string, string> = {
      stone_bricks: 'stone_brick_stairs',
      mossy_stone_bricks: 'mossy_stone_brick_stairs',
      cracked_stone_bricks: 'stone_brick_stairs',
      deepslate_bricks: 'deepslate_brick_stairs',
      deepslate_tiles: 'deepslate_tile_stairs',
      cobbled_deepslate: 'cobbled_deepslate_stairs',
      polished_deepslate: 'polished_deepslate_stairs',
      bricks: 'brick_stairs',
      mud_bricks: 'mud_brick_stairs',
      nether_bricks: 'nether_brick_stairs',
      red_nether_bricks: 'red_nether_brick_stairs',
      quartz_block: 'quartz_stairs',
      smooth_quartz: 'smooth_quartz_stairs',
      purpur_block: 'purpur_stairs',
      prismarine_bricks: 'prismarine_brick_stairs',
      end_stone_bricks: 'end_stone_brick_stairs',
      polished_blackstone_bricks: 'polished_blackstone_brick_stairs',
      tuff_bricks: 'tuff_brick_stairs',
      polished_tuff: 'polished_tuff_stairs',
    }
    if (stairMap[blockId]) return stairMap[blockId]
    return `${blockId}_stairs`
  }

  // ── Slabs ────────────────────────────────────────────────────────────────
  if (variantType.startsWith('slab_')) {
    if (blockId.endsWith('_planks')) return `${wood}_slab`
    const slabMap: Record<string, string> = {
      stone_bricks: 'stone_brick_slab',
      mossy_stone_bricks: 'mossy_stone_brick_slab',
      deepslate_bricks: 'deepslate_brick_slab',
      deepslate_tiles: 'deepslate_tile_slab',
      cobbled_deepslate: 'cobbled_deepslate_slab',
      polished_deepslate: 'polished_deepslate_slab',
      bricks: 'brick_slab',
      mud_bricks: 'mud_brick_slab',
      nether_bricks: 'nether_brick_slab',
      red_nether_bricks: 'red_nether_brick_slab',
      quartz_block: 'quartz_slab',
      smooth_quartz: 'smooth_quartz_slab',
      purpur_block: 'purpur_slab',
      prismarine_bricks: 'prismarine_brick_slab',
      end_stone_bricks: 'end_stone_brick_slab',
      polished_blackstone_bricks: 'polished_blackstone_brick_slab',
      tuff_bricks: 'tuff_brick_slab',
      polished_tuff: 'polished_tuff_slab',
      stone: 'stone_slab',
      cobblestone: 'cobblestone_slab',
      mossy_cobblestone: 'mossy_cobblestone_slab',
      andesite: 'andesite_slab',
      polished_andesite: 'polished_andesite_slab',
      granite: 'granite_slab',
      polished_granite: 'polished_granite_slab',
      diorite: 'diorite_slab',
      polished_diorite: 'polished_diorite_slab',
      blackstone: 'blackstone_slab',
      polished_blackstone: 'polished_blackstone_slab',
      sandstone: 'sandstone_slab',
      smooth_sandstone: 'smooth_sandstone_slab',
      red_sandstone: 'red_sandstone_slab',
      smooth_red_sandstone: 'smooth_red_sandstone_slab',
      dark_prismarine: 'dark_prismarine_slab',
      prismarine: 'prismarine_slab',
    }
    if (slabMap[blockId]) return slabMap[blockId]
    return `${blockId}_slab`
  }

  // ── Walls ────────────────────────────────────────────────────────────────
  if (variantType === 'wall') {
    const wallMap: Record<string, string> = {
      stone_bricks: 'stone_brick_wall',
      mossy_stone_bricks: 'mossy_stone_brick_wall',
      deepslate_bricks: 'deepslate_brick_wall',
      deepslate_tiles: 'deepslate_tile_wall',
      cobbled_deepslate: 'cobbled_deepslate_wall',
      polished_deepslate: 'polished_deepslate_wall',
      bricks: 'brick_wall',
      mud_bricks: 'mud_brick_wall',
      nether_bricks: 'nether_brick_wall',
      red_nether_bricks: 'red_nether_brick_wall',
      polished_blackstone_bricks: 'polished_blackstone_brick_wall',
      tuff_bricks: 'tuff_brick_wall',
      polished_tuff: 'polished_tuff_wall',
      end_stone_bricks: 'end_stone_brick_wall',
    }
    if (wallMap[blockId]) return wallMap[blockId]
    return `${blockId}_wall`
  }

  // ── Fence ────────────────────────────────────────────────────────────────
  if (variantType === 'fence') {
    if (blockId.endsWith('_planks')) return `${wood}_fence`
    if (blockId === 'nether_bricks') return 'nether_brick_fence'
    return `${blockId}_fence`
  }

  // ── Fence Gate ───────────────────────────────────────────────────────────
  if (variantType.startsWith('fence_gate_')) {
    if (blockId.endsWith('_planks')) return `${wood}_fence_gate`
    return `${blockId}_fence_gate`
  }

  // ── Door ─────────────────────────────────────────────────────────────────
  if (variantType === 'door_lower' || variantType === 'door_upper') {
    if (blockId.endsWith('_planks')) return `${wood}_door`
    return `${blockId}_door`
  }

  // ── Trapdoor ─────────────────────────────────────────────────────────────
  if (variantType.startsWith('trapdoor_')) {
    if (blockId.endsWith('_planks')) return `${wood}_trapdoor`
    return `${blockId}_trapdoor`
  }

  // ── Pressure Plate ───────────────────────────────────────────────────────
  if (variantType === 'pressure_plate') {
    if (blockId.endsWith('_planks')) return `${wood}_pressure_plate`
    if (blockId === 'stone') return 'stone_pressure_plate'
    if (blockId === 'polished_blackstone') return 'polished_blackstone_pressure_plate'
    return `${blockId}_pressure_plate`
  }

  // ── Button ───────────────────────────────────────────────────────────────
  if (variantType.startsWith('button_')) {
    if (blockId.endsWith('_planks')) return `${wood}_button`
    if (blockId === 'stone') return 'stone_button'
    if (blockId === 'polished_blackstone') return 'polished_blackstone_button'
    return `${blockId}_button`
  }

  // ── Carpet ───────────────────────────────────────────────────────────────
  if (variantType === 'carpet') {
    // white_wool → white_carpet etc
    return blockId.replace('_wool', '_carpet')
  }

  // ── Slab double = full block of slab material ─────────────────────────────
  if (variantType === 'slab_double') return blockId

  return blockId
}

// Resolve the blockstate properties string for a given variant
// Returns empty string for full blocks (no properties needed)
export function resolveBlockstateProperties(variantType: VariantType): string {
  switch (variantType) {
    case 'full':
      return ''

    // Slabs
    case 'slab_bottom':
      return '[type=bottom]'
    case 'slab_top':
      return '[type=top]'
    case 'slab_double':
      return '[type=double]'

    // Stairs
    case 'stairs_bottom_north':
      return '[facing=north,half=bottom,shape=straight,waterlogged=false]'
    case 'stairs_bottom_south':
      return '[facing=south,half=bottom,shape=straight,waterlogged=false]'
    case 'stairs_bottom_east':
      return '[facing=east,half=bottom,shape=straight,waterlogged=false]'
    case 'stairs_bottom_west':
      return '[facing=west,half=bottom,shape=straight,waterlogged=false]'
    case 'stairs_top_north':
      return '[facing=north,half=top,shape=straight,waterlogged=false]'
    case 'stairs_top_south':
      return '[facing=south,half=top,shape=straight,waterlogged=false]'
    case 'stairs_top_east':
      return '[facing=east,half=top,shape=straight,waterlogged=false]'
    case 'stairs_top_west':
      return '[facing=west,half=top,shape=straight,waterlogged=false]'

    // Wall
    case 'wall':
      return '[east=none,north=none,south=none,up=true,waterlogged=false,west=none]'

    // Fence
    case 'fence':
      return '[east=false,north=false,south=false,waterlogged=false,west=false]'

    // Fence gates
    case 'fence_gate_north':
      return '[facing=north,in_wall=false,open=false,powered=false]'
    case 'fence_gate_south':
      return '[facing=south,in_wall=false,open=false,powered=false]'
    case 'fence_gate_east':
      return '[facing=east,in_wall=false,open=false,powered=false]'
    case 'fence_gate_west':
      return '[facing=west,in_wall=false,open=false,powered=false]'

    // Doors
    case 'door_lower':
      return '[facing=north,half=lower,hinge=left,open=false,powered=false]'
    case 'door_upper':
      return '[facing=north,half=upper,hinge=left,open=false,powered=false]'

    // Trapdoors
    case 'trapdoor_bottom':
      return '[facing=north,half=bottom,open=false,powered=false,waterlogged=false]'
    case 'trapdoor_top':
      return '[facing=north,half=top,open=false,powered=false,waterlogged=false]'
    case 'trapdoor_open_north':
      return '[facing=north,half=bottom,open=true,powered=false,waterlogged=false]'
    case 'trapdoor_open_south':
      return '[facing=south,half=bottom,open=true,powered=false,waterlogged=false]'
    case 'trapdoor_open_east':
      return '[facing=east,half=bottom,open=true,powered=false,waterlogged=false]'
    case 'trapdoor_open_west':
      return '[facing=west,half=bottom,open=true,powered=false,waterlogged=false]'

    // Pressure plates
    case 'pressure_plate':
      return '[powered=false]'

    // Buttons
    case 'button_north':
      return '[face=wall,facing=north,powered=false]'
    case 'button_south':
      return '[face=wall,facing=south,powered=false]'
    case 'button_east':
      return '[face=wall,facing=east,powered=false]'
    case 'button_west':
      return '[face=wall,facing=west,powered=false]'

    // Carpet — no blockstate properties
    case 'carpet':
      return ''

    default:
      return ''
  }
}

// Build the full MC blockstate string for litematic export
// e.g. "minecraft:oak_stairs[facing=north,half=bottom,shape=straight,waterlogged=false]"
export function buildBlockstateString(
  blockId: string,
  variantType: VariantType
): string {
  const exportId = resolveExportBlockId(blockId, variantType)
  const properties = resolveBlockstateProperties(variantType)
  return `minecraft:${exportId}${properties}`
}