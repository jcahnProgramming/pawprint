import dynamic from 'next/dynamic'

const EditorClient = dynamic(() => import('@/components/editor/EditorClient'), {
  ssr: false,
  loading: () => (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: '#1a1a2e',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#fff',
      fontFamily: 'monospace',
      fontSize: '18px'
    }}>
      🐾 Loading PawPrint...
    </div>
  )
})

export default function EditorPage() {
  return <EditorClient />
}