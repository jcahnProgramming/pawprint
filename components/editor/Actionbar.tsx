'use client'

import { useEffect } from 'react'
import { useEditorStore } from '@/store/editorStore'

export default function Actionbar() {
  const actionbars = useEditorStore((s) => s.actionbars)
  const activeActionbarIndex = useEditorStore((s) => s.activeActionbarIndex)
  const activeSlotIndex = useEditorStore((s) => s.activeSlotIndex)
  const setActiveSlot = useEditorStore((s) => s.setActiveSlot)
  const scrollActionbar = useEditorStore((s) => s.scrollActionbar)
  const addActionbar = useEditorStore((s) => s.addActionbar)
  const isPickerOpen = useEditorStore((s) => s.isPickerOpen)
  const isLocked = useEditorStore((s) => s.isPointerLocked)

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (isPickerOpen) return
      const num = parseInt(e.key)
      if (num >= 1 && num <= 9) setActiveSlot(num - 1)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isPickerOpen, setActiveSlot])

  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      if (!isLocked) return
      e.preventDefault()
      scrollActionbar(e.deltaY > 0 ? 1 : -1)
    }
    window.addEventListener('wheel', onWheel, { passive: false })
    return () => window.removeEventListener('wheel', onWheel)
  }, [isLocked, scrollActionbar])

  if (!actionbars || actionbars.length === 0) return null
  const activeBar = actionbars[activeActionbarIndex] ?? actionbars[0]
  if (!activeBar) return null

  const handleSlotDrop = (e: React.DragEvent, slotIndex: number) => {
    e.preventDefault()
    e.stopPropagation()
    const data = e.dataTransfer.getData('application/pawprint-block')
    if (!data) return
    try {
      const block = JSON.parse(data)
      useEditorStore.getState().setSlotBlock(activeActionbarIndex, slotIndex, block)
    } catch (err) {
      console.error('Drop parse error', err)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    e.dataTransfer.dropEffect = 'copy'
  }

  return (
    <div style={{
      position: 'absolute',
      bottom: '24px',
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '6px',
      zIndex: 50,
      userSelect: 'none',
      pointerEvents: 'auto',
    }}>
      {/* Bar name + controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {actionbars.length > 1 && (
          <button onClick={() => scrollActionbar(-1)} style={arrowBtn}>‹</button>
        )}
        <div style={{
          color: '#ccc',
          fontFamily: 'monospace',
          fontSize: '12px',
          background: 'rgba(0,0,0,0.5)',
          padding: '2px 10px',
          borderRadius: '4px',
          minWidth: '80px',
          textAlign: 'center',
        }}>
          {activeBar.name}
          {actionbars.length > 1 && (
            <span style={{ color: '#666', marginLeft: '6px' }}>
              {activeActionbarIndex + 1}/{actionbars.length}
            </span>
          )}
        </div>
        {actionbars.length > 1 && (
          <button onClick={() => scrollActionbar(1)} style={arrowBtn}>›</button>
        )}
        <button
          onClick={addActionbar}
          title="Add new actionbar"
          style={{ ...arrowBtn, fontSize: '16px', color: '#4CAF50' }}
        >+</button>
      </div>

      {/* Slots */}
      <div style={{
        display: 'flex',
        gap: '3px',
        background: 'rgba(0,0,0,0.75)',
        border: '2px solid #555',
        borderRadius: '6px',
        padding: '4px',
      }}>
        {(activeBar.slots ?? []).map((slot, i) => (
          <div
            key={i}
            onClick={() => setActiveSlot(i)}
            onContextMenu={(e) => {
              e.preventDefault()
              e.stopPropagation()
              const store = useEditorStore.getState()
              store.setPickerTargetSlot(i)
              store.setPickerOpen(true)
            }}
            onDrop={(e) => handleSlotDrop(e, i)}
            onDragOver={handleDragOver}
            onDragEnter={(e) => {
              e.preventDefault()
              e.stopPropagation()
              ;(e.currentTarget as HTMLDivElement).style.borderColor = '#4CAF50'
            }}
            onDragLeave={(e) => {
              ;(e.currentTarget as HTMLDivElement).style.borderColor =
                i === activeSlotIndex ? '#fff' : '#444'
            }}
            title={slot ? `${slot.name} — right-click to change` : `Slot ${i + 1} — right-click to assign`}
            style={{
              width: '48px',
              height: '48px',
              background: i === activeSlotIndex ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.4)',
              border: i === activeSlotIndex ? '2px solid #fff' : '2px solid #444',
              borderRadius: '4px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              position: 'relative',
              boxSizing: 'border-box',
              transition: 'border-color 0.1s',
            }}
          >
            <span style={{
              position: 'absolute',
              top: '2px',
              left: '4px',
              fontSize: '9px',
              color: i === activeSlotIndex ? '#fff' : '#888',
              fontFamily: 'monospace',
              lineHeight: 1,
            }}>
              {i + 1}
            </span>
            {slot ? (
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '3px',
                background: slot.color,
                border: '1px solid rgba(255,255,255,0.2)',
                marginTop: '4px',
              }} />
            ) : (
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '3px',
                border: '1px dashed #555',
                marginTop: '4px',
              }} />
            )}
          </div>
        ))}
      </div>

      {/* Hint */}
      <div style={{
        color: '#555',
        fontFamily: 'monospace',
        fontSize: '10px',
        textAlign: 'center',
      }}>
        Right-click slot to assign · Left-click to select · 1-9 keys
      </div>
    </div>
  )
}

const arrowBtn: React.CSSProperties = {
  background: 'rgba(0,0,0,0.6)',
  border: '1px solid #444',
  borderRadius: '4px',
  color: '#ccc',
  cursor: 'pointer',
  fontSize: '18px',
  lineHeight: 1,
  padding: '2px 8px',
  fontFamily: 'monospace',
}