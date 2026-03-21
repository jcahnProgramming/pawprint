'use client'

export default function Crosshair() {
  return (
    <div style={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      pointerEvents: 'none',
      zIndex: 10,
    }}>
      <div style={{ position: 'relative', width: '20px', height: '20px' }}>
        {/* Horizontal */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: 0,
          width: '100%',
          height: '2px',
          background: 'rgba(255,255,255,0.9)',
          transform: 'translateY(-50%)',
          boxShadow: '0 0 2px rgba(0,0,0,0.8)',
        }} />
        {/* Vertical */}
        <div style={{
          position: 'absolute',
          left: '50%',
          top: 0,
          width: '2px',
          height: '100%',
          background: 'rgba(255,255,255,0.9)',
          transform: 'translateX(-50%)',
          boxShadow: '0 0 2px rgba(0,0,0,0.8)',
        }} />
      </div>
    </div>
  )
}