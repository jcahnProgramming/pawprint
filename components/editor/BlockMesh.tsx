'use client'

import { useMemo } from 'react'
import * as THREE from 'three'
import { useEditorStore, PlacedBlock } from '@/store/editorStore'
import { getBlockTextures } from '@/lib/blockTextures'
import { getBlockMaterials } from '@/lib/textureLoader'
import { getVariantGeometry, Connections } from '@/lib/variantGeometry'
import { VariantType } from '@/lib/blockVariants'

const FENCE_TYPES = new Set<VariantType>([
  'fence',
  'fence_gate_north',
  'fence_gate_south',
  'fence_gate_east',
  'fence_gate_west',
])
const WALL_TYPES = new Set<VariantType>(['wall'])
const CONNECTABLE_TYPES = new Set<VariantType>([...FENCE_TYPES, ...WALL_TYPES])
const DOOR_TYPES = new Set<VariantType>(['door_lower', 'door_upper'])

function resolveTextureId(blockId: string, variantType: VariantType): string {
  const wood = blockId.replace('_planks', '')

  if (variantType === 'door_lower' || variantType === 'door_upper') {
    if (blockId.endsWith('_planks')) return `${wood}_door`
    return `${blockId}_door`
  }
  if (
    variantType === 'trapdoor_bottom' ||
    variantType === 'trapdoor_top' ||
    variantType.startsWith('trapdoor_open')
  ) {
    if (blockId.endsWith('_planks')) return `${wood}_trapdoor`
    return `${blockId}_trapdoor`
  }
  return blockId
}

function getConnections(
  x: number,
  y: number,
  z: number,
  variantType: VariantType,
  blocks: Map<string, PlacedBlock>
): Connections {
  if (!CONNECTABLE_TYPES.has(variantType)) {
    return { north: false, south: false, east: false, west: false }
  }

  const isFence = FENCE_TYPES.has(variantType)
  const isWall = WALL_TYPES.has(variantType)

  const shouldConnect = (neighbor: PlacedBlock | undefined): boolean => {
    if (!neighbor) return false
    const nv = neighbor.variantType ?? 'full'
    if (nv === 'full') return true
    if (isFence && FENCE_TYPES.has(nv)) return true
    if (isWall && (WALL_TYPES.has(nv) || FENCE_TYPES.has(nv))) return true
    return false
  }

  return {
    north: shouldConnect(blocks.get(`${x},${y},${z - 1}`)),
    south: shouldConnect(blocks.get(`${x},${y},${z + 1}`)),
    east:  shouldConnect(blocks.get(`${x + 1},${y},${z}`)),
    west:  shouldConnect(blocks.get(`${x - 1},${y},${z}`)),
  }
}

// Detect if a door should be mirrored based on adjacent same-type door
function isDoorMirrored(
  x: number,
  y: number,
  z: number,
  variantType: VariantType,
  blocks: Map<string, PlacedBlock>
): boolean {
  if (!DOOR_TYPES.has(variantType)) return false

  // Check east neighbor — if there's a door there, we are the left door (not mirrored)
  // If there's a door to the west, we are the right door (mirrored)
  const west = blocks.get(`${x - 1},${y},${z}`)
  if (west && DOOR_TYPES.has(west.variantType)) return true

  const north = blocks.get(`${x},${y},${z - 1}`)
  if (north && DOOR_TYPES.has(north.variantType)) return true

  return false
}

export default function BlockMesh() {
  const blocks = useEditorStore((s) => s.blocks)

  const entries = useMemo(() => {
    const result: {
      key: string
      x: number
      y: number
      z: number
      id: string
      color: string
      variantType: VariantType
      connections: Connections
      mirrored: boolean
    }[] = []

    blocks.forEach((block, key) => {
      const [x, y, z] = key.split(',').map(Number)
      const variantType = block.variantType ?? 'full'
      const connections = getConnections(x, y, z, variantType, blocks)
      const mirrored = isDoorMirrored(x, y, z, variantType, blocks)
      result.push({
        key,
        x,
        y,
        z,
        id: block.id,
        color: block.color,
        variantType,
        connections,
        mirrored,
      })
    })

    return result
  }, [blocks])

  return (
    <>
      {entries.map(({ key, x, y, z, id, color, variantType, connections, mirrored }) => (
        <VariantBlock
          key={key}
          blockKey={key}
          x={x}
          y={y}
          z={z}
          id={id}
          color={color}
          variantType={variantType}
          connections={connections}
          mirrored={mirrored}
        />
      ))}
    </>
  )
}

function VariantBlock({
  blockKey,
  x, y, z,
  id,
  color,
  variantType,
  connections,
  mirrored,
}: {
  blockKey: string
  x: number
  y: number
  z: number
  id: string
  color: string
  variantType: VariantType
  connections: Connections
  mirrored: boolean
}) {
  const textureId = useMemo(
    () => resolveTextureId(id, variantType),
    [id, variantType]
  )

  const faceTextures = useMemo(
    () => getBlockTextures(textureId),
    [textureId]
  )

  const materials = useMemo(
    () => getBlockMaterials(textureId, color, faceTextures, variantType, mirrored),
    [textureId, color, faceTextures, variantType, mirrored]
  )

  const parts = useMemo(
    () => getVariantGeometry(variantType, connections),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [variantType, connections.north, connections.south, connections.east, connections.west]
  )

  return (
    <group
      position={[x + 0.5, y + 0.5, z + 0.5]}
      userData={{ isBlock: true, blockKey }}
    >
      {parts.map((part, i) => (
        <mesh
          key={i}
          geometry={part.geometry}
          position={part.position}
          rotation={part.rotation}
          material={materials}
          userData={{ isBlock: true, blockKey }}
        />
      ))}
    </group>
  )
}