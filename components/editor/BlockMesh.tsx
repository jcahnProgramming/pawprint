'use client'

import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useEditorStore } from '@/store/editorStore'
import { getBlockTextures } from '@/lib/blockTextures'
import { getBlockMaterials } from '@/lib/textureLoader'

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
    }[] = []
    blocks.forEach((block, key) => {
      const [x, y, z] = key.split(',').map(Number)
      result.push({ key, x, y, z, id: block.id, color: block.color })
    })
    return result
  }, [blocks])

  return (
    <>
      {entries.map(({ key, x, y, z, id, color }) => (
        <TexturedBlock
          key={key}
          blockKey={key}
          x={x}
          y={y}
          z={z}
          id={id}
          color={color}
        />
      ))}
    </>
  )
}

function TexturedBlock({
  blockKey,
  x, y, z,
  id,
  color,
}: {
  blockKey: string
  x: number
  y: number
  z: number
  id: string
  color: string
}) {
  const faceTextures = useMemo(() => getBlockTextures(id), [id])
  const materials = useMemo(
    () => getBlockMaterials(id, color, faceTextures),
    [id, color, faceTextures]
  )

  return (
    <mesh
      position={[x + 0.5, y + 0.5, z + 0.5]}
      userData={{ isBlock: true, blockKey }}
      material={materials}
    >
      <boxGeometry args={[1, 1, 1]} />
    </mesh>
  )
}