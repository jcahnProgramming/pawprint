import * as THREE from 'three'
import { FaceTextures } from './blockTextures'

const loader = new THREE.TextureLoader()
const cache = new Map<string, THREE.Texture>()
const mirroredCache = new Map<string, THREE.Texture>()
const fallbackCache = new Map<string, THREE.Texture>()

export function loadBlockTexture(url: string): THREE.Texture {
  if (cache.has(url)) return cache.get(url)!
  const texture = loader.load(url)
  texture.magFilter = THREE.NearestFilter
  texture.minFilter = THREE.NearestFilter
  texture.colorSpace = THREE.SRGBColorSpace
  cache.set(url, texture)
  return texture
}

export function loadMirroredTexture(url: string): THREE.Texture {
  const key = `mirrored:${url}`
  if (mirroredCache.has(key)) return mirroredCache.get(key)!
  const texture = loader.load(url)
  texture.magFilter = THREE.NearestFilter
  texture.minFilter = THREE.NearestFilter
  texture.colorSpace = THREE.SRGBColorSpace
  // Flip U axis to mirror horizontally
  texture.repeat.set(-1, 1)
  texture.offset.set(1, 0)
  mirroredCache.set(key, texture)
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

export function getBlockMaterials(
  blockId: string,
  blockColor: string,
  faceTextures: FaceTextures | null,
  variantType?: string,
  mirrored?: boolean
): THREE.MeshLambertMaterial[] {
  let effectiveTextures = faceTextures

  if (faceTextures && variantType) {
    if (variantType === 'door_lower') {
      effectiveTextures = {
        top: faceTextures.bottom,
        bottom: faceTextures.bottom,
        north: faceTextures.bottom,
        south: faceTextures.bottom,
        east: faceTextures.bottom,
        west: faceTextures.bottom,
      }
    } else if (variantType === 'door_upper') {
      effectiveTextures = {
        top: faceTextures.top,
        bottom: faceTextures.top,
        north: faceTextures.top,
        south: faceTextures.top,
        east: faceTextures.top,
        west: faceTextures.top,
      }
    }
  }

  if (!effectiveTextures) {
    const fallback = makeFallbackTexture(blockColor)
    return Array(6).fill(null).map(() =>
      new THREE.MeshLambertMaterial({ map: fallback })
    )
  }

  const { top, bottom, north, south, east, west } = effectiveTextures
  const faceOrder = [east, west, top, bottom, south, north]

  const isGlass = blockId.includes('glass')
  const isIce = blockId.includes('ice') && !blockId.includes('blue_ice')
  const isDoor = variantType === 'door_lower' || variantType === 'door_upper'
  const isTrapdoor =
    variantType === 'trapdoor_bottom' ||
    variantType === 'trapdoor_top' ||
    (variantType?.startsWith('trapdoor_open') ?? false)

  return faceOrder.map(texName => {
    const url = `/textures/blocks/${texName}.png`
    const texture = mirrored && isDoor
      ? loadMirroredTexture(url)
      : loadBlockTexture(url)
    return new THREE.MeshLambertMaterial({
      map: texture,
      transparent: isGlass || isIce || isDoor || isTrapdoor,
      opacity: isGlass ? 0.8 : isIce ? 0.9 : 1.0,
      alphaTest: isGlass || isDoor || isTrapdoor ? 0.1 : 0,
      side: isDoor || isTrapdoor ? THREE.DoubleSide : THREE.FrontSide,
    })
  })
}