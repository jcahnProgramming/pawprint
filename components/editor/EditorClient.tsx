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
import Toolbar from './Toolbar'
import MenuBar from './MenuBar'
import ProjectPanel from './ProjectPanel'
import InfoPanel from './InfoPanel'
import VariantMenu from './VariantMenu'
import { useEditorStore } from '@/store/editorStore'
import { isTypingTarget } from '@/lib/keyboard'

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
  const setProjectPanelOpen = useEditorStore((s) => s.setProjectPanelOpen)
  const setInfoPanelOpen = useEditorStore((s) => s.setInfoPanelOpen)

  useEffect(() => {
    const onKeyDown = async (e: KeyboardEvent) => {
      // Leave keys (including Ctrl+Z text undo) to the field being typed in
      if (isTypingTarget(e.target)) return
      const isMac = navigator.platform.toUpperCase().includes('MAC')
      const ctrl = isMac ? e.metaKey : e.ctrlKey

      // Cmd+S — save
      if (ctrl && e.code === 'KeyS') {
        e.preventDefault()
        const store = useEditorStore.getState()
        if (!store.currentProjectId) {
          const name = prompt('Project name:', store.currentProjectName)
          if (!name) return
          useEditorStore.setState({ currentProjectName: name })
        }
        await store.saveCurrentProject()
        store.setUndoMessage('Project saved!')
        return
      }

      // Cmd+P — projects panel
      if (ctrl && e.code === 'KeyP') {
        e.preventDefault()
        setProjectPanelOpen(true)
        return
      }

      // Cmd+I — info panel
      if (ctrl && e.code === 'KeyI') {
        e.preventDefault()
        setInfoPanelOpen(true)
        return
      }

      if (isPickerOpen) return

      // Undo
      if (ctrl && e.code === 'KeyZ' && !e.shiftKey) {
        e.preventDefault()
        const msg = useEditorStore.getState().undo()
        setUndoMessage(msg ?? 'Nothing to undo')
      }

      // Redo
      if (ctrl && (e.code === 'KeyY' || (e.code === 'KeyZ' && e.shiftKey))) {
        e.preventDefault()
        const msg = useEditorStore.getState().redo()
        setUndoMessage(msg ?? 'Nothing to redo')
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isPickerOpen, setUndoMessage, setProjectPanelOpen, setInfoPanelOpen])

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      position: 'relative',
      cursor: isLocked ? 'none' : 'default',
    }}>
      {/* Menu bar */}
      <MenuBar />

      {/* Canvas — offset by menu bar */}
      <div style={{
        position: 'absolute',
        top: '36px',
        left: 0,
        right: 0,
        bottom: 0,
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
      </div>

      {/* HUD Layer */}
      <Crosshair />
      <Actionbar />
      <BlockPicker />
      <UndoMessage />
      <F3Hud />
      <Toolbar />
      <ProjectPanel />
      <InfoPanel />
      <VariantMenu />

      {/* Erase mode indicator */}
      {isErasing && (
        <div style={{
          position: 'absolute',
          top: '52px',
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
          top: '36px',
          left: 0,
          right: 0,
          bottom: 0,
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
              <span style={{ color: '#fff' }}>Right-click</span> block picker ·{' '}
              <span style={{ color: '#fff' }}>Hold R</span> erase ·{' '}
              <span style={{ color: '#fff' }}>F3</span> debug HUD
            </p>
            <p style={{ fontSize: '13px', color: '#aaa' }}>
              <span style={{ color: '#fff' }}>1-9</span> hotbar ·{' '}
              <span style={{ color: '#fff' }}>Scroll</span> switch bars ·{' '}
              <span style={{ color: '#fff' }}>Right-click slot</span> assign
            </p>
            <p style={{ fontSize: '13px', color: '#aaa' }}>
              <span style={{ color: '#fff' }}>Cmd+S</span> save ·{' '}
              <span style={{ color: '#fff' }}>Cmd+Z</span> undo ·{' '}
              <span style={{ color: '#fff' }}>Cmd+Shift+Z</span> redo
            </p>
            <p style={{ fontSize: '13px', color: '#aaa' }}>
              <span style={{ color: '#fff' }}>Cmd+P</span> projects ·{' '}
              <span style={{ color: '#fff' }}>Cmd+I</span> info panel
            </p>
            <p style={{ fontSize: '13px', color: '#aaa' }}>
              <span style={{ color: '#fff' }}>B</span> place ·{' '}
              <span style={{ color: '#fff' }}>L</span> line ·{' '}
              <span style={{ color: '#fff' }}>G</span> rect ·{' '}
              <span style={{ color: '#fff' }}>F</span> fill ·{' '}
              <span style={{ color: '#fff' }}>C</span> copy ·{' '}
              <span style={{ color: '#fff' }}>V</span> paste ·{' '}
              <span style={{ color: '#fff' }}>M</span> mirror
            </p>
            <p style={{ fontSize: '13px', color: '#aaa' }}>
              <span style={{ color: '#fff' }}>Q</span> block variants (stairs, slabs, fences...)
            </p>
          </div>
        </div>
      )}
    </div>
  )
}