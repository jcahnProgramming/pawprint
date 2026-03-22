import * as THREE from 'three'
import { VariantType } from './blockVariants'

export type GeometryPart = {
  geometry: THREE.BufferGeometry
  position: THREE.Vector3
  rotation: THREE.Euler
}

export type Connections = {
  north: boolean
  south: boolean
  east: boolean
  west: boolean
}

// ── Geometry cache ────────────────────────────────────────────────────────────
const geoCache = new Map<string, THREE.BufferGeometry>()

function box(w: number, h: number, d: number): THREE.BufferGeometry {
  const key = `${w}x${h}x${d}`
  if (!geoCache.has(key)) {
    geoCache.set(key, new THREE.BoxGeometry(w, h, d))
  }
  return geoCache.get(key)!
}

function pt(x: number, y: number, z: number): THREE.Vector3 {
  return new THREE.Vector3(x, y, z)
}

const ROT0 = new THREE.Euler()

export function getVariantGeometry(
  variant: VariantType,
  connections: Connections = { north: false, south: false, east: false, west: false }
): GeometryPart[] {
  switch (variant) {

    // ── Full / Double Slab ────────────────────────────────────────────────────
    case 'full':
    case 'slab_double':
      return [{ geometry: box(1, 1, 1), position: pt(0, 0, 0), rotation: ROT0 }]

    // ── Slabs ─────────────────────────────────────────────────────────────────
    case 'slab_bottom':
      return [{ geometry: box(1, 0.5, 1), position: pt(0, -0.25, 0), rotation: ROT0 }]

    case 'slab_top':
      return [{ geometry: box(1, 0.5, 1), position: pt(0, 0.25, 0), rotation: ROT0 }]

    // ── Stairs ────────────────────────────────────────────────────────────────
    case 'stairs_bottom_north':
      return [
        { geometry: box(1, 0.5, 1), position: pt(0, -0.25, 0), rotation: ROT0 },
        { geometry: box(1, 0.5, 0.5), position: pt(0, 0.25, -0.25), rotation: ROT0 },
      ]
    case 'stairs_bottom_south':
      return [
        { geometry: box(1, 0.5, 1), position: pt(0, -0.25, 0), rotation: ROT0 },
        { geometry: box(1, 0.5, 0.5), position: pt(0, 0.25, 0.25), rotation: ROT0 },
      ]
    case 'stairs_bottom_east':
      return [
        { geometry: box(1, 0.5, 1), position: pt(0, -0.25, 0), rotation: ROT0 },
        { geometry: box(0.5, 0.5, 1), position: pt(0.25, 0.25, 0), rotation: ROT0 },
      ]
    case 'stairs_bottom_west':
      return [
        { geometry: box(1, 0.5, 1), position: pt(0, -0.25, 0), rotation: ROT0 },
        { geometry: box(0.5, 0.5, 1), position: pt(-0.25, 0.25, 0), rotation: ROT0 },
      ]
    case 'stairs_top_north':
      return [
        { geometry: box(1, 0.5, 1), position: pt(0, 0.25, 0), rotation: ROT0 },
        { geometry: box(1, 0.5, 0.5), position: pt(0, -0.25, -0.25), rotation: ROT0 },
      ]
    case 'stairs_top_south':
      return [
        { geometry: box(1, 0.5, 1), position: pt(0, 0.25, 0), rotation: ROT0 },
        { geometry: box(1, 0.5, 0.5), position: pt(0, -0.25, 0.25), rotation: ROT0 },
      ]
    case 'stairs_top_east':
      return [
        { geometry: box(1, 0.5, 1), position: pt(0, 0.25, 0), rotation: ROT0 },
        { geometry: box(0.5, 0.5, 1), position: pt(0.25, -0.25, 0), rotation: ROT0 },
      ]
    case 'stairs_top_west':
      return [
        { geometry: box(1, 0.5, 1), position: pt(0, 0.25, 0), rotation: ROT0 },
        { geometry: box(0.5, 0.5, 1), position: pt(-0.25, -0.25, 0), rotation: ROT0 },
      ]

    // ── Wall ──────────────────────────────────────────────────────────────────
    case 'wall': {
      const parts: GeometryPart[] = [
        { geometry: box(0.5, 1, 0.5), position: pt(0, 0, 0), rotation: ROT0 },
      ]
      if (connections.north)
        parts.push({ geometry: box(0.375, 0.8125, 0.25), position: pt(0, -0.09375, -0.375), rotation: ROT0 })
      if (connections.south)
        parts.push({ geometry: box(0.375, 0.8125, 0.25), position: pt(0, -0.09375, 0.375), rotation: ROT0 })
      if (connections.east)
        parts.push({ geometry: box(0.25, 0.8125, 0.375), position: pt(0.375, -0.09375, 0), rotation: ROT0 })
      if (connections.west)
        parts.push({ geometry: box(0.25, 0.8125, 0.375), position: pt(-0.375, -0.09375, 0), rotation: ROT0 })
      return parts
    }

    // ── Fence ─────────────────────────────────────────────────────────────────
    case 'fence': {
      const parts: GeometryPart[] = [
        // Center post — full height
        { geometry: box(0.25, 1, 0.25), position: pt(0, 0, 0), rotation: ROT0 },
      ]
      if (connections.north) {
        parts.push({ geometry: box(0.125, 0.125, 0.375), position: pt(0, 0.25, -0.3125), rotation: ROT0 })
        parts.push({ geometry: box(0.125, 0.125, 0.375), position: pt(0, -0.0625, -0.3125), rotation: ROT0 })
      }
      if (connections.south) {
        parts.push({ geometry: box(0.125, 0.125, 0.375), position: pt(0, 0.25, 0.3125), rotation: ROT0 })
        parts.push({ geometry: box(0.125, 0.125, 0.375), position: pt(0, -0.0625, 0.3125), rotation: ROT0 })
      }
      if (connections.east) {
        parts.push({ geometry: box(0.375, 0.125, 0.125), position: pt(0.3125, 0.25, 0), rotation: ROT0 })
        parts.push({ geometry: box(0.375, 0.125, 0.125), position: pt(0.3125, -0.0625, 0), rotation: ROT0 })
      }
      if (connections.west) {
        parts.push({ geometry: box(0.375, 0.125, 0.125), position: pt(-0.3125, 0.25, 0), rotation: ROT0 })
        parts.push({ geometry: box(0.375, 0.125, 0.125), position: pt(-0.3125, -0.0625, 0), rotation: ROT0 })
      }
      return parts
    }

    // ── Fence Gate ────────────────────────────────────────────────────────────
    // In MC, fence gates float slightly above the ground block
    // The gate occupies the upper ~14/16 of the block space
    // Bottom of gate starts at y = -0.125 (2/16 above block bottom)

    // N/S facing — gate panel runs east/west, player walks through north/south
    case 'fence_gate_north':
    case 'fence_gate_south':
      return [
        // Left post — full gate height, thin north/south depth
        { geometry: box(0.25, 0.8125, 0.125), position: pt(-0.375, 0.09375, 0), rotation: ROT0 },
        // Right post
        { geometry: box(0.25, 0.8125, 0.125), position: pt(0.375, 0.09375, 0), rotation: ROT0 },
        // Top horizontal bar — near top of gate
        { geometry: box(0.5, 0.125, 0.125), position: pt(0, 0.375, 0), rotation: ROT0 },
        // Bottom horizontal bar — raised off ground
        { geometry: box(0.5, 0.125, 0.125), position: pt(0, -0.0625, 0), rotation: ROT0 },
        // Center vertical divider between bars
        { geometry: box(0.125, 0.25, 0.125), position: pt(0, 0.1875, 0), rotation: ROT0 },
      ]

    // E/W facing — gate panel runs north/south, player walks through east/west
    case 'fence_gate_east':
    case 'fence_gate_west':
      return [
        // Left post
        { geometry: box(0.125, 0.8125, 0.25), position: pt(0, 0.09375, -0.375), rotation: ROT0 },
        // Right post
        { geometry: box(0.125, 0.8125, 0.25), position: pt(0, 0.09375, 0.375), rotation: ROT0 },
        // Top horizontal bar
        { geometry: box(0.125, 0.125, 0.5), position: pt(0, 0.375, 0), rotation: ROT0 },
        // Bottom horizontal bar — raised off ground
        { geometry: box(0.125, 0.125, 0.5), position: pt(0, -0.0625, 0), rotation: ROT0 },
        // Center vertical divider between bars
        { geometry: box(0.125, 0.25, 0.125), position: pt(0, 0.1875, 0), rotation: ROT0 },
      ]

    // ── Trapdoor ──────────────────────────────────────────────────────────────
    case 'trapdoor_bottom':
      return [{ geometry: box(1, 0.1875, 1), position: pt(0, -0.40625, 0), rotation: ROT0 }]

    case 'trapdoor_top':
      return [{ geometry: box(1, 0.1875, 1), position: pt(0, 0.40625, 0), rotation: ROT0 }]

    case 'trapdoor_open_north':
      return [{ geometry: box(1, 1, 0.1875), position: pt(0, 0, -0.40625), rotation: ROT0 }]

    case 'trapdoor_open_south':
      return [{ geometry: box(1, 1, 0.1875), position: pt(0, 0, 0.40625), rotation: ROT0 }]

    case 'trapdoor_open_east':
      return [{ geometry: box(0.1875, 1, 1), position: pt(0.40625, 0, 0), rotation: ROT0 }]

    case 'trapdoor_open_west':
      return [{ geometry: box(0.1875, 1, 1), position: pt(-0.40625, 0, 0), rotation: ROT0 }]

    // ── Door ──────────────────────────────────────────────────────────────────
    case 'door_lower':
      return [{ geometry: box(1, 1, 0.1875), position: pt(0, 0, 0), rotation: ROT0 }]

    case 'door_upper':
      return [{ geometry: box(1, 1, 0.1875), position: pt(0, 0, 0), rotation: ROT0 }]

    // ── Pressure Plate ────────────────────────────────────────────────────────
    case 'pressure_plate':
      return [{ geometry: box(0.875, 0.0625, 0.875), position: pt(0, -0.46875, 0), rotation: ROT0 }]

    // ── Buttons ───────────────────────────────────────────────────────────────
    case 'button_north':
      return [{ geometry: box(0.375, 0.25, 0.125), position: pt(0, 0, -0.4375), rotation: ROT0 }]

    case 'button_south':
      return [{ geometry: box(0.375, 0.25, 0.125), position: pt(0, 0, 0.4375), rotation: ROT0 }]

    case 'button_east':
      return [{ geometry: box(0.125, 0.25, 0.375), position: pt(0.4375, 0, 0), rotation: ROT0 }]

    case 'button_west':
      return [{ geometry: box(0.125, 0.25, 0.375), position: pt(-0.4375, 0, 0), rotation: ROT0 }]

    // ── Carpet ────────────────────────────────────────────────────────────────
    case 'carpet':
      return [{ geometry: box(1, 0.0625, 1), position: pt(0, -0.46875, 0), rotation: ROT0 }]

    // ── Fallback ──────────────────────────────────────────────────────────────
    default:
      return [{ geometry: box(1, 1, 1), position: pt(0, 0, 0), rotation: ROT0 }]
  }
}