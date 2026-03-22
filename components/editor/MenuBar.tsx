'use client'

import { useEditorStore } from '@/store/editorStore'

export default function MenuBar() {
  const setProjectPanelOpen = useEditorStore((s) => s.setProjectPanelOpen)
  const currentProjectName = useEditorStore((s) => s.currentProjectName)
  const currentProjectId = useEditorStore((s) => s.currentProjectId)
  const saveCurrentProject = useEditorStore((s) => s.saveCurrentProject)
  const setUndoMessage = useEditorStore((s) => s.setUndoMessage)
  const blocks = useEditorStore((s) => s.blocks)

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
      background: 'rgba(0,0,0,0.8)',
      borderBottom: '1px solid #222',
      display: 'flex',
      alignItems: 'center',
      padding: '0 12px',
      gap: '4px',
      zIndex: 50,
      fontFamily: 'monospace',
      fontSize: '12px',
      pointerEvents: 'auto',
    }}>
      {/* Logo */}
      <span style={{ color: '#4CAF50', fontWeight: 'bold', marginRight: '8px' }}>🐾</span>

      {/* Projects button */}
      <button
        onClick={() => setProjectPanelOpen(true)}
        style={menuBtn}
      >
        📁 Projects
      </button>

      {/* Save */}
      <button onClick={handleSave} style={menuBtn}>
        💾 Save
      </button>

      {/* Divider */}
      <div style={{ flex: 1 }} />

      {/* Current project name */}
      <div style={{
        color: currentProjectId ? '#aaa' : '#555',
        fontSize: '12px',
        fontStyle: currentProjectId ? 'normal' : 'italic',
      }}>
        {currentProjectName}
        {!currentProjectId && ' (unsaved)'}
      </div>

      {/* Block count */}
      <div style={{ color: '#444', marginLeft: '12px' }}>
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
}