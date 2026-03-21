'use client'

import { useRef, useEffect } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { useKeyboardControls } from '@react-three/drei'
import * as THREE from 'three'
import { useEditorStore } from '@/store/editorStore'
import GroundGrid from './GroundGrid'
import HoverOutline from './HoverOutline'

const MOVE_SPEED = 10
const LOOK_SENSITIVITY = 0.002

export default function Scene() {
  const { camera, gl } = useThree()
  const pitchRef = useRef(0)
  const yawRef = useRef(0)
  const isLocked = useEditorStore((s) => s.isPointerLocked)
  const setLocked = useEditorStore((s) => s.setPointerLocked)
  const [, getKeys] = useKeyboardControls()

  // Pointer lock setup
  useEffect(() => {
    const canvas = gl.domElement

    const onClick = () => {
      canvas.requestPointerLock()
    }

    const onLockChange = () => {
      setLocked(document.pointerLockElement === canvas)
    }

    const onMouseMove = (e: MouseEvent) => {
      if (document.pointerLockElement !== canvas) return
      yawRef.current -= e.movementX * LOOK_SENSITIVITY
      pitchRef.current -= e.movementY * LOOK_SENSITIVITY
      pitchRef.current = Math.max(-Math.PI / 2 + 0.01, Math.min(Math.PI / 2 - 0.01, pitchRef.current))
    }

    canvas.addEventListener('click', onClick)
    document.addEventListener('pointerlockchange', onLockChange)
    document.addEventListener('mousemove', onMouseMove)

    return () => {
      canvas.removeEventListener('click', onClick)
      document.removeEventListener('pointerlockchange', onLockChange)
      document.removeEventListener('mousemove', onMouseMove)
    }
  }, [gl, setLocked])

  // Movement + camera rotation each frame
  useFrame((_, delta) => {
    if (!isLocked) return

    const keys = getKeys()
    const speed = MOVE_SPEED * delta

    // Build direction from yaw only (horizontal movement)
    const forward = new THREE.Vector3(-Math.sin(yawRef.current), 0, -Math.cos(yawRef.current))
    const right = new THREE.Vector3(Math.cos(yawRef.current), 0, -Math.sin(yawRef.current))

    if (keys.forward) camera.position.addScaledVector(forward, speed)
    if (keys.backward) camera.position.addScaledVector(forward, -speed)
    if (keys.right) camera.position.addScaledVector(right, speed)
    if (keys.left) camera.position.addScaledVector(right, -speed)
    if (keys.up) camera.position.y += speed
    if (keys.down) camera.position.y -= speed

    // Apply yaw + pitch to camera
    const euler = new THREE.Euler(pitchRef.current, yawRef.current, 0, 'YXZ')
    camera.quaternion.setFromEuler(euler)
  })

  return (
    <>
      {/* Minecraft-style sky */}
      <color attach="background" args={['#87CEEB']} />
      <fog attach="fog" args={['#87CEEB', 60, 200]} />

      {/* Lighting */}
      <ambientLight intensity={0.8} />
      <directionalLight
        position={[50, 100, 50]}
        intensity={1.2}
        castShadow
      />

      {/* Ground grid */}
      <GroundGrid />

      {/* Hover outline */}
      <HoverOutline />

      {/* Temp reference block so we have something to look at */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshLambertMaterial color="#7ec850" />
      </mesh>
      <mesh position={[0, -0.5, 0]}>
        <boxGeometry args={[50, 1, 50]} />
        <meshLambertMaterial color="#8B6914" />
      </mesh>
    </>
  )
}