'use client'

import { Canvas } from '@react-three/fiber'
import { KeyboardControls } from '@react-three/drei'
import Scene from './Scene'
import Crosshair from './Crosshair'
import BlockPicker from './BlockPicker'
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
  const isPickerOpen = useEditorStore((s) => s.isPickerOpen)
  const selectedBlock = useEditorStore((s) => s.selectedBlock)
  const isErasing = useEditorStore((s) => s.isErasing)

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

      {/* HUD */}
      <Crosshair />

      {/* Selected block indicator */}
      <div style={{
        position: 'absolute',
        bottom: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        background: 'rgba(0,0,0,0.6)',
        border: isErasing ? '2px solid #f44336' : '2px solid rgba(255,255,255,0.2)',
        borderRadius: '8px',
        padding: '8px 16px',
        fontFamily: 'monospace',
        color: '#fff',
        fontSize: '13px',
        pointerEvents: 'none',
      }}>
        <div style={{
          width: '24px',
          height: '24px',
          borderRadius: '4px',
          background: isErasing ? '#f44336' : selectedBlock.color,
          border: '1px solid rgba(255,255,255,0.3)',
        }} />
        <span style={{ color: isErasing ? '#f44336' : '#fff' }}>
          {isErasing ? '🗑 Erasing (hold R)' : selectedBlock.name}
        </span>
        <span style={{ color: '#666', fontSize: '11px' }}>· Right-click to change</span>
      </div>

      {/* Block picker */}
      <BlockPicker />

      {/* Click to start overlay */}
      {!isLocked && !isPickerOpen && (
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
          gap: '8px',
        }}>
          <div style={{ fontSize: '32px' }}>🐾</div>
          <p style={{ fontSize: '20px', fontWeight: 'bold' }}>Click to start building</p>
          <p style={{ fontSize: '13px', color: '#aaa' }}>WASD · Space/Shift · Right-click picker · Hold R to erase</p>
        </div>
      )}
    </div>
  )
}