'use client'

import { useEffect } from 'react'
import { useEditorStore } from '@/store/editorStore'

export default function UndoMessage() {
  const undoMessage = useEditorStore((s) => s.undoMessage)
  const setUndoMessage = useEditorStore((s) => s.setUndoMessage)

  useEffect(() => {
    if (!undoMessage) return
    const t = setTimeout(() => setUndoMessage(null), 1200)
    return () => clearTimeout(t)
  }, [undoMessage, setUndoMessage])

  if (!undoMessage) return null

  return (
    <div style={{
      position: 'absolute',
      top: '20px',
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
      border: '1px solid #333',
      whiteSpace: 'nowrap',
    }}>
      {undoMessage}
    </div>
  )
}