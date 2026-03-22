'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useEditorStore } from '@/store/editorStore'
import { getLineBetween, getRectBetween } from '@/lib/toolHelpers'

let _PLACE_X: number | null = null
let _PLACE_Y: number | null = null
let _PLACE_Z: number | null = null

export function updateToolPreviewCursor(x: number | null, y: number | null, z: number | null) {
  _PLACE_X = x
  _PLACE_Y = y
  _PLACE_Z = z
}

const MAX_PREVIEW = 5000
const _matrix = new THREE.Matrix4()

function PointAMarker() {
  const toolPointA = useEditorStore((s) => s.toolPointA)
  const activeTool = useEditorStore((s) => s.activeTool)
  const isPreviewTool =
    activeTool === 'line' ||
    activeTool === 'rectangle' ||
    activeTool === 'copy'

  if (!toolPointA || !isPreviewTool) return null

  return (
    <mesh
      position={[toolPointA.x + 0.5, toolPointA.y + 0.5, toolPointA.z + 0.5]}
      userData={{ isGhost: true }}
    >
      <boxGeometry args={[1.06, 1.06, 1.06]} />
      <meshBasicMaterial color="#4CAF50" wireframe />
    </mesh>
  )
}

export default function ToolPreview() {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const activeTool = useEditorStore((s) => s.activeTool)
  const toolPointA = useEditorStore((s) => s.toolPointA)
  const selectedBlock = useEditorStore((s) => s.selectedBlock)

  useFrame(() => {
    if (!meshRef.current) return

    const isPreviewTool = activeTool === 'line' || activeTool === 'rectangle'
    const hasCursor =
      _PLACE_X !== null && _PLACE_Y !== null && _PLACE_Z !== null

    if (!toolPointA || !hasCursor || !isPreviewTool) {
      meshRef.current.count = 0
      meshRef.current.visible = false
      return
    }

    const a = toolPointA
    const b = { x: _PLACE_X!, y: _PLACE_Y!, z: _PLACE_Z! }

    let positions: { x: number; y: number; z: number }[] = []
    if (activeTool === 'line') positions = getLineBetween(a, b)
    else if (activeTool === 'rectangle') positions = getRectBetween(a, b)

    const count = Math.min(positions.length, MAX_PREVIEW)

    if (count === 0) {
      meshRef.current.count = 0
      meshRef.current.visible = false
      return
    }

    meshRef.current.visible = true
    meshRef.current.count = count

    for (let i = 0; i < count; i++) {
      const p = positions[i]
      _matrix.setPosition(p.x + 0.5, p.y + 0.5, p.z + 0.5)
      meshRef.current.setMatrixAt(i, _matrix)
    }
    meshRef.current.instanceMatrix.needsUpdate = true

    if (meshRef.current.material instanceof THREE.MeshLambertMaterial) {
      meshRef.current.material.color.set(selectedBlock.color)
    }
  })

  return (
    <>
      <instancedMesh
        ref={meshRef}
        args={[undefined, undefined, MAX_PREVIEW]}
        visible={false}
        userData={{ isGhost: true }}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshLambertMaterial
          color={selectedBlock.color}
          transparent
          opacity={0.4}
          depthWrite={false}
        />
      </instancedMesh>
      <PointAMarker />
    </>
  )
}