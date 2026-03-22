'use client'

import { useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { KeyboardControls } from '@react-three/drei'
import Scene from './Scene'
import Crosshair from './Crosshair'
import BlockPicker from './BlockPicker'
import Actionbar from './Actionbar'
import UndoMessage from './UndoMessage'
import F3Hud from './F3Hud'
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
  const isErasing = useEditorStore((s) => s.isErasing)
  const setUndoMessage = useEditorStore((s) => s.setUndoMessage)

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (isPickerOpen) return
      const isMac = navigator.platform.toUpperCase().includes('MAC')
      const ctrl = isMac ? e.metaKey : e.ctrlKey

      if (ctrl && e.code === 'KeyZ' && !e.shiftKey) {
        e.preventDefault()
        const msg = useEditorStore.getState().undo()
        if (msg) setUndoMessage(msg)
        else setUndoMessage('Nothing to undo')
      }

      if (ctrl && (e.code === 'KeyY' || (e.code === 'KeyZ' && e.shiftKey))) {
        e.preventDefault()
        const msg = useEditorStore.getState().redo()
        if (msg) setUndoMessage(msg)
        else setUndoMessage('Nothing to redo')
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isPickerOpen, setUndoMessage])

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      position: 'relative',
      cursor: isLocked ? 'none' : 'default',
    }}>
      <KeyboardControls map={keyMap}>
        <Canvas
          style={{ width: '100%', height: '100%' }}
          gl={{ antialias: true }}
          camera={{ fov: 75, near: 0.1, far: 1000, position: [0, 5, 10] }}
        >
          <Scene />
        </Canvas>
      </KeyboardControls>

      <Crosshair />
      <Actionbar />
      <BlockPicker />
      <UndoMessage />
      <F3Hud />

      {/* Erase mode indicator */}
      {isErasing && (
        <div style={{
          position: 'absolute',
          top: '16px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(244,67,54,0.85)',
          color: '#fff',
          fontFamily: 'monospace',
          fontSize: '13px',
          padding: '4px 16px',
          borderRadius: '4px',
          pointerEvents: 'none',
          zIndex: 30,
        }}>
          🗑 Erase Mode — Hold R
        </div>
      )}

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
          zIndex: 10,
        }}>
          <div style={{ fontSize: '32px' }}>🐾</div>
          <p style={{ fontSize: '20px', fontWeight: 'bold' }}>Click to start building</p>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            marginTop: '8px',
          }}>
            <p style={{ fontSize: '13px', color: '#aaa' }}>
              <span style={{ color: '#fff' }}>WASD</span> move ·{' '}
              <span style={{ color: '#fff' }}>Space/Shift</span> up/down ·{' '}
              <span style={{ color: '#fff' }}>Mouse</span> look
            </p>
            <p style={{ fontSize: '13px', color: '#aaa' }}>
              <span style={{ color: '#fff' }}>Right-click</span> open block picker ·{' '}
              <span style={{ color: '#fff' }}>Hold R</span> erase mode
            </p>
            <p style={{ fontSize: '13px', color: '#aaa' }}>
              <span style={{ color: '#fff' }}>1-9</span> select hotbar slot ·{' '}
              <span style={{ color: '#fff' }}>Scroll</span> switch hotbars ·{' '}
              <span style={{ color: '#fff' }}>Right-click slot</span> assign block
            </p>
            <p style={{ fontSize: '13px', color: '#aaa' }}>
              <span style={{ color: '#fff' }}>Cmd+Z</span> undo ·{' '}
              <span style={{ color: '#fff' }}>Cmd+Shift+Z</span> redo ·{' '}
              <span style={{ color: '#fff' }}>F3</span> debug HUD
            </p>
          </div>
        </div>
      )}
    </div>
  )
}