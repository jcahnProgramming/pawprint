import * as THREE from 'three'

const loader = new THREE.TextureLoader()
const cache = new Map<string, THREE.Texture>()
const fallbackCache = new Map<string, THREE.Texture>()

export function loadBlockTexture(url: string): THREE.Texture {
  if (cache.has(url)) return cache.get(url)!

  const texture = loader.load(url, undefined, undefined, () => {
    // On error — texture failed to load, use fallback color
  })

  texture.magFilter = THREE.NearestFilter
  texture.minFilter = THREE.NearestFilter
  texture.colorSpace = THREE.SRGBColorSpace

  cache.set(url, texture)
  return texture
}

export function makeFallbackTexture(color: string): THREE.Texture {
  if (fallbackCache.has(color)) return fallbackCache.get(color)!

  const canvas = document.createElement('canvas')
  canvas.width = 16
  canvas.height = 16
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = color
  ctx.fillRect(0, 0, 16, 16)

  const texture = new THREE.CanvasTexture(canvas)
  texture.magFilter = THREE.NearestFilter
  texture.minFilter = THREE.NearestFilter
  fallbackCache.set(color, texture)
  return texture
}

// Returns [top, bottom, north, south, east, west] materials
export function getBlockMaterials(
  blockId: string,
  blockColor: string,
  faceTextures: import('./blockTextures').FaceTextures | null
): THREE.MeshLambertMaterial[] {
  if (!faceTextures) {
    const fallback = makeFallbackTexture(blockColor)
    return Array(6).fill(null).map(() =>
      new THREE.MeshLambertMaterial({ map: fallback })
    )
  }

  const { top, bottom, north, south, east, west } = faceTextures

  // Three.js BoxGeometry face order: +X, -X, +Y, -Y, +Z, -Z
  // = right, left, top, bottom, front, back
  const faceOrder = [east, west, top, bottom, south, north]

  return faceOrder.map(texName => {
    const url = `/textures/blocks/${texName}.png`
    const texture = loadBlockTexture(url)
    return new THREE.MeshLambertMaterial({
      map: texture,
      transparent: blockId.includes('glass') || blockId.includes('ice'),
      opacity: blockId.includes('glass') ? 0.8 : 1.0,
    })
  })
}