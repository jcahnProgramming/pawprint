'use client'

import { useEffect, useRef, useState } from 'react'
import { useEditorStore } from '@/store/editorStore'
import { deleteProject } from '@/lib/projectDB'
import { importFromFile, exportToFile, downloadBlob, ExportFormat } from '@/lib/fileFormats'

const FORMAT_LABELS: Record<ExportFormat, string> = {
  pawprint: '.pawprint',
  litematic: '.litematic',
  schem: '.schem',
  schematic: '.schematic',
}

export default function ProjectPanel() {
  const isOpen = useEditorStore((s) => s.isProjectPanelOpen)
  const setOpen = useEditorStore((s) => s.setProjectPanelOpen)
  const projects = useEditorStore((s) => s.projects)
  const currentProjectId = useEditorStore((s) => s.currentProjectId)
  const currentProjectName = useEditorStore((s) => s.currentProjectName)
  const setCurrentProject = useEditorStore((s) => s.setCurrentProject)
  const saveCurrentProject = useEditorStore((s) => s.saveCurrentProject)
  const loadProject = useEditorStore((s) => s.loadProject)
  const refreshProjects = useEditorStore((s) => s.refreshProjects)
  const blocks = useEditorStore((s) => s.blocks)

  const [exportMenuId, setExportMenuId] = useState<string | null>(null)
  const [renameId, setRenameId] = useState<string | null>(null)
  const [renameName, setRenameName] = useState('')
  const [statusMsg, setStatusMsg] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load projects on open
  useEffect(() => {
    if (isOpen) refreshProjects()
  }, [isOpen, refreshProjects])

  // Escape to close
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Escape' && isOpen) setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, setOpen])

  // Auto-save every 60 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      const store = useEditorStore.getState()
      if (store.currentProjectId) {
        await store.saveCurrentProject()
      }
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  const showStatus = (msg: string) => {
    setStatusMsg(msg)
    setTimeout(() => setStatusMsg(null), 2500)
  }

  const handleNewProject = async () => {
    const name = prompt('Project name:', 'New Build')
    if (!name) return
    setCurrentProject(null, name)
    useEditorStore.setState({
      blocks: new Map(),
      undoStack: [],
      redoStack: [],
      currentProjectId: null,
      currentProjectName: name,
    })
    await useEditorStore.getState().saveCurrentProject()
    showStatus(`Created "${name}"`)
  }

  const handleSaveCurrent = async () => {
    if (!currentProjectId) {
      const name = prompt('Project name:', currentProjectName)
      if (!name) return
      setCurrentProject(null, name)
      useEditorStore.setState({ currentProjectName: name })
    }
    await saveCurrentProject()
    showStatus('Project saved!')
  }

  const handleLoad = (project: typeof projects[0]) => {
    if (project.id === currentProjectId) {
      showStatus('Already loaded')
      return
    }
    const confirmed = blocks.size > 0
      ? window.confirm(`Load "${project.name}"? Unsaved changes will be lost.`)
      : true
    if (!confirmed) return
    loadProject(project)
    setOpen(false)
    showStatus(`Loaded "${project.name}"`)
  }

  const handleDelete = async (project: typeof projects[0]) => {
    const confirmed = window.confirm(`Delete "${project.name}"? This cannot be undone.`)
    if (!confirmed) return
    await deleteProject(project.id)
    if (project.id === currentProjectId) {
      useEditorStore.setState({ currentProjectId: null, currentProjectName: 'Untitled Build' })
    }
    await refreshProjects()
    showStatus(`Deleted "${project.name}"`)
  }

  const handleRenameSubmit = async (project: typeof projects[0]) => {
    if (!renameName.trim()) return
    const updated = { ...project, name: renameName.trim(), updatedAt: Date.now() }
    const { saveProject } = await import('@/lib/projectDB')
    await saveProject(updated)
    if (project.id === currentProjectId) {
      setCurrentProject(project.id, renameName.trim())
    }
    setRenameId(null)
    await refreshProjects()
  }

  const handleExport = (project: typeof projects[0], format: ExportFormat) => {
    const blocks = new Map<string, { id: string; color: string }>()
    Object.entries(project.blocks).forEach(([k, v]) => blocks.set(k, v))
    const result = exportToFile(blocks, project.name, format)
    if (result.error) {
      showStatus(`⚠ ${result.error}`)
    } else if (result.data && result.filename) {
      downloadBlob(result.data as Blob, result.filename)
      showStatus(`Exported as ${result.filename}`)
    }
    setExportMenuId(null)
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const name = prompt('Project name for import:', file.name.replace(/\.[^.]+$/, ''))
    if (!name) return
    const result = await importFromFile(file)
    if (result.error) {
      showStatus(`⚠ ${result.error}`)
      return
    }
    useEditorStore.setState({
      blocks: result.blocks,
      currentProjectId: null,
      currentProjectName: name,
      undoStack: [],
      redoStack: [],
    })
    useEditorStore.getState().setCurrentProject(null, name)
    await useEditorStore.getState().saveCurrentProject()
    setOpen(false)
    showStatus(`Imported "${name}" — ${result.blocks.size} blocks`)
    e.target.value = ''
  }

  const formatDate = (ts: number) => {
    const d = new Date(ts)
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0,0,0,0.4)',
            zIndex: 60,
          }}
        />
      )}

      {/* Panel */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        width: '360px',
        background: '#12121f',
        borderRight: '1px solid #2a2a3e',
        zIndex: 70,
        display: 'flex',
        flexDirection: 'column',
        transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.25s ease',
        boxShadow: isOpen ? '4px 0 32px rgba(0,0,0,0.6)' : 'none',
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid #2a2a3e',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <div>
            <div style={{ color: '#4CAF50', fontFamily: 'monospace', fontSize: '16px', fontWeight: 'bold' }}>
              🐾 Projects
            </div>
            <div style={{ color: '#555', fontFamily: 'monospace', fontSize: '11px', marginTop: '2px' }}>
              {currentProjectName}
              {currentProjectId ? '' : ' (unsaved)'}
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: '20px' }}
          >✕</button>
        </div>

        {/* Action buttons */}
        <div style={{
          padding: '12px 16px',
          borderBottom: '1px solid #1e1e30',
          display: 'flex',
          gap: '8px',
          flexShrink: 0,
        }}>
          <button onClick={handleSaveCurrent} style={actionBtn('#4CAF50')}>
            💾 Save
          </button>
          <button onClick={handleNewProject} style={actionBtn('#2196F3')}>
            + New
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            style={actionBtn('#FF9800')}
          >
            📂 Import
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pawprint,.litematic,.schem,.schematic"
            onChange={handleImport}
            style={{ display: 'none' }}
          />
        </div>

        {/* Status message */}
        {statusMsg && (
          <div style={{
            padding: '8px 16px',
            background: 'rgba(76,175,80,0.15)',
            color: '#4CAF50',
            fontFamily: 'monospace',
            fontSize: '12px',
            borderBottom: '1px solid #1e1e30',
            flexShrink: 0,
          }}>
            {statusMsg}
          </div>
        )}

        {/* Project list */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '8px' }}>
          {projects.length === 0 ? (
            <div style={{
              color: '#444',
              fontFamily: 'monospace',
              fontSize: '13px',
              textAlign: 'center',
              padding: '48px 16px',
            }}>
              No saved projects yet.
              <br />
              <span style={{ color: '#333' }}>Click Save to save your current build.</span>
            </div>
          ) : (
            projects.map(project => (
              <div
                key={project.id}
                style={{
                  background: project.id === currentProjectId ? 'rgba(76,175,80,0.1)' : 'rgba(255,255,255,0.03)',
                  border: project.id === currentProjectId ? '1px solid rgba(76,175,80,0.4)' : '1px solid #1e1e30',
                  borderRadius: '8px',
                  padding: '12px 14px',
                  marginBottom: '6px',
                  cursor: 'pointer',
                }}
              >
                {/* Project name / rename */}
                {renameId === project.id ? (
                  <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
                    <input
                      autoFocus
                      value={renameName}
                      onChange={e => setRenameName(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') handleRenameSubmit(project)
                        if (e.key === 'Escape') setRenameId(null)
                      }}
                      style={{
                        flex: 1,
                        background: '#0f0f1e',
                        border: '1px solid #4CAF50',
                        borderRadius: '4px',
                        color: '#fff',
                        fontFamily: 'monospace',
                        fontSize: '13px',
                        padding: '4px 8px',
                        outline: 'none',
                      }}
                    />
                    <button
                      onClick={() => handleRenameSubmit(project)}
                      style={{ ...smallBtn, background: '#4CAF50', color: '#fff' }}
                    >✓</button>
                    <button
                      onClick={() => setRenameId(null)}
                      style={smallBtn}
                    >✕</button>
                  </div>
                ) : (
                  <div style={{
                    color: '#fff',
                    fontFamily: 'monospace',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    marginBottom: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}>
                    {project.id === currentProjectId && (
                      <span style={{ color: '#4CAF50', fontSize: '10px' }}>● ACTIVE</span>
                    )}
                    {project.name}
                  </div>
                )}

                {/* Meta */}
                <div style={{
                  color: '#555',
                  fontFamily: 'monospace',
                  fontSize: '11px',
                  marginBottom: '10px',
                }}>
                  {project.blockCount.toLocaleString()} blocks · {formatDate(project.updatedAt)}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => handleLoad(project)}
                    style={{ ...smallBtn, color: '#4CAF50', borderColor: '#4CAF50' }}
                  >Load</button>
                  <button
                    onClick={() => {
                      setRenameId(project.id)
                      setRenameName(project.name)
                    }}
                    style={smallBtn}
                  >Rename</button>

                  {/* Export dropdown */}
                  <div style={{ position: 'relative' }}>
                    <button
                      onClick={() => setExportMenuId(
                        exportMenuId === project.id ? null : project.id
                      )}
                      style={smallBtn}
                    >Export ▾</button>
                    {exportMenuId === project.id && (
                      <div style={{
                        position: 'absolute',
                        bottom: '100%',
                        left: 0,
                        background: '#1a1a2e',
                        border: '1px solid #333',
                        borderRadius: '6px',
                        padding: '4px',
                        zIndex: 10,
                        minWidth: '140px',
                        marginBottom: '4px',
                      }}>
                        {(Object.keys(FORMAT_LABELS) as ExportFormat[]).map(fmt => (
                          <button
                            key={fmt}
                            onClick={() => handleExport(project, fmt)}
                            style={{
                              display: 'block',
                              width: '100%',
                              background: 'none',
                              border: 'none',
                              color: fmt === 'pawprint' ? '#4CAF50' : '#888',
                              fontFamily: 'monospace',
                              fontSize: '12px',
                              padding: '6px 10px',
                              cursor: 'pointer',
                              textAlign: 'left',
                              borderRadius: '4px',
                            }}
                            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                          >
                            {FORMAT_LABELS[fmt]}
                            {fmt !== 'pawprint' && <span style={{ color: '#444', fontSize: '10px' }}> (soon)</span>}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleDelete(project)}
                    style={{ ...smallBtn, color: '#f44336', borderColor: '#f44336', marginLeft: 'auto' }}
                  >Delete</button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '10px 16px',
          borderTop: '1px solid #1e1e30',
          color: '#333',
          fontFamily: 'monospace',
          fontSize: '10px',
          flexShrink: 0,
        }}>
          Auto-saves every 60s · Esc to close
        </div>
      </div>
    </>
  )
}

function actionBtn(color: string): React.CSSProperties {
  return {
    flex: 1,
    padding: '8px 4px',
    background: `${color}22`,
    border: `1px solid ${color}66`,
    borderRadius: '6px',
    color,
    fontFamily: 'monospace',
    fontSize: '12px',
    cursor: 'pointer',
    fontWeight: 'bold',
  }
}

const smallBtn: React.CSSProperties = {
  padding: '3px 8px',
  background: 'none',
  border: '1px solid #333',
  borderRadius: '4px',
  color: '#aaa',
  fontFamily: 'monospace',
  fontSize: '11px',
  cursor: 'pointer',
}