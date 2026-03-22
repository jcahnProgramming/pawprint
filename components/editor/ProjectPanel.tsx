'use client'

import { useEffect, useRef, useState } from 'react'
import { useEditorStore } from '@/store/editorStore'
import { deleteProject } from '@/lib/projectDB'
import { importFromFile, exportToFile, downloadBlob } from '@/lib/fileFormats'

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

  useEffect(() => {
    if (isOpen) refreshProjects()
  }, [isOpen, refreshProjects])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Escape' && isOpen) {
        if (exportMenuId) {
          setExportMenuId(null)
        } else {
          setOpen(false)
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, setOpen, exportMenuId])

  // Close export menu when clicking outside
  useEffect(() => {
    if (!exportMenuId) return
    const onClick = () => setExportMenuId(null)
    setTimeout(() => window.addEventListener('click', onClick), 0)
    return () => window.removeEventListener('click', onClick)
  }, [exportMenuId])

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
    const store = useEditorStore.getState()
    if (!store.currentProjectId) {
      const name = prompt('Project name:', store.currentProjectName)
      if (!name) return
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
    const confirmed = window.confirm(
      `Delete "${project.name}"? This cannot be undone.`
    )
    if (!confirmed) return
    await deleteProject(project.id)
    if (project.id === currentProjectId) {
      useEditorStore.setState({
        currentProjectId: null,
        currentProjectName: 'Untitled Build',
      })
    }
    await refreshProjects()
    showStatus(`Deleted "${project.name}"`)
  }

  const handleRenameSubmit = async (project: typeof projects[0]) => {
    if (!renameName.trim()) return
    const updated = {
      ...project,
      name: renameName.trim(),
      updatedAt: Date.now(),
    }
    const { saveProject } = await import('@/lib/projectDB')
    await saveProject(updated)
    if (project.id === currentProjectId) {
      setCurrentProject(project.id, renameName.trim())
    }
    setRenameId(null)
    await refreshProjects()
  }

  const handleExport = (project: typeof projects[0], format: 'pawprint') => {
    const blockMap = new Map<string, { id: string; color: string }>()
    Object.entries(project.blocks).forEach(([k, v]) => blockMap.set(k, v))
    const result = exportToFile(blockMap, project.name, format)
    if (result.error) {
      showStatus(`⚠ ${result.error}`)
    } else if (result.data && result.filename) {
      downloadBlob(result.data as Blob, result.filename)
      showStatus(`Exported ${result.filename}`)
    }
    setExportMenuId(null)
  }

  const handleExportLitematic = (
    project: typeof projects[0],
    mcVersion: '1.21.4' | '1.20.4'
  ) => {
    const blockMap = new Map<string, { id: string; color: string }>()
    Object.entries(project.blocks).forEach(([k, v]) => blockMap.set(k, v))
    const result = exportToFile(blockMap, project.name, 'litematic', mcVersion)
    if (result.error) {
      showStatus(`⚠ ${result.error}`)
    } else if (result.data && result.filename) {
      downloadBlob(result.data as Blob, result.filename)
      showStatus(`Exported ${result.filename}`)
    }
    setExportMenuId(null)
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const name = prompt(
      'Project name for import:',
      file.name.replace(/\.[^.]+$/, '')
    )
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
    return (
      d.toLocaleDateString() +
      ' ' +
      d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    )
  }

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          onClick={() => {
            setExportMenuId(null)
            setOpen(false)
          }}
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0,0,0,0.4)',
            zIndex: 60,
          }}
        />
      )}

      {/* Panel */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          bottom: 0,
          width: '380px',
          background: '#12121f',
          borderRight: '1px solid #2a2a3e',
          zIndex: 70,
          display: 'flex',
          flexDirection: 'column',
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.25s ease',
          boxShadow: isOpen ? '4px 0 32px rgba(0,0,0,0.6)' : 'none',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid #2a2a3e',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}
        >
          <div>
            <div
              style={{
                color: '#4CAF50',
                fontFamily: 'monospace',
                fontSize: '16px',
                fontWeight: 'bold',
              }}
            >
              🐾 Projects
            </div>
            <div
              style={{
                color: '#555',
                fontFamily: 'monospace',
                fontSize: '11px',
                marginTop: '2px',
              }}
            >
              {currentProjectName}
              {currentProjectId ? '' : ' (unsaved)'}
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            style={{
              background: 'none',
              border: 'none',
              color: '#666',
              cursor: 'pointer',
              fontSize: '20px',
            }}
          >
            ✕
          </button>
        </div>

        {/* Action buttons */}
        <div
          style={{
            padding: '12px 16px',
            borderBottom: '1px solid #1e1e30',
            display: 'flex',
            gap: '8px',
            flexShrink: 0,
          }}
        >
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
          <div
            style={{
              padding: '8px 16px',
              background: 'rgba(76,175,80,0.15)',
              color: '#4CAF50',
              fontFamily: 'monospace',
              fontSize: '12px',
              borderBottom: '1px solid #1e1e30',
              flexShrink: 0,
            }}
          >
            {statusMsg}
          </div>
        )}

        {/* Project list */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '8px' }}>
          {projects.length === 0 ? (
            <div
              style={{
                color: '#444',
                fontFamily: 'monospace',
                fontSize: '13px',
                textAlign: 'center',
                padding: '48px 16px',
                lineHeight: 1.8,
              }}
            >
              No saved projects yet.
              <br />
              <span style={{ color: '#333' }}>
                Click Save to save your current build.
              </span>
            </div>
          ) : (
            projects.map((project) => (
              <div
                key={project.id}
                style={{
                  background:
                    project.id === currentProjectId
                      ? 'rgba(76,175,80,0.08)'
                      : 'rgba(255,255,255,0.02)',
                  border:
                    project.id === currentProjectId
                      ? '1px solid rgba(76,175,80,0.35)'
                      : '1px solid #1e1e30',
                  borderRadius: '8px',
                  padding: '12px 14px',
                  marginBottom: '6px',
                  position: 'relative',
                }}
              >
                {/* Name / rename */}
                {renameId === project.id ? (
                  <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
                    <input
                      autoFocus
                      value={renameName}
                      onChange={(e) => setRenameName(e.target.value)}
                      onKeyDown={(e) => {
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
                      style={{
                        ...smallBtn,
                        background: '#4CAF50',
                        color: '#fff',
                        borderColor: '#4CAF50',
                      }}
                    >
                      ✓
                    </button>
                    <button onClick={() => setRenameId(null)} style={smallBtn}>
                      ✕
                    </button>
                  </div>
                ) : (
                  <div
                    style={{
                      color: '#fff',
                      fontFamily: 'monospace',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      marginBottom: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    {project.id === currentProjectId && (
                      <span style={{ color: '#4CAF50', fontSize: '9px', letterSpacing: '0.05em' }}>
                        ● ACTIVE
                      </span>
                    )}
                    {project.name}
                  </div>
                )}

                {/* Meta */}
                <div
                  style={{
                    color: '#555',
                    fontFamily: 'monospace',
                    fontSize: '11px',
                    marginBottom: '10px',
                  }}
                >
                  {project.blockCount.toLocaleString()} blocks ·{' '}
                  {formatDate(project.updatedAt)}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <button
                    onClick={() => handleLoad(project)}
                    style={{ ...smallBtn, color: '#4CAF50', borderColor: '#4CAF50' }}
                  >
                    Load
                  </button>
                  <button
                    onClick={() => {
                      setRenameId(project.id)
                      setRenameName(project.name)
                    }}
                    style={smallBtn}
                  >
                    Rename
                  </button>

                  {/* Export dropdown */}
                  <div style={{ position: 'relative' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setExportMenuId(
                          exportMenuId === project.id ? null : project.id
                        )
                      }}
                      style={{
                        ...smallBtn,
                        background: exportMenuId === project.id
                          ? 'rgba(255,255,255,0.1)'
                          : 'none',
                      }}
                    >
                      Export ▾
                    </button>

                    {exportMenuId === project.id && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          position: 'absolute',
                          top: '100%',
                          left: 0,
                          background: '#1a1a2e',
                          border: '1px solid #444',
                          borderRadius: '8px',
                          padding: '6px',
                          zIndex: 200,
                          minWidth: '200px',
                          marginTop: '4px',
                          boxShadow: '0 12px 32px rgba(0,0,0,0.8)',
                        }}
                      >
                        {/* .pawprint */}
                        <button
                          onClick={() => handleExport(project, 'pawprint')}
                          style={exportItemBtn('#4CAF50')}
                          onMouseEnter={(e) =>
                            ((e.currentTarget as HTMLElement).style.background = 'rgba(76,175,80,0.1)')
                          }
                          onMouseLeave={(e) =>
                            ((e.currentTarget as HTMLElement).style.background = 'none')
                          }
                        >
                          .pawprint{' '}
                          <span style={{ color: '#555', fontSize: '10px' }}>native</span>
                        </button>

                        {/* Litematica */}
                        <div
                          style={{
                            borderTop: '1px solid #222',
                            margin: '4px 0 2px',
                            padding: '4px 8px 2px',
                            color: '#555',
                            fontSize: '10px',
                            fontFamily: 'monospace',
                          }}
                        >
                          Litematica
                        </div>
                        <button
                          onClick={() => handleExportLitematic(project, '1.21.4')}
                          style={exportItemBtn('#64B5F6')}
                          onMouseEnter={(e) =>
                            ((e.currentTarget as HTMLElement).style.background = 'rgba(100,181,246,0.1)')
                          }
                          onMouseLeave={(e) =>
                            ((e.currentTarget as HTMLElement).style.background = 'none')
                          }
                        >
                          .litematic{' '}
                          <span style={{ color: '#555', fontSize: '10px' }}>1.21.4</span>
                        </button>
                        <button
                          onClick={() => handleExportLitematic(project, '1.20.4')}
                          style={exportItemBtn('#64B5F6')}
                          onMouseEnter={(e) =>
                            ((e.currentTarget as HTMLElement).style.background = 'rgba(100,181,246,0.1)')
                          }
                          onMouseLeave={(e) =>
                            ((e.currentTarget as HTMLElement).style.background = 'none')
                          }
                        >
                          .litematic{' '}
                          <span style={{ color: '#555', fontSize: '10px' }}>1.20.4</span>
                        </button>

                        {/* Coming soon */}
                        <div style={{ borderTop: '1px solid #222', margin: '4px 0 2px' }} />
                        <button style={{ ...exportItemBtn('#444'), cursor: 'not-allowed' }}>
                          .schem{' '}
                          <span style={{ color: '#333', fontSize: '10px' }}>coming soon</span>
                        </button>
                        <button style={{ ...exportItemBtn('#444'), cursor: 'not-allowed' }}>
                          .schematic{' '}
                          <span style={{ color: '#333', fontSize: '10px' }}>coming soon</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Delete */}
                  <button
                    onClick={() => handleDelete(project)}
                    style={{
                      ...smallBtn,
                      color: '#f44336',
                      borderColor: '#f44336',
                      marginLeft: 'auto',
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '10px 16px',
            borderTop: '1px solid #1e1e30',
            color: '#333',
            fontFamily: 'monospace',
            fontSize: '10px',
            flexShrink: 0,
          }}
        >
          Auto-saves every 60s · Cmd+P to open · Esc to close
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

function exportItemBtn(color: string): React.CSSProperties {
  return {
    display: 'block',
    width: '100%',
    background: 'none',
    border: 'none',
    color,
    fontFamily: 'monospace',
    fontSize: '12px',
    padding: '7px 10px',
    cursor: 'pointer',
    textAlign: 'left',
    borderRadius: '4px',
    transition: 'background 0.1s',
  }
}