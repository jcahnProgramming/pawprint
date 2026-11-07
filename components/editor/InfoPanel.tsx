'use client'

import { useEffect, useMemo, useState } from 'react'
import { useEditorStore } from '@/store/editorStore'
import { computeSchematicInfo, exportMaterialsCSV } from '@/lib/schematicInfo'

const CHECKLIST_KEY = 'pawprint_checklist'

function loadChecklist(): Set<string> {
  try {
    const raw = localStorage.getItem(CHECKLIST_KEY)
    if (!raw) return new Set()
    return new Set(JSON.parse(raw))
  } catch { return new Set() }
}

function saveChecklist(checked: Set<string>) {
  localStorage.setItem(CHECKLIST_KEY, JSON.stringify(Array.from(checked)))
}

export default function InfoPanel() {
  const isOpen = useEditorStore((s) => s.isInfoPanelOpen)
  const setOpen = useEditorStore((s) => s.setInfoPanelOpen)
  const blocks = useEditorStore((s) => s.blocks)
  const currentProjectName = useEditorStore((s) => s.currentProjectName)

  const [checked, setChecked] = useState<Set<string>>(new Set())
  const [activeTab, setActiveTab] = useState<'summary' | 'materials' | 'variants'>('summary')

  const info = useMemo(() => computeSchematicInfo(blocks), [blocks])

  // Load checklist from localStorage
  useEffect(() => {
    setChecked(loadChecklist())
  }, [])

  // Escape to close
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Escape' && isOpen) setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, setOpen])

  const toggleCheck = (key: string) => {
    setChecked(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      saveChecklist(next)
      return next
    })
  }

  const resetChecklist = () => {
    setChecked(new Set())
    localStorage.removeItem(CHECKLIST_KEY)
  }

  const handleExportCSV = () => {
    const csv = exportMaterialsCSV(info.materials)
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${currentProjectName.replace(/[^a-z0-9]/gi, '_')}_materials.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleExportPDF = () => {
    // Project and block names can come from imported files, so escape them
    // before writing into the same-origin print window.
    const projectName = escapeHtml(currentProjectName)
    const win = window.open('', '_blank')
    if (!win) return
    win.document.write(`
      <html>
        <head>
          <title>${projectName} — Material List</title>
          <style>
            body { font-family: monospace; padding: 40px; color: #111; }
            h1 { font-size: 20px; margin-bottom: 4px; }
            h2 { font-size: 14px; color: #555; font-weight: normal; margin-bottom: 24px; }
            .meta { font-size: 13px; margin-bottom: 24px; color: #333; }
            table { width: 100%; border-collapse: collapse; font-size: 13px; }
            th { text-align: left; border-bottom: 2px solid #333; padding: 6px 8px; }
            td { padding: 5px 8px; border-bottom: 1px solid #eee; }
            tr:nth-child(even) { background: #f9f9f9; }
            .count { text-align: right; font-weight: bold; }
            .check { width: 24px; text-align: center; }
            @media print { body { padding: 20px; } }
          </style>
        </head>
        <body>
          <h1>🐾 PawPrint — Material List</h1>
          <h2>${projectName}</h2>
          <div class="meta">
            Dimensions: ${info.dimensions.x}W × ${info.dimensions.y}H × ${info.dimensions.z}D &nbsp;|&nbsp;
            Total: ${info.totalBlocks.toLocaleString()} blocks &nbsp;|&nbsp;
            ${info.materials.length} unique materials
          </div>
          <table>
            <thead>
              <tr>
                <th class="check">✓</th>
                <th>#</th>
                <th>Material</th>
                <th class="count">Count</th>
              </tr>
            </thead>
            <tbody>
              ${info.materials.map((m, i) => `
                <tr>
                  <td class="check">☐</td>
                  <td>${i + 1}</td>
                  <td>${escapeHtml(m.displayName)}</td>
                  <td class="count">${m.count.toLocaleString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `)
    win.document.close()
    setTimeout(() => win.print(), 500)
  }

  const gatheredCount = info.materials.filter(m => checked.has(m.key)).length
  const progressPct = info.materials.length > 0
    ? Math.round((gatheredCount / info.materials.length) * 100)
    : 0

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
        right: 0,
        bottom: 0,
        width: '380px',
        background: '#12121f',
        borderLeft: '1px solid #2a2a3e',
        zIndex: 70,
        display: 'flex',
        flexDirection: 'column',
        transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.25s ease',
        boxShadow: isOpen ? '-4px 0 32px rgba(0,0,0,0.6)' : 'none',
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
              📊 Schematic Info
            </div>
            <div style={{ color: '#555', fontFamily: 'monospace', fontSize: '11px', marginTop: '2px' }}>
              {currentProjectName}
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: '20px' }}
          >✕</button>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid #1e1e30',
          flexShrink: 0,
        }}>
          {(['summary', 'materials', 'variants'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1,
                padding: '10px 4px',
                background: 'none',
                border: 'none',
                borderBottom: activeTab === tab ? '2px solid #4CAF50' : '2px solid transparent',
                color: activeTab === tab ? '#4CAF50' : '#555',
                fontFamily: 'monospace',
                fontSize: '12px',
                cursor: 'pointer',
                textTransform: 'capitalize',
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '12px' }}>

          {/* ── Summary Tab ── */}
          {activeTab === 'summary' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>

              {info.totalBlocks === 0 ? (
                <div style={{ color: '#444', fontFamily: 'monospace', fontSize: '13px', textAlign: 'center', padding: '48px 16px' }}>
                  No blocks placed yet.
                </div>
              ) : (
                <>
                  {/* Top block highlight */}
                  {info.topBlock && (
                    <div style={{
                      background: 'rgba(76,175,80,0.08)',
                      border: '1px solid rgba(76,175,80,0.25)',
                      borderRadius: '8px',
                      padding: '12px',
                    }}>
                      <div style={{ color: '#4CAF50', fontFamily: 'monospace', fontSize: '10px', marginBottom: '6px' }}>
                        MOST USED BLOCK
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '4px',
                          background: info.topBlock.color,
                          border: '1px solid rgba(255,255,255,0.15)',
                          flexShrink: 0,
                        }} />
                        <div>
                          <div style={{ color: '#fff', fontFamily: 'monospace', fontSize: '14px', fontWeight: 'bold' }}>
                            {info.topBlock.displayName}
                          </div>
                          <div style={{ color: '#555', fontFamily: 'monospace', fontSize: '11px' }}>
                            {info.topBlock.count.toLocaleString()} blocks ({Math.round(info.topBlock.count / info.totalBlocks * 100)}%)
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Stats grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    {[
                      { label: 'Total Blocks', value: info.totalBlocks.toLocaleString() },
                      { label: 'Unique Materials', value: info.materials.length.toLocaleString() },
                      { label: 'Width (X)', value: `${info.dimensions.x} blocks` },
                      { label: 'Height (Y)', value: `${info.dimensions.y} blocks` },
                      { label: 'Depth (Z)', value: `${info.dimensions.z} blocks` },
                      { label: 'Volume', value: `${(info.dimensions.x * info.dimensions.y * info.dimensions.z).toLocaleString()}` },
                    ].map(({ label, value }) => (
                      <div key={label} style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid #1e1e30',
                        borderRadius: '6px',
                        padding: '10px',
                      }}>
                        <div style={{ color: '#555', fontFamily: 'monospace', fontSize: '10px', marginBottom: '4px' }}>
                          {label.toUpperCase()}
                        </div>
                        <div style={{ color: '#fff', fontFamily: 'monospace', fontSize: '14px', fontWeight: 'bold' }}>
                          {value}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Bounds */}
                  <div style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid #1e1e30',
                    borderRadius: '8px',
                    padding: '12px',
                  }}>
                    <div style={{ color: '#555', fontFamily: 'monospace', fontSize: '10px', marginBottom: '8px' }}>
                      BOUNDING BOX
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
                      {[
                        { label: 'Min X', value: info.bounds.min.x },
                        { label: 'Max X', value: info.bounds.max.x },
                        { label: 'Min Y', value: info.bounds.min.y },
                        { label: 'Max Y', value: info.bounds.max.y },
                        { label: 'Min Z', value: info.bounds.min.z },
                        { label: 'Max Z', value: info.bounds.max.z },
                      ].map(({ label, value }) => (
                        <div key={label} style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontFamily: 'monospace',
                          fontSize: '12px',
                          padding: '2px 0',
                        }}>
                          <span style={{ color: '#555' }}>{label}</span>
                          <span style={{ color: '#aaa' }}>{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Export buttons */}
                  <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                    <button onClick={handleExportCSV} style={exportBtn}>
                      📄 Export CSV
                    </button>
                    <button onClick={handleExportPDF} style={exportBtn}>
                      🖨 Print / PDF
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── Materials Tab ── */}
          {activeTab === 'materials' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {info.materials.length === 0 ? (
                <div style={{ color: '#444', fontFamily: 'monospace', fontSize: '13px', textAlign: 'center', padding: '48px 16px' }}>
                  No blocks placed yet.
                </div>
              ) : (
                <>
                  {/* Progress */}
                  <div style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid #1e1e30',
                    borderRadius: '8px',
                    padding: '12px',
                    marginBottom: '4px',
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontFamily: 'monospace',
                      fontSize: '11px',
                      color: '#555',
                      marginBottom: '6px',
                    }}>
                      <span>Materials gathered</span>
                      <span style={{ color: progressPct === 100 ? '#4CAF50' : '#aaa' }}>
                        {gatheredCount}/{info.materials.length} ({progressPct}%)
                      </span>
                    </div>
                    <div style={{ background: '#1e1e30', borderRadius: '4px', height: '6px', overflow: 'hidden' }}>
                      <div style={{
                        width: `${progressPct}%`,
                        height: '100%',
                        background: progressPct === 100 ? '#4CAF50' : '#2196F3',
                        transition: 'width 0.3s ease',
                      }} />
                    </div>
                  </div>

                  {/* Reset + export row */}
                  <div style={{ display: 'flex', gap: '6px', marginBottom: '4px' }}>
                    <button onClick={resetChecklist} style={{ ...exportBtn, flex: 1, color: '#f44336', borderColor: '#f44336' }}>
                      Reset Checklist
                    </button>
                    <button onClick={handleExportCSV} style={{ ...exportBtn, flex: 1 }}>
                      📄 CSV
                    </button>
                    <button onClick={handleExportPDF} style={{ ...exportBtn, flex: 1 }}>
                      🖨 PDF
                    </button>
                  </div>

                  {/* Material list */}
                  {info.materials.map((material) => {
                    const isChecked = checked.has(material.key)
                    return (
                      <button
                        key={material.key}
                        onClick={() => toggleCheck(material.key)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '8px 10px',
                          background: isChecked ? 'rgba(76,175,80,0.06)' : 'rgba(255,255,255,0.02)',
                          border: isChecked ? '1px solid rgba(76,175,80,0.25)' : '1px solid #1e1e30',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          textAlign: 'left',
                          width: '100%',
                          transition: 'all 0.1s',
                        }}
                      >
                        {/* Checkbox */}
                        <div style={{
                          width: '16px',
                          height: '16px',
                          borderRadius: '3px',
                          border: `2px solid ${isChecked ? '#4CAF50' : '#444'}`,
                          background: isChecked ? '#4CAF50' : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          fontSize: '10px',
                          color: '#fff',
                        }}>
                          {isChecked ? '✓' : ''}
                        </div>

                        {/* Color swatch */}
                        <div style={{
                          width: '16px',
                          height: '16px',
                          borderRadius: '3px',
                          background: material.color,
                          border: '1px solid rgba(255,255,255,0.15)',
                          flexShrink: 0,
                        }} />

                        {/* Name */}
                        <div style={{
                          flex: 1,
                          fontFamily: 'monospace',
                          fontSize: '12px',
                          color: isChecked ? '#4CAF50' : '#ccc',
                          textDecoration: isChecked ? 'line-through' : 'none',
                          opacity: isChecked ? 0.6 : 1,
                        }}>
                          {material.displayName}
                        </div>

                        {/* Count */}
                        <div style={{
                          fontFamily: 'monospace',
                          fontSize: '12px',
                          color: isChecked ? '#4CAF50' : '#666',
                          fontWeight: 'bold',
                          flexShrink: 0,
                        }}>
                          ×{material.count.toLocaleString()}
                        </div>
                      </button>
                    )
                  })}
                </>
              )}
            </div>
          )}

          {/* ── Variants Tab ── */}
          {activeTab === 'variants' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {info.variantGroups.length === 0 ? (
                <div style={{ color: '#444', fontFamily: 'monospace', fontSize: '13px', textAlign: 'center', padding: '48px 16px' }}>
                  No blocks placed yet.
                </div>
              ) : info.variantGroups.map(group => {
                const pct = Math.round(group.count / info.totalBlocks * 100)
                return (
                  <div key={group.group} style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid #1e1e30',
                    borderRadius: '6px',
                    padding: '10px 12px',
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontFamily: 'monospace',
                      fontSize: '12px',
                      marginBottom: '6px',
                    }}>
                      <span style={{ color: '#ccc' }}>{group.label}</span>
                      <span style={{ color: '#666' }}>
                        {group.count.toLocaleString()} <span style={{ color: '#444' }}>({pct}%)</span>
                      </span>
                    </div>
                    <div style={{ background: '#1e1e30', borderRadius: '3px', height: '4px', overflow: 'hidden' }}>
                      <div style={{
                        width: `${pct}%`,
                        height: '100%',
                        background: '#4CAF50',
                      }} />
                    </div>
                  </div>
                )
              })}
            </div>
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
          Checklist saves automatically · Esc to close
        </div>
      </div>
    </>
  )
}

const exportBtn: React.CSSProperties = {
  padding: '7px 10px',
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid #333',
  borderRadius: '6px',
  color: '#aaa',
  fontFamily: 'monospace',
  fontSize: '11px',
  cursor: 'pointer',
  flex: 1,
}
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
