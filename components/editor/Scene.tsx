'use client'

import { useRef, useEffect } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { useKeyboardControls } from '@react-three/drei'
import * as THREE from 'three'
import { useEditorStore } from '@/store/editorStore'
import GroundGrid from './GroundGrid'
import BlockMesh from './BlockMesh'

const MOVE_SPEED = 10
const LOOK_SENSITIVITY = 0.002

let IS_LOCKED = false
let IS_ERASING = false
let HOVERED: { x: number; y: number; z: number } | null = null

// Exported for HUD reading
export let HUD_X = 0
export let HUD_Y = 0
export let HUD_Z = 0
export let HUD_FACING = 'North'
export let HUD_FPS = 0

function castRay(camera: THREE.Camera, scene: THREE.Scene) {
  const rc = new THREE.Raycaster()
  rc.setFromCamera(new THREE.Vector2(0, 0), camera)

  const hits = rc.intersectObjects(scene.children, true).filter(h =>
    !h.object.userData.isOutline &&
    !h.object.userData.isGhost
  )

  PLACE_X = null; PLACE_Y = null; PLACE_Z = null
  ERASE_X = null; ERASE_Y = null; ERASE_Z = null

  if (hits.length > 0 && hits[0].face) {
    const hit = hits[0]
    const norm = hit.face!.normal.clone().transformDirection(hit.object.matrixWorld)
    const ax = Math.abs(norm.x), ay = Math.abs(norm.y), az = Math.abs(norm.z)
    let nx = 0, ny = 0, nz = 0
    if (ax > ay && ax > az) nx = Math.sign(norm.x)
    else if (ay > ax && ay > az) ny = Math.sign(norm.y)
    else nz = Math.sign(norm.z)

    const hx = hit.point.x - nx * 0.5
    const hy = hit.point.y - ny * 0.5
    const hz = hit.point.z - nz * 0.5
    ERASE_X = Math.floor(hx)
    ERASE_Y = Math.floor(hy)
    ERASE_Z = Math.floor(hz)

    const px = hit.point.x + nx * 0.5
    const py = hit.point.y + ny * 0.5
    const pz = hit.point.z + nz * 0.5
    PLACE_X = Math.floor(px)
    PLACE_Y = Math.floor(py)
    PLACE_Z = Math.floor(pz)

    return { hasHit: true }
  }

  const ray = rc.ray
  if (Math.abs(ray.direction.y) > 0.001) {
    const t = -ray.origin.y / ray.direction.y
    if (t > 0 && t < 1000) {
      PLACE_X = Math.floor(ray.origin.x + t * ray.direction.x)
      PLACE_Y = 0
      PLACE_Z = Math.floor(ray.origin.z + t * ray.direction.z)
    }
  }

  return { hasHit: false }
}

let PLACE_X: number | null = null
let PLACE_Y: number | null = null
let PLACE_Z: number | null = null
let ERASE_X: number | null = null
let ERASE_Y: number | null = null
let ERASE_Z: number | null = null

function Outline() {
  const ref = useRef<THREE.Mesh>(null)
  const { camera, scene } = useThree()

  useFrame(() => {
    if (!ref.current) return
    if (!IS_LOCKED) { ref.current.visible = false; return }

    castRay(camera, scene as THREE.Scene)

    if (PLACE_X !== null && PLACE_Y !== null && PLACE_Z !== null) {
      ref.current.position.set(PLACE_X + 0.5, PLACE_Y + 0.5, PLACE_Z + 0.5)
      ref.current.visible = true
      HOVERED = { x: PLACE_X, y: PLACE_Y, z: PLACE_Z }
    } else {
      ref.current.visible = false
      HOVERED = null
    }
  })

  return (
    <mesh ref={ref} visible={false} userData={{ isOutline: true }}>
      <boxGeometry args={[1.02, 1.02, 1.02]} />
      <meshBasicMaterial color="#ffffff" wireframe transparent opacity={0.8} />
    </mesh>
  )
}

function Ghost() {
  const ref = useRef<THREE.Mesh>(null)
  const matRef = useRef<THREE.MeshLambertMaterial>(null)
  const selectedBlock = useEditorStore((s) => s.selectedBlock)

  useFrame(() => {
    if (!ref.current) return
    if (!IS_LOCKED || IS_ERASING) { ref.current.visible = false; return }
    if (matRef.current) matRef.current.color.set(selectedBlock.color)

    if (PLACE_X !== null && PLACE_Y !== null && PLACE_Z !== null) {
      ref.current.position.set(PLACE_X + 0.5, PLACE_Y + 0.5, PLACE_Z + 0.5)
      ref.current.visible = true
    } else {
      ref.current.visible = false
    }
  })

  return (
    <mesh ref={ref} visible={false} userData={{ isGhost: true }}>
      <boxGeometry args={[1, 1, 1]} />
      <meshLambertMaterial
        ref={matRef}
        color="#888"
        transparent
        opacity={0.5}
        depthWrite={false}
      />
    </mesh>
  )
}

export default function Scene() {
  const { camera, gl } = useThree()
  const pitch = useRef(0)
  const yaw = useRef(0)
  const lockTime = useRef(0)
  const [, getKeys] = useKeyboardControls()
  const setLocked = useEditorStore((s) => s.setPointerLocked)
  const setErasing = useEditorStore((s) => s.setErasing)

  useEffect(() => {
    const canvas = gl.domElement

    const onMouseDown = (e: MouseEvent) => {
      if (useEditorStore.getState().isPickerOpen) return

      if (!IS_LOCKED) {
        if (e.button === 0) canvas.requestPointerLock()
        return
      }

      if (Date.now() - lockTime.current < 300) return

      if (e.button === 0) {
        const store = useEditorStore.getState()
        if (IS_ERASING) {
          if (ERASE_X !== null && ERASE_Y !== null && ERASE_Z !== null) {
            store.removeBlock(ERASE_X, ERASE_Y, ERASE_Z)
          }
        } else {
          if (PLACE_X !== null && PLACE_Y !== null && PLACE_Z !== null) {
            store.placeBlock(PLACE_X, PLACE_Y, PLACE_Z)
          }
        }
      }

      if (e.button === 2) {
        document.exitPointerLock()
        useEditorStore.getState().setPickerOpen(true)
      }
    }

    const onContextMenu = (e: MouseEvent) => e.preventDefault()

    const onLockChange = () => {
      IS_LOCKED = document.pointerLockElement === canvas
      setLocked(IS_LOCKED)
      if (IS_LOCKED) lockTime.current = Date.now()
    }

    const onMouseMove = (e: MouseEvent) => {
      if (!IS_LOCKED) return
      yaw.current -= e.movementX * LOOK_SENSITIVITY
      pitch.current -= e.movementY * LOOK_SENSITIVITY
      pitch.current = Math.max(
        -Math.PI / 2 + 0.01,
        Math.min(Math.PI / 2 - 0.01, pitch.current)
      )
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'KeyR') { IS_ERASING = true; setErasing(true) }
    }
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'KeyR') { IS_ERASING = false; setErasing(false) }
    }

    canvas.addEventListener('mousedown', onMouseDown)
    canvas.addEventListener('contextmenu', onContextMenu)
    document.addEventListener('pointerlockchange', onLockChange)
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('keyup', onKeyUp)

    return () => {
      canvas.removeEventListener('mousedown', onMouseDown)
      canvas.removeEventListener('contextmenu', onContextMenu)
      document.removeEventListener('pointerlockchange', onLockChange)
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('keyup', onKeyUp)
    }
  }, [gl, setLocked, setErasing])

  useFrame((_, delta) => {
    // Always update FPS
    HUD_FPS = Math.round(1 / delta)

    if (!IS_LOCKED) return

    const keys = getKeys()
    const speed = MOVE_SPEED * delta
    const forward = new THREE.Vector3(-Math.sin(yaw.current), 0, -Math.cos(yaw.current))
    const right = new THREE.Vector3(Math.cos(yaw.current), 0, -Math.sin(yaw.current))
    if (keys.forward) camera.position.addScaledVector(forward, speed)
    if (keys.backward) camera.position.addScaledVector(forward, -speed)
    if (keys.right) camera.position.addScaledVector(right, speed)
    if (keys.left) camera.position.addScaledVector(right, -speed)
    if (keys.up) camera.position.y += speed
    if (keys.down) camera.position.y -= speed
    const euler = new THREE.Euler(pitch.current, yaw.current, 0, 'YXZ')
    camera.quaternion.setFromEuler(euler)

    // Update HUD position values
    HUD_X = HOVERED ? HOVERED.x : Math.floor(camera.position.x)
    HUD_Y = HOVERED ? HOVERED.y : Math.floor(camera.position.y)
    HUD_Z = HOVERED ? HOVERED.z : Math.floor(camera.position.z)

    // Facing direction from yaw
    const yawDeg = ((yaw.current * 180 / Math.PI) % 360 + 360) % 360
    if (yawDeg >= 315 || yawDeg < 45) HUD_FACING = 'South'
    else if (yawDeg >= 45 && yawDeg < 135) HUD_FACING = 'West'
    else if (yawDeg >= 135 && yawDeg < 225) HUD_FACING = 'North'
    else HUD_FACING = 'East'
  })

  return (
    <>
      <color attach="background" args={['#87CEEB']} />
      <fog attach="fog" args={['#87CEEB', 60, 200]} />
      <ambientLight intensity={0.8} />
      <directionalLight position={[50, 100, 50]} intensity={1.2} />
      <GroundGrid />
      <Outline />
      <Ghost />
      <BlockMesh />
    </>
  )
}