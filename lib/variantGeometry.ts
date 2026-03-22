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

function box(w: number, h: number, d: number): THREE.BufferGeometry {
  return new THREE.BoxGeometry(w, h, d)
}

export function getVariantGeometry(
  variant: VariantType,
  connections: Connections = { north: false, south: false, east: false, west: false }
): GeometryPart[] {
  switch (variant) {

    case 'full':
    case 'slab_double':
      return [{ geometry: box(1, 1, 1), position: new THREE.Vector3(0, 0, 0), rotation: new THREE.Euler() }]

    case 'slab_bottom':
      return [{ geometry: box(1, 0.5, 1), position: new THREE.Vector3(0, -0.25, 0), rotation: new THREE.Euler() }]

    case 'slab_top':
      return [{ geometry: box(1, 0.5, 1), position: new THREE.Vector3(0, 0.25, 0), rotation: new THREE.Euler() }]

    case 'stairs_bottom_north':
      return [
        { geometry: box(1, 0.5, 1), position: new THREE.Vector3(0, -0.25, 0), rotation: new THREE.Euler() },
        { geometry: box(1, 0.5, 0.5), position: new THREE.Vector3(0, 0.25, -0.25), rotation: new THREE.Euler() },
      ]
    case 'stairs_bottom_south':
      return [
        { geometry: box(1, 0.5, 1), position: new THREE.Vector3(0, -0.25, 0), rotation: new THREE.Euler() },
        { geometry: box(1, 0.5, 0.5), position: new THREE.Vector3(0, 0.25, 0.25), rotation: new THREE.Euler() },
      ]
    case 'stairs_bottom_east':
      return [
        { geometry: box(1, 0.5, 1), position: new THREE.Vector3(0, -0.25, 0), rotation: new THREE.Euler() },
        { geometry: box(0.5, 0.5, 1), position: new THREE.Vector3(0.25, 0.25, 0), rotation: new THREE.Euler() },
      ]
    case 'stairs_bottom_west':
      return [
        { geometry: box(1, 0.5, 1), position: new THREE.Vector3(0, -0.25, 0), rotation: new THREE.Euler() },
        { geometry: box(0.5, 0.5, 1), position: new THREE.Vector3(-0.25, 0.25, 0), rotation: new THREE.Euler() },
      ]
    case 'stairs_top_north':
      return [
        { geometry: box(1, 0.5, 1), position: new THREE.Vector3(0, 0.25, 0), rotation: new THREE.Euler() },
        { geometry: box(1, 0.5, 0.5), position: new THREE.Vector3(0, -0.25, -0.25), rotation: new THREE.Euler() },
      ]
    case 'stairs_top_south':
      return [
        { geometry: box(1, 0.5, 1), position: new THREE.Vector3(0, 0.25, 0), rotation: new THREE.Euler() },
        { geometry: box(1, 0.5, 0.5), position: new THREE.Vector3(0, -0.25, 0.25), rotation: new THREE.Euler() },
      ]
    case 'stairs_top_east':
      return [
        { geometry: box(1, 0.5, 1), position: new THREE.Vector3(0, 0.25, 0), rotation: new THREE.Euler() },
        { geometry: box(0.5, 0.5, 1), position: new THREE.Vector3(0.25, -0.25, 0), rotation: new THREE.Euler() },
      ]
    case 'stairs_top_west':
      return [
        { geometry: box(1, 0.5, 1), position: new THREE.Vector3(0, 0.25, 0), rotation: new THREE.Euler() },
        { geometry: box(0.5, 0.5, 1), position: new THREE.Vector3(-0.25, -0.25, 0), rotation: new THREE.Euler() },
      ]

    // ── Wall ──────────────────────────────────────────────────────────────────
    case 'wall': {
      const parts: GeometryPart[] = [
        // Center post always present
        { geometry: box(0.5, 1, 0.5), position: new THREE.Vector3(0, 0, 0), rotation: new THREE.Euler() },
      ]
      // Add arms only where connected
      if (connections.north)
        parts.push({ geometry: box(0.375, 0.8125, 0.25), position: new THREE.Vector3(0, -0.09375, -0.375), rotation: new THREE.Euler() })
      if (connections.south)
        parts.push({ geometry: box(0.375, 0.8125, 0.25), position: new THREE.Vector3(0, -0.09375, 0.375), rotation: new THREE.Euler() })
      if (connections.east)
        parts.push({ geometry: box(0.25, 0.8125, 0.375), position: new THREE.Vector3(0.375, -0.09375, 0), rotation: new THREE.Euler() })
      if (connections.west)
        parts.push({ geometry: box(0.25, 0.8125, 0.375), position: new THREE.Vector3(-0.375, -0.09375, 0), rotation: new THREE.Euler() })
      return parts
    }

    // ── Fence ─────────────────────────────────────────────────────────────────
    case 'fence': {
      const parts: GeometryPart[] = [
        // Center post always present
        { geometry: box(0.25, 1, 0.25), position: new THREE.Vector3(0, 0, 0), rotation: new THREE.Euler() },
      ]
      // North arm (toward -Z)
      if (connections.north) {
        parts.push({ geometry: box(0.125, 0.125, 0.375), position: new THREE.Vector3(0, 0.25, -0.3125), rotation: new THREE.Euler() })
        parts.push({ geometry: box(0.125, 0.125, 0.375), position: new THREE.Vector3(0, -0.0625, -0.3125), rotation: new THREE.Euler() })
      }
      // South arm (toward +Z)
      if (connections.south) {
        parts.push({ geometry: box(0.125, 0.125, 0.375), position: new THREE.Vector3(0, 0.25, 0.3125), rotation: new THREE.Euler() })
        parts.push({ geometry: box(0.125, 0.125, 0.375), position: new THREE.Vector3(0, -0.0625, 0.3125), rotation: new THREE.Euler() })
      }
      // East arm (toward +X)
      if (connections.east) {
        parts.push({ geometry: box(0.375, 0.125, 0.125), position: new THREE.Vector3(0.3125, 0.25, 0), rotation: new THREE.Euler() })
        parts.push({ geometry: box(0.375, 0.125, 0.125), position: new THREE.Vector3(0.3125, -0.0625, 0), rotation: new THREE.Euler() })
      }
      // West arm (toward -X)
      if (connections.west) {
        parts.push({ geometry: box(0.375, 0.125, 0.125), position: new THREE.Vector3(-0.3125, 0.25, 0), rotation: new THREE.Euler() })
        parts.push({ geometry: box(0.375, 0.125, 0.125), position: new THREE.Vector3(-0.3125, -0.0625, 0), rotation: new THREE.Euler() })
      }
      return parts
    }

    // ── Fence Gate ────────────────────────────────────────────────────────────
    case 'fence_gate_north':
    case 'fence_gate_south':
      return [
        { geometry: box(0.25, 1, 0.125), position: new THREE.Vector3(-0.375, 0, 0), rotation: new THREE.Euler() },
        { geometry: box(0.25, 1, 0.125), position: new THREE.Vector3(0.375, 0, 0), rotation: new THREE.Euler() },
        { geometry: box(0.5, 0.125, 0.125), position: new THREE.Vector3(0, 0.25, 0), rotation: new THREE.Euler() },
        { geometry: box(0.5, 0.125, 0.125), position: new THREE.Vector3(0, -0.0625, 0), rotation: new THREE.Euler() },
      ]
    case 'fence_gate_east':
    case 'fence_gate_west':
      return [
        { geometry: box(0.125, 1, 0.25), position: new THREE.Vector3(0, 0, -0.375), rotation: new THREE.Euler() },
        { geometry: box(0.125, 1, 0.25), position: new THREE.Vector3(0, 0, 0.375), rotation: new THREE.Euler() },
        { geometry: box(0.125, 0.125, 0.5), position: new THREE.Vector3(0, 0.25, 0), rotation: new THREE.Euler() },
        { geometry: box(0.125, 0.125, 0.5), position: new THREE.Vector3(0, -0.0625, 0), rotation: new THREE.Euler() },
      ]

    // ── Trapdoor ──────────────────────────────────────────────────────────────
    case 'trapdoor_bottom':
      return [{ geometry: box(1, 0.1875, 1), position: new THREE.Vector3(0, -0.40625, 0), rotation: new THREE.Euler() }]
    case 'trapdoor_top':
      return [{ geometry: box(1, 0.1875, 1), position: new THREE.Vector3(0, 0.40625, 0), rotation: new THREE.Euler() }]
    case 'trapdoor_open_north':
      return [{ geometry: box(1, 1, 0.1875), position: new THREE.Vector3(0, 0, -0.40625), rotation: new THREE.Euler() }]
    case 'trapdoor_open_south':
      return [{ geometry: box(1, 1, 0.1875), position: new THREE.Vector3(0, 0, 0.40625), rotation: new THREE.Euler() }]
    case 'trapdoor_open_east':
      return [{ geometry: box(0.1875, 1, 1), position: new THREE.Vector3(0.40625, 0, 0), rotation: new THREE.Euler() }]
    case 'trapdoor_open_west':
      return [{ geometry: box(0.1875, 1, 1), position: new THREE.Vector3(-0.40625, 0, 0), rotation: new THREE.Euler() }]

    // ── Door ──────────────────────────────────────────────────────────────────
    case 'door_lower':
      return [{ geometry: box(1, 2, 0.1875), position: new THREE.Vector3(0, 0.5, 0), rotation: new THREE.Euler() }]
    case 'door_upper':
      return [{ geometry: box(1, 2, 0.1875), position: new THREE.Vector3(0, -0.5, 0), rotation: new THREE.Euler() }]

    // ── Pressure Plate ────────────────────────────────────────────────────────
    case 'pressure_plate':
      return [{ geometry: box(0.875, 0.0625, 0.875), position: new THREE.Vector3(0, -0.46875, 0), rotation: new THREE.Euler() }]

    // ── Buttons ───────────────────────────────────────────────────────────────
    case 'button_north':
      return [{ geometry: box(0.375, 0.25, 0.125), position: new THREE.Vector3(0, 0, -0.4375), rotation: new THREE.Euler() }]
    case 'button_south':
      return [{ geometry: box(0.375, 0.25, 0.125), position: new THREE.Vector3(0, 0, 0.4375), rotation: new THREE.Euler() }]
    case 'button_east':
      return [{ geometry: box(0.125, 0.25, 0.375), position: new THREE.Vector3(0.4375, 0, 0), rotation: new THREE.Euler() }]
    case 'button_west':
      return [{ geometry: box(0.125, 0.25, 0.375), position: new THREE.Vector3(-0.4375, 0, 0), rotation: new THREE.Euler() }]

    // ── Carpet ────────────────────────────────────────────────────────────────
    case 'carpet':
      return [{ geometry: box(1, 0.0625, 1), position: new THREE.Vector3(0, -0.46875, 0), rotation: new THREE.Euler() }]

    default:
      return [{ geometry: box(1, 1, 1), position: new THREE.Vector3(0, 0, 0), rotation: new THREE.Euler() }]
  }
}