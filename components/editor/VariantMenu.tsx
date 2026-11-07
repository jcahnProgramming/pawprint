'use client'

import { useEffect, useState } from 'react'
import { useEditorStore } from '@/store/editorStore'
import { getBlockFamily, BlockVariant, RadialSegment } from '@/lib/blockVariants'
import { VariantType } from '@/lib/blockVariants'
import { isTypingTarget } from '@/lib/keyboard'

export default function VariantMenu() {
  const isOpen = useEditorStore((s) => s.isVariantMenuOpen)
  const setOpen = useEditorStore((s) => s.setVariantMenuOpen)
  const selectedBlock = useEditorStore((s) => s.selectedBlock)
  const selectedVariant = useEditorStore((s) => s.selectedVariant)
  const setSelectedVariant = useEditorStore((s) => s.setSelectedVariant)

  const [activeSegment, setActiveSegment] = useState<RadialSegment | null>(null)

  const family = getBlockFamily(selectedBlock.id)

  // Open on Q key
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const store = useEditorStore.getState()
      if (e.code === 'KeyQ' && !store.isPickerOpen && !store.isVariantMenuOpen && !isTypingTarget(e.target)) {
        e.preventDefault()
        // Release pointer lock to show menu
        document.exitPointerLock()
        store.setVariantMenuOpen(true)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Escape' && isOpen) {
        setOpen(false)
        setActiveSegment(null)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, setOpen])

  if (!isOpen) return null

  if (!family || family.segments.length === 0) {
    return (
      <div
        onClick={() => setOpen(false)}
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          background: 'rgba(0,0,0,0.5)',
        }}
      >
        <div style={{
          background: '#1a1a2e',
          border: '1px solid #333',
          borderRadius: '12px',
          padding: '24px 32px',
          color: '#aaa',
          fontFamily: 'monospace',
          fontSize: '14px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>🧱</div>
          <div style={{ color: '#fff', fontWeight: 'bold', marginBottom: '4px' }}>
            {selectedBlock.name}
          </div>
          No variants available for this block.
          <br />
          <span style={{ color: '#555', fontSize: '12px' }}>Press Esc to close</span>
        </div>
      </div>
    )
  }

  const handleSelectVariant = (variant: BlockVariant) => {
    setSelectedVariant(variant.type as VariantType)
    setOpen(false)
    setActiveSegment(null)
  }

  const handleSelectFull = () => {
    setSelectedVariant('full')
    setOpen(false)
    setActiveSegment(null)
  }

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setOpen(false)
          setActiveSegment(null)
        }
      }}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 100,
        background: 'rgba(0,0,0,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
      }}>
        {/* Title */}
        <div style={{
          color: '#4CAF50',
          fontFamily: 'monospace',
          fontSize: '16px',
          fontWeight: 'bold',
          marginBottom: '4px',
        }}>
          🧱 {family.name} Variants
        </div>

        {/* Segment grid */}
        <div style={{
          display: 'flex',
          gap: '8px',
          flexWrap: 'wrap',
          justifyContent: 'center',
          maxWidth: '600px',
        }}>
          {/* Full block option */}
          <button
            onClick={handleSelectFull}
            style={segmentBtn(selectedVariant === 'full')}
          >
            <span style={{ fontSize: '24px' }}>🧱</span>
            <span style={{ fontSize: '12px', color: '#ccc', fontFamily: 'monospace' }}>Full Block</span>
            {selectedVariant === 'full' && (
              <span style={{ fontSize: '10px', color: '#4CAF50' }}>● active</span>
            )}
          </button>

          {/* Variant segments */}
          {family.segments.map((segment) => (
            <button
              key={segment.group}
              onClick={() => setActiveSegment(
                activeSegment?.group === segment.group ? null : segment
              )}
              style={segmentBtn(
                activeSegment?.group === segment.group ||
                segment.variants.some(v => v.type === selectedVariant)
              )}
            >
              <span style={{ fontSize: '24px' }}>{segment.icon}</span>
              <span style={{ fontSize: '12px', color: '#ccc', fontFamily: 'monospace' }}>{segment.label}</span>
              {segment.variants.some(v => v.type === selectedVariant) && (
                <span style={{ fontSize: '10px', color: '#4CAF50' }}>● active</span>
              )}
            </button>
          ))}
        </div>

        {/* Variant sub-menu */}
        {activeSegment && (
          <div style={{
            background: '#12121f',
            border: '1px solid #333',
            borderRadius: '10px',
            padding: '12px',
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap',
            justifyContent: 'center',
            maxWidth: '500px',
          }}>
            {activeSegment.variants.map((variant) => (
              <button
                key={variant.type}
                onClick={() => handleSelectVariant(variant)}
                style={{
                  ...variantBtn,
                  background: selectedVariant === variant.type
                    ? 'rgba(76,175,80,0.2)'
                    : 'rgba(255,255,255,0.03)',
                  border: selectedVariant === variant.type
                    ? '1px solid #4CAF50'
                    : '1px solid #2a2a3e',
                }}
              >
                <span style={{ fontSize: '16px' }}>{variant.icon}</span>
                <span style={{
                  fontSize: '11px',
                  color: selectedVariant === variant.type ? '#4CAF50' : '#aaa',
                  fontFamily: 'monospace',
                  textAlign: 'center',
                  lineHeight: 1.3,
                }}>
                  {variant.label}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Current selection */}
        <div style={{
          color: '#555',
          fontFamily: 'monospace',
          fontSize: '12px',
          marginTop: '4px',
        }}>
          Current: <span style={{ color: '#aaa' }}>{selectedVariant.replace(/_/g, ' ')}</span>
          {' · '}Q or Esc to close
        </div>
      </div>
    </div>
  )
}

function segmentBtn(active: boolean): React.CSSProperties {
  return {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    padding: '12px 16px',
    background: active ? 'rgba(76,175,80,0.15)' : 'rgba(255,255,255,0.04)',
    border: active ? '2px solid #4CAF50' : '2px solid #2a2a3e',
    borderRadius: '10px',
    cursor: 'pointer',
    minWidth: '80px',
    transition: 'all 0.1s',
  }
}

const variantBtn: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '4px',
  padding: '10px 12px',
  borderRadius: '8px',
  cursor: 'pointer',
  minWidth: '80px',
  transition: 'all 0.1s',
}