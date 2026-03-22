'use client'

import { useEditorStore } from '@/store/editorStore'

export default function MenuBar() {
  const setProjectPanelOpen = useEditorStore((s) => s.setProjectPanelOpen)
  const setInfoPanelOpen = useEditorStore((s) => s.setInfoPanelOpen)
  const setVariantMenuOpen = useEditorStore((s) => s.setVariantMenuOpen)
  const currentProjectName = useEditorStore((s) => s.currentProjectName)
  const currentProjectId = useEditorStore((s) => s.currentProjectId)
  const saveCurrentProject = useEditorStore((s) => s.saveCurrentProject)
  const setUndoMessage = useEditorStore((s) => s.setUndoMessage)
  const blocks = useEditorStore((s) => s.blocks)
  const selectedVariant = useEditorStore((s) => s.selectedVariant)
  const selectedBlock = useEditorStore((s) => s.selectedBlock)

  const handleSave = async () => {
    const store = useEditorStore.getState()
    if (!store.currentProjectId) {
      const name = prompt('Project name:', store.currentProjectName)
      if (!name) return
      useEditorStore.setState({ currentProjectName: name })
    }
    await saveCurrentProject()
    setUndoMessage('Project saved!')
  }

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '36px',
      background: 'rgba(0,0,0,0.85)',
      borderBottom: '1px solid #222',
      display: 'flex',
      alignItems: 'center',
      padding: '0 12px',
      gap: '4px',
      zIndex: 50,
      fontFamily: 'monospace',
      fontSize: '12px',
      pointerEvents: 'auto',
      userSelect: 'none',
    }}>
      {/* Logo */}
      <span style={{ color: '#4CAF50', fontWeight: 'bold', marginRight: '4px' }}>🐾</span>

      {/* Projects */}
      <button
        onClick={() => setProjectPanelOpen(true)}
        style={menuBtn}
        title="Open project library (Cmd+P)"
      >
        📁 Projects
      </button>

      {/* Save */}
      <button
        onClick={handleSave}
        style={menuBtn}
        title="Save current project (Cmd+S)"
      >
        💾 Save
      </button>

      {/* Variants */}
      <button
        onClick={() => {
          document.exitPointerLock()
          setVariantMenuOpen(true)
        }}
        style={{
          ...menuBtn,
          color: selectedVariant !== 'full' ? '#4CAF50' : '#ccc',
          borderColor: selectedVariant !== 'full' ? '#4CAF50' : '#333',
        }}
        title="Block variants — stairs, slabs, fences... (Q)"
      >
        🧱 Variants
        {selectedVariant !== 'full' && (
          <span style={{ marginLeft: '4px', color: '#4CAF50', fontSize: '10px' }}>
            [{selectedVariant.replace(/_/g, ' ')}]
          </span>
        )}
      </button>

      {/* Info */}
      <button
        onClick={() => setInfoPanelOpen(true)}
        style={menuBtn}
        title="Schematic info, materials & checklist (Cmd+I)"
      >
        📊 Info
      </button>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Selected block color + name */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        color: '#666',
        fontSize: '11px',
      }}>
        <div style={{
          width: '12px',
          height: '12px',
          borderRadius: '2px',
          background: selectedBlock.color,
          border: '1px solid rgba(255,255,255,0.15)',
          flexShrink: 0,
        }} />
        <span style={{ color: '#888' }}>{selectedBlock.name}</span>
      </div>

      {/* Divider */}
      <div style={{ width: '1px', height: '16px', background: '#333', margin: '0 8px' }} />

      {/* Project name */}
      <div style={{
        color: currentProjectId ? '#aaa' : '#555',
        fontSize: '12px',
        fontStyle: currentProjectId ? 'normal' : 'italic',
        maxWidth: '180px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}>
        {currentProjectName}
        {!currentProjectId && ' (unsaved)'}
      </div>

      {/* Block count */}
      <div style={{
        color: '#444',
        marginLeft: '12px',
        fontSize: '11px',
      }}>
        {blocks.size.toLocaleString()} blocks
      </div>
    </div>
  )
}

const menuBtn: React.CSSProperties = {
  background: 'none',
  border: '1px solid #333',
  borderRadius: '4px',
  color: '#ccc',
  cursor: 'pointer',
  fontFamily: 'monospace',
  fontSize: '12px',
  padding: '3px 10px',
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  whiteSpace: 'nowrap',
}