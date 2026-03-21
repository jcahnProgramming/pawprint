'use client'

import { useRef, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { KeyboardControls } from '@react-three/drei'
import Scene from './Scene'
import Crosshair from './Crosshair'
import { useEditorStore } from '@/store/editorStore'

const keyMap = [
  { name: 'forward', keys: ['KeyW'] },
  { name: 'backward', keys: ['KeyS'] },
  { name: 'left', keys: ['KeyA'] },
  { name: 'right', keys: ['KeyD'] },
  { name: 'up', keys: ['Space'] },
  { name: 'down', keys: ['ShiftLeft', 'ShiftRight'] },
]

export default function EditorClient() {
  const isLocked = useEditorStore((s) => s.isPointerLocked)

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', cursor: isLocked ? 'none' : 'default' }}>
      <KeyboardControls map={keyMap}>
        <Canvas
          style={{ width: '100%', height: '100%' }}
          gl={{ antialias: true }}
          camera={{ fov: 75, near: 0.1, far: 1000, position: [0, 5, 10] }}
        >
          <Scene />
        </Canvas>
      </KeyboardControls>

      {/* HUD Layer */}
      <Crosshair />

      {/* Click to start overlay */}
      {!isLocked && (
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(0,0,0,0.4)',
          color: '#fff',
          fontFamily: 'monospace',
          pointerEvents: 'none',
          gap: '8px'
        }}>
          <div style={{ fontSize: '32px' }}>🐾</div>
          <p style={{ fontSize: '20px', fontWeight: 'bold' }}>Click to start building</p>
          <p style={{ fontSize: '13px', color: '#aaa' }}>WASD to move · Space up · Shift down · Esc to release</p>
        </div>
      )}
    </div>
  )
}