'use client'

import { useEffect } from 'react'
import { useEditorStore, ToolType } from '@/store/editorStore'

const TOOLS: { id: ToolType; label: string; icon: string; key: string; description: string }[] = [
  { id: 'place', label: 'Place', icon: '🧱', key: 'B', description: 'Place blocks' },
  { id: 'line', label: 'Line', icon: '📏', key: 'L', description: 'Draw a line' },
  { id: 'rectangle', label: 'Rectangle', icon: '⬜', key: 'G', description: 'Fill rectangle' },
  { id: 'fill', label: 'Fill', icon: '🪣', key: 'F', description: 'Flood fill' },
  { id: 'copy', label: 'Copy', icon: '📋', key: 'C', description: 'Copy region' },
  { id: 'paste', label: 'Paste', icon: '📌', key: 'V', description: 'Paste region' },
  { id: 'mirror', label: 'Mirror', icon: '🪞', key: 'M', description: 'Mirror build' },
]

export default function Toolbar() {
  const activeTool = useEditorStore((s) => s.activeTool)
  const setActiveTool = useEditorStore((s) => s.setActiveTool)
  const isPickerOpen = useEditorStore((s) => s.isPickerOpen)
  const toolPointA = useEditorStore((s) => s.toolPointA)
  const clipboard = useEditorStore((s) => s.clipboard)

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (isPickerOpen) return
      if (e.metaKey || e.ctrlKey) return
      switch (e.code) {
        case 'KeyB': setActiveTool('place'); break
        case 'KeyL': setActiveTool('line'); break
        case 'KeyG': setActiveTool('rectangle'); break
        case 'KeyF': setActiveTool('fill'); break
        case 'KeyC': if (!e.metaKey && !e.ctrlKey) setActiveTool('copy'); break
        case 'KeyV': if (!e.metaKey && !e.ctrlKey) setActiveTool('paste'); break
        case 'KeyM': setActiveTool('mirror'); break
        case 'Escape':
          if (activeTool !== 'place') {
            useEditorStore.getState().setToolPointA(null)
            setActiveTool('place')
          }
          break
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isPickerOpen, activeTool, setActiveTool])

  const getToolStatus = () => {
    if (activeTool === 'place') return null
    if (activeTool === 'fill') return 'Click a block face to flood fill'
    if (activeTool === 'mirror') return 'Click X or Z axis button below'
    if (activeTool === 'paste') {
      if (!clipboard) return 'No clipboard — copy a region first'
      return 'Click to paste · Esc to cancel'
    }
    if (activeTool === 'copy') {
      return toolPointA
        ? `Point A set (${toolPointA.x},${toolPointA.y},${toolPointA.z}) — click Point B`
        : 'Click Point A of region'
    }
    if (activeTool === 'line' || activeTool === 'rectangle') {
      return toolPointA
        ? `Point A set (${toolPointA.x},${toolPointA.y},${toolPointA.z}) — click Point B`
        : 'Click Point A'
    }
    return null
  }

  const status = getToolStatus()

  return (
    <>
      {/* Toolbar */}
      <div style={{
        position: 'absolute',
        right: '12px',
        top: '50%',
        transform: 'translateY(-50%)',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        zIndex: 40,
        pointerEvents: 'auto',
      }}>
        {TOOLS.map(tool => (
          <button
            key={tool.id}
            onClick={() => setActiveTool(tool.id)}
            title={`${tool.label} (${tool.key})`}
            style={{
              width: '48px',
              height: '48px',
              background: activeTool === tool.id
                ? 'rgba(76,175,80,0.85)'
                : 'rgba(0,0,0,0.7)',
              border: activeTool === tool.id
                ? '2px solid #4CAF50'
                : '2px solid #444',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '2px',
              transition: 'all 0.1s',
            }}
            onMouseEnter={e => {
              if (activeTool !== tool.id)
                (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.1)'
            }}
            onMouseLeave={e => {
              if (activeTool !== tool.id)
                (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,0,0,0.7)'
            }}
          >
            <span style={{ fontSize: '18px', lineHeight: 1 }}>{tool.icon}</span>
            <span style={{
              fontSize: '8px',
              color: activeTool === tool.id ? '#fff' : '#888',
              fontFamily: 'monospace',
              lineHeight: 1,
            }}>{tool.key}</span>
          </button>
        ))}

        {/* Mirror buttons — only show when mirror tool active */}
        {activeTool === 'mirror' && (
          <>
            <div style={{ borderTop: '1px solid #333', margin: '4px 0' }} />
            <button
              onClick={() => {
                const store = useEditorStore.getState()
                mirrorBlocks(store.blocks, 'x', store.bulkPlace)
                store.setUndoMessage('Mirrored on X axis')
                store.setActiveTool('place')
              }}
              style={mirrorBtnStyle}
            >
              <span style={{ fontSize: '11px', color: '#f44336', fontFamily: 'monospace' }}>X</span>
            </button>
            <button
              onClick={() => {
                const store = useEditorStore.getState()
                mirrorBlocks(store.blocks, 'z', store.bulkPlace)
                store.setUndoMessage('Mirrored on Z axis')
                store.setActiveTool('place')
              }}
              style={mirrorBtnStyle}
            >
              <span style={{ fontSize: '11px', color: '#64B5F6', fontFamily: 'monospace' }}>Z</span>
            </button>
          </>
        )}
      </div>

      {/* Status bar */}
      {status && (
        <div style={{
          position: 'absolute',
          top: '16px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(0,0,0,0.75)',
          color: '#fff',
          fontFamily: 'monospace',
          fontSize: '13px',
          padding: '6px 18px',
          borderRadius: '6px',
          pointerEvents: 'none',
          zIndex: 40,
          border: '1px solid #444',
          whiteSpace: 'nowrap',
        }}>
          {TOOLS.find(t => t.id === activeTool)?.icon} {status}
        </div>
      )}
    </>
  )
}

function mirrorBlocks(
  blocks: Map<string, { id: string; color: string }>,
  axis: 'x' | 'z',
  bulkPlace: (positions: { x: number; y: number; z: number }[]) => void
) {
  if (blocks.size === 0) return

  let minX = Infinity, maxX = -Infinity
  let minZ = Infinity, maxZ = -Infinity

  blocks.forEach((_, key) => {
    const [x, , z] = key.split(',').map(Number)
    minX = Math.min(minX, x); maxX = Math.max(maxX, x)
    minZ = Math.min(minZ, z); maxZ = Math.max(maxZ, z)
  })

  const positions: { x: number; y: number; z: number; id: string; color: string }[] = []

  blocks.forEach((block, key) => {
    const [x, y, z] = key.split(',').map(Number)
    if (axis === 'x') {
      const mx = maxX - (x - minX)
      positions.push({ x: mx, y, z, ...block })
    } else {
      const mz = maxZ - (z - minZ)
      positions.push({ x, y, z: mz, ...block })
    }
  })

  // We need to place blocks with their specific colors, not selected block
  // So we bypass bulkPlace and use the store directly
  const store = useEditorStore.getState()
  const next = new Map(store.blocks)
  const placed = new Map<string, { id: string; color: string }>()
  positions.forEach(({ x, y, z, id, color }) => {
    const key = `${x},${y},${z}`
    next.set(key, { id, color })
    placed.set(key, { id, color })
  })
  useEditorStore.setState({
    blocks: next,
    undoStack: [...store.undoStack, {
      type: 'bulk',
      placed,
      removed: new Map(),
    }].slice(-100),
    redoStack: [],
  })
}

const mirrorBtnStyle: React.CSSProperties = {
  width: '48px',
  height: '32px',
  background: 'rgba(0,0,0,0.7)',
  border: '2px solid #555',
  borderRadius: '6px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}