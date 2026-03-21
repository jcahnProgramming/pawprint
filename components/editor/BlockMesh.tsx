'use client'

import { useMemo } from 'react'
import * as THREE from 'three'
import { useEditorStore } from '@/store/editorStore'

export default function BlockMesh() {
  const blocks = useEditorStore((s) => s.blocks)

  const entries = useMemo(() => {
    const result: { key: string; x: number; y: number; z: number; color: string }[] = []
    blocks.forEach((block, key) => {
      const [x, y, z] = key.split(',').map(Number)
      result.push({ key, x, y, z, color: block.color })
    })
    return result
  }, [blocks])

  return (
    <>
      {entries.map(({ key, x, y, z, color }) => (
        <mesh
          key={key}
          position={[x + 0.5, y + 0.5, z + 0.5]}
          userData={{ isBlock: true, blockKey: key }}
        >
          <boxGeometry args={[1, 1, 1]} />
          <meshLambertMaterial color={color} />
        </mesh>
      ))}
    </>
  )
}