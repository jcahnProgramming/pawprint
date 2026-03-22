'use client'

import { useEffect, useRef, useState } from 'react'
import { useEditorStore } from '@/store/editorStore'
import { HUD_X, HUD_Y, HUD_Z, HUD_FACING, HUD_FPS } from './Scene'

export default function F3Hud() {
  const [visible, setVisible] = useState(false)
  const [, forceUpdate] = useState(0)
  const blocks = useEditorStore((s) => s.blocks)
  const rafRef = useRef<number>()

  // Toggle on F3
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'F3') {
        e.preventDefault()
        setVisible(v => !v)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Poll HUD values at 10fps when visible
  useEffect(() => {
    if (!visible) return
    const tick = () => {
      forceUpdate(n => n + 1)
      rafRef.current = window.setTimeout(tick, 100)
    }
    rafRef.current = window.setTimeout(tick, 100)
    return () => {
      if (rafRef.current) clearTimeout(rafRef.current)
    }
  }, [visible])

  if (!visible) return null

  // Compute build dimensions
  let minX = Infinity, minY = Infinity, minZ = Infinity
  let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity
  blocks.forEach((_, key) => {
    const [x, y, z] = key.split(',').map(Number)
    minX = Math.min(minX, x); maxX = Math.max(maxX, x)
    minY = Math.min(minY, y); maxY = Math.max(maxY, y)
    minZ = Math.min(minZ, z); maxZ = Math.max(maxZ, z)
  })
  const hasBlocks = blocks.size > 0
  const W = hasBlocks ? maxX - minX + 1 : 0
  const H = hasBlocks ? maxY - minY + 1 : 0
  const D = hasBlocks ? maxZ - minZ + 1 : 0

  const facingEmoji: Record<string, string> = {
    North: '⬆', South: '⬇', East: '➡', West: '⬅'
  }

  return (
    <div style={{
      position: 'absolute',
      top: '12px',
      left: '12px',
      background: 'rgba(0,0,0,0.65)',
      color: '#fff',
      fontFamily: 'monospace',
      fontSize: '13px',
      padding: '10px 14px',
      borderRadius: '6px',
      pointerEvents: 'none',
      zIndex: 40,
      display: 'flex',
      flexDirection: 'column',
      gap: '3px',
      border: '1px solid rgba(255,255,255,0.08)',
      minWidth: '200px',
    }}>
      {/* Title */}
      <div style={{ color: '#4CAF50', fontWeight: 'bold', marginBottom: '4px', fontSize: '11px' }}>
        🐾 PawPrint Debug
      </div>

      {/* FPS */}
      <div style={{ color: HUD_FPS < 30 ? '#f44336' : HUD_FPS < 55 ? '#FF9800' : '#4CAF50' }}>
        {HUD_FPS} fps
      </div>

      {/* Divider */}
      <div style={{ borderTop: '1px solid #333', margin: '3px 0' }} />

      {/* Position */}
      <div style={{ color: '#aaa', fontSize: '11px' }}>XYZ</div>
      <div>
        <span style={{ color: '#f44336' }}>X </span>
        <span>{HUD_X}</span>
        {'  '}
        <span style={{ color: '#4CAF50' }}>Y </span>
        <span>{HUD_Y}</span>
        {'  '}
        <span style={{ color: '#64B5F6' }}>Z </span>
        <span>{HUD_Z}</span>
      </div>

      {/* Facing */}
      <div style={{ marginTop: '2px' }}>
        <span style={{ color: '#aaa' }}>Facing  </span>
        <span>{facingEmoji[HUD_FACING]} {HUD_FACING}</span>
      </div>

      {/* Divider */}
      <div style={{ borderTop: '1px solid #333', margin: '3px 0' }} />

      {/* Build info */}
      <div style={{ color: '#aaa', fontSize: '11px' }}>Build</div>
      <div>
        <span style={{ color: '#aaa' }}>Blocks  </span>
        <span style={{ color: '#fff' }}>{blocks.size}</span>
      </div>
      {hasBlocks ? (
        <div>
          <span style={{ color: '#aaa' }}>Size  </span>
          <span style={{ color: '#fff' }}>{W}</span>
          <span style={{ color: '#555' }}> × </span>
          <span style={{ color: '#fff' }}>{H}</span>
          <span style={{ color: '#555' }}> × </span>
          <span style={{ color: '#fff' }}>{D}</span>
          <span style={{ color: '#aaa' }}> (W×H×D)</span>
        </div>
      ) : (
        <div style={{ color: '#555' }}>No blocks placed</div>
      )}

      {/* Hint */}
      <div style={{ borderTop: '1px solid #333', margin: '3px 0' }} />
      <div style={{ color: '#444', fontSize: '10px' }}>F3 to toggle</div>
    </div>
  )
}