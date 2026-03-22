export function getLineBetween(
  a: { x: number; y: number; z: number },
  b: { x: number; y: number; z: number }
): { x: number; y: number; z: number }[] {
  const positions: { x: number; y: number; z: number }[] = []
  const dx = b.x - a.x
  const dy = b.y - a.y
  const dz = b.z - a.z
  const steps = Math.max(Math.abs(dx), Math.abs(dy), Math.abs(dz))
  if (steps === 0) return [a]
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    positions.push({
      x: Math.round(a.x + dx * t),
      y: Math.round(a.y + dy * t),
      z: Math.round(a.z + dz * t),
    })
  }
  return positions
}

export function getRectBetween(
  a: { x: number; y: number; z: number },
  b: { x: number; y: number; z: number }
): { x: number; y: number; z: number }[] {
  const positions: { x: number; y: number; z: number }[] = []
  const minX = Math.min(a.x, b.x), maxX = Math.max(a.x, b.x)
  const minY = Math.min(a.y, b.y), maxY = Math.max(a.y, b.y)
  const minZ = Math.min(a.z, b.z), maxZ = Math.max(a.z, b.z)
  for (let x = minX; x <= maxX; x++) {
    for (let y = minY; y <= maxY; y++) {
      for (let z = minZ; z <= maxZ; z++) {
        positions.push({ x, y, z })
      }
    }
  }
  return positions
}

export function floodFill(
  blocks: Map<string, { id: string; color: string }>,
  startX: number,
  startY: number,
  startZ: number,
  maxBlocks = 10000
): { x: number; y: number; z: number }[] {
  const startKey = `${startX},${startY},${startZ}`
  const targetBlock = blocks.get(startKey)
  if (!targetBlock) return []

  const targetId = targetBlock.id
  const visited = new Set<string>()
  const queue: { x: number; y: number; z: number }[] = [{ x: startX, y: startY, z: startZ }]
  const result: { x: number; y: number; z: number }[] = []
  const dirs = [
    { x: 1, y: 0, z: 0 }, { x: -1, y: 0, z: 0 },
    { x: 0, y: 1, z: 0 }, { x: 0, y: -1, z: 0 },
    { x: 0, y: 0, z: 1 }, { x: 0, y: 0, z: -1 },
  ]

  while (queue.length > 0 && result.length < maxBlocks) {
    const { x, y, z } = queue.shift()!
    const key = `${x},${y},${z}`
    if (visited.has(key)) continue
    visited.add(key)
    const block = blocks.get(key)
    if (!block || block.id !== targetId) continue
    result.push({ x, y, z })
    dirs.forEach(d => {
      const nk = `${x + d.x},${y + d.y},${z + d.z}`
      if (!visited.has(nk)) queue.push({ x: x + d.x, y: y + d.y, z: z + d.z })
    })
  }

  return result
}