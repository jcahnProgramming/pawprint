'use client'

import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useEditorStore } from '@/store/editorStore'

const _raycaster = new THREE.Raycaster()
const _center = new THREE.Vector2(0, 0)

export default function HoverOutline() {
  const outlineRef = useRef<THREE.Mesh>(null)
  const { camera, scene } = useThree()
  const isLocked = useEditorStore((s) => s.isPointerLocked)
  const setHoveredBlock = useEditorStore((s) => s.setHoveredBlock)

  useFrame(() => {
    if (!isLocked || !outlineRef.current) return

    _raycaster.setFromCamera(_center, camera)
    const hits = _raycaster.intersectObjects(scene.children, true)

    const hit = hits.find(h => {
      const obj = h.object
      return obj instanceof THREE.Mesh &&
        !(obj.geometry instanceof THREE.EdgesGeometry) &&
        obj.userData.isBlock !== false &&
        !obj.userData.isOutline
    })

    if (hit && hit.face) {
      const normal = hit.face.normal.clone()
      const point = hit.point.clone()

      // Calculate block position from hit
      const blockPos = new THREE.Vector3(
        Math.floor(point.x - normal.x * 0.5 + 0.5),
        Math.floor(point.y - normal.y * 0.5 + 0.5),
        Math.floor(point.z - normal.z * 0.5 + 0.5),
      )

      outlineRef.current.position.set(blockPos.x, blockPos.y, blockPos.z)
      outlineRef.current.visible = true
      setHoveredBlock(blockPos)
    } else {
      outlineRef.current.visible = false
      setHoveredBlock(null)
    }
  })

  return (
    <mesh ref={outlineRef} visible={false} userData={{ isOutline: true }}>
      <boxGeometry args={[1.01, 1.01, 1.01]} />
      <meshBasicMaterial
        color="#000000"
        wireframe
        transparent
        opacity={0.8}
      />
    </mesh>
  )
}