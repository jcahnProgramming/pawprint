'use client'

import { useMemo } from 'react'
import * as THREE from 'three'
import { useEditorStore, PlacedBlock } from '@/store/editorStore'
import { getBlockTextures } from '@/lib/blockTextures'
import { getBlockMaterials } from '@/lib/textureLoader'
import { getVariantGeometry, Connections } from '@/lib/variantGeometry'
import { VariantType } from '@/lib/blockVariants'

// Block types that auto-connect to neighbors
const CONNECTABLE = new Set(['fence', 'wall'])

function isConnectable(block: PlacedBlock | undefined): boolean {
  if (!block) return false
  return CONNECTABLE.has(block.variantType)
}

function getConnections(
  x: number,
  y: number,
  z: number,
  variantType: VariantType,
  blocks: Map<string, PlacedBlock>
): Connections {
  if (!CONNECTABLE.has(variantType)) {
    return { north: false, south: false, east: false, west: false }
  }

  const north = blocks.get(`${x},${y},${z - 1}`)
  const south = blocks.get(`${x},${y},${z + 1}`)
  const east = blocks.get(`${x + 1},${y},${z}`)
  const west = blocks.get(`${x - 1},${y},${z}`)

  // Connect to same variant type OR to solid full blocks
  const shouldConnect = (neighbor: PlacedBlock | undefined) => {
    if (!neighbor) return false
    if (CONNECTABLE.has(neighbor.variantType)) return true
    if (neighbor.variantType === 'full') return true
    return false
  }

  return {
    north: shouldConnect(north),
    south: shouldConnect(south),
    east: shouldConnect(east),
    west: shouldConnect(west),
  }
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
    }[] = []

    blocks.forEach((block, key) => {
      const [x, y, z] = key.split(',').map(Number)
      const variantType = block.variantType ?? 'full'
      const connections = getConnections(x, y, z, variantType, blocks)
      result.push({ key, x, y, z, id: block.id, color: block.color, variantType, connections })
    })

    return result
  }, [blocks])

  return (
    <>
      {entries.map(({ key, x, y, z, id, color, variantType, connections }) => (
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
}: {
  blockKey: string
  x: number
  y: number
  z: number
  id: string
  color: string
  variantType: VariantType
  connections: Connections
}) {
  const faceTextures = useMemo(() => getBlockTextures(id), [id])
  const materials = useMemo(
    () => getBlockMaterials(id, color, faceTextures),
    [id, color, faceTextures]
  )
  const parts = useMemo(
    () => getVariantGeometry(variantType, connections),
    [variantType, connections]
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