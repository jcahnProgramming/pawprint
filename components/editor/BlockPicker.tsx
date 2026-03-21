'use client'

import { useState, useEffect, useRef } from 'react'
import { BLOCKS, CATEGORIES, BlockCategory } from '@/lib/blocks'
import { useEditorStore } from '@/store/editorStore'

export default function BlockPicker() {
  const isOpen = useEditorStore((s) => s.isPickerOpen)
  const setPickerOpen = useEditorStore((s) => s.setPickerOpen)
  const selectedBlock = useEditorStore((s) => s.selectedBlock)
  const pickerTargetSlot = useEditorStore((s) => s.pickerTargetSlot)
  const setPickerTargetSlot = useEditorStore((s) => s.setPickerTargetSlot)
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<BlockCategory | 'All'>('All')
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => searchRef.current?.focus(), 50)
      setSearch('')
    }
  }, [isOpen])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Escape' && isOpen) {
        setPickerOpen(false)
        setPickerTargetSlot(null)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [isOpen, setPickerOpen, setPickerTargetSlot])

  if (!isOpen) return null

  const filtered = BLOCKS.filter(b => {
    const matchSearch = b.name.toLowerCase().includes(search.toLowerCase())
    const matchCat = activeCategory === 'All' || b.category === activeCategory
    return matchSearch && matchCat
  })

  const handleSelect = (block: typeof BLOCKS[0]) => {
    const store = useEditorStore.getState()
    if (pickerTargetSlot !== null) {
      store.setSlotBlock(store.activeActionbarIndex, pickerTargetSlot, block)
      store.setPickerTargetSlot(null)
    } else {
      store.setSelectedBlock(block)
    }
    setPickerOpen(false)
  }

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        background: 'rgba(0,0,0,0.5)',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setPickerOpen(false)
          setPickerTargetSlot(null)
        }
      }}
    >
      <div style={{
        width: '680px',
        maxHeight: '80vh',
        background: '#1a1a2e',
        border: '1px solid #333',
        borderRadius: '12px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: '0 24px 64px rgba(0,0,0,0.8)',
      }}>
        {/* Header */}
        <div style={{ padding: '16px 20px 12px', borderBottom: '1px solid #2a2a3e' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '12px',
          }}>
            <span style={{
              color: '#fff',
              fontFamily: 'monospace',
              fontSize: '16px',
              fontWeight: 'bold',
            }}>
              🐾 Block Picker
              {pickerTargetSlot !== null && (
                <span style={{ color: '#4CAF50', fontSize: '13px', marginLeft: '10px' }}>
                  → Slot {pickerTargetSlot + 1}
                </span>
              )}
            </span>
            <button
              onClick={() => {
                setPickerOpen(false)
                setPickerTargetSlot(null)
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#888',
                cursor: 'pointer',
                fontSize: '18px',
              }}
            >✕</button>
          </div>

          {/* Search */}
          <input
            ref={searchRef}
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search blocks..."
            style={{
              width: '100%',
              padding: '8px 12px',
              background: '#0f0f1e',
              border: '1px solid #333',
              borderRadius: '6px',
              color: '#fff',
              fontFamily: 'monospace',
              fontSize: '14px',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Category tabs */}
        <div style={{
          display: 'flex',
          gap: '4px',
          padding: '8px 12px',
          borderBottom: '1px solid #2a2a3e',
          overflowX: 'auto',
          flexShrink: 0,
        }}>
          {(['All', ...CATEGORIES] as const).map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: '4px 10px',
                borderRadius: '4px',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'monospace',
                fontSize: '11px',
                whiteSpace: 'nowrap',
                background: activeCategory === cat ? '#4CAF50' : '#2a2a3e',
                color: activeCategory === cat ? '#fff' : '#aaa',
                fontWeight: activeCategory === cat ? 'bold' : 'normal',
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Block grid */}
        <div style={{
          overflowY: 'auto',
          padding: '12px',
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '6px',
        }}>
          {filtered.map(block => (
            <div
              key={block.id}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData(
                  'application/pawprint-block',
                  JSON.stringify(block)
                )
                e.dataTransfer.effectAllowed = 'copy'
              }}
              onClick={() => handleSelect(block)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 10px',
                background: selectedBlock.id === block.id ? '#2a3a2a' : '#0f0f1e',
                border: selectedBlock.id === block.id
                  ? '1px solid #4CAF50'
                  : '1px solid #222',
                borderRadius: '6px',
                cursor: 'grab',
                textAlign: 'left',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.background = '#1e2e1e'
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.background =
                  selectedBlock.id === block.id ? '#2a3a2a' : '#0f0f1e'
              }}
            >
              <div style={{
                width: '20px',
                height: '20px',
                borderRadius: '3px',
                background: block.color,
                flexShrink: 0,
                border: '1px solid rgba(255,255,255,0.1)',
              }} />
              <span style={{
                color: '#ddd',
                fontFamily: 'monospace',
                fontSize: '11px',
                lineHeight: 1.2,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {block.name}
              </span>
            </div>
          ))}

          {filtered.length === 0 && (
            <div style={{
              gridColumn: '1/-1',
              color: '#666',
              fontFamily: 'monospace',
              textAlign: 'center',
              padding: '32px',
            }}>
              No blocks found
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '10px 16px',
          borderTop: '1px solid #2a2a3e',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <div style={{
            width: '16px',
            height: '16px',
            borderRadius: '3px',
            background: selectedBlock.color,
            border: '1px solid rgba(255,255,255,0.2)',
          }} />
          <span style={{
            color: '#aaa',
            fontFamily: 'monospace',
            fontSize: '12px',
          }}>
            Selected: <span style={{ color: '#fff' }}>{selectedBlock.name}</span>
          </span>
          <span style={{
            color: '#555',
            fontFamily: 'monospace',
            fontSize: '11px',
            marginLeft: 'auto',
          }}>
            {filtered.length} blocks · Drag to hotbar · Esc to close
          </span>
        </div>
      </div>
    </div>
  )
}