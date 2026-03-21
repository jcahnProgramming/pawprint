import Link from 'next/link'

export default function Home() {
  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: '#1a1a2e',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#fff',
      fontFamily: 'monospace',
      gap: '16px'
    }}>
      <div style={{ fontSize: '64px' }}>🐾</div>
      <h1 style={{ fontSize: '48px', fontWeight: 'bold' }}>PawPrint</h1>
      <p style={{ color: '#888', fontSize: '16px' }}>Browser-native Minecraft schematic builder</p>
      <Link href="/editor" style={{
        marginTop: '24px',
        padding: '12px 32px',
        background: '#4CAF50',
        color: '#fff',
        borderRadius: '8px',
        textDecoration: 'none',
        fontSize: '18px',
        fontWeight: 'bold'
      }}>
        Open Editor
      </Link>
      <p style={{ color: '#444', fontSize: '12px', marginTop: '8px' }}>MeowNet Studios</p>
    </div>
  )
}