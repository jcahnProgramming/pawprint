import pako from 'pako'
import { PlacedBlock } from '@/store/editorStore'
import { buildBlockstateString } from './blockstateExport'
import { VariantType } from './blockVariants'

const MC_VERSIONS: Record<string, number> = {
  '1.21.4': 4189,
  '1.20.4': 3953,
}

const TAG = {
  END: 0,
  BYTE: 1,
  SHORT: 2,
  INT: 3,
  LONG: 4,
  FLOAT: 5,
  DOUBLE: 6,
  BYTE_ARRAY: 7,
  STRING: 8,
  LIST: 9,
  COMPOUND: 10,
  INT_ARRAY: 11,
  LONG_ARRAY: 12,
}

class NBTWriter {
  private buf: number[] = []

  writeByte(v: number) { this.buf.push(v & 0xff) }

  writeShort(v: number) {
    this.buf.push((v >> 8) & 0xff, v & 0xff)
  }

  writeInt(v: number) {
    this.buf.push(
      (v >> 24) & 0xff,
      (v >> 16) & 0xff,
      (v >> 8) & 0xff,
      v & 0xff
    )
  }

  writeLong64(value: bigint) {
    const hi = Number(BigInt.asIntN(32, value >> 32n))
    const lo = Number(BigInt.asIntN(32, value & 0xffffffffn))
    this.writeInt(hi)
    this.writeInt(lo >>> 0)
  }

  writeString(s: string) {
    const encoded = new TextEncoder().encode(s)
    this.writeShort(encoded.length)
    encoded.forEach(b => this.writeByte(b))
  }

  writeTagHeader(type: number, name: string) {
    this.writeByte(type)
    this.writeString(name)
  }

  writeByteTag(name: string, v: number) {
    this.writeTagHeader(TAG.BYTE, name)
    this.writeByte(v)
  }

  writeIntTag(name: string, v: number) {
    this.writeTagHeader(TAG.INT, name)
    this.writeInt(v)
  }

  writeLongTag(name: string, value: bigint) {
    this.writeTagHeader(TAG.LONG, name)
    this.writeLong64(value)
  }

  writeStringTag(name: string, v: string) {
    this.writeTagHeader(TAG.STRING, name)
    this.writeString(v)
  }

  writeIntVec3Tag(name: string, x: number, y: number, z: number) {
    this.writeTagHeader(TAG.COMPOUND, name)
    this.writeIntTag('x', x)
    this.writeIntTag('y', y)
    this.writeIntTag('z', z)
    this.writeByte(TAG.END)
  }

  writeLongArrayTag(name: string, longs: bigint[]) {
    this.writeTagHeader(TAG.LONG_ARRAY, name)
    this.writeInt(longs.length)
    longs.forEach(l => this.writeLong64(l))
  }

  startCompoundTag(name: string) {
    this.writeTagHeader(TAG.COMPOUND, name)
  }

  endCompound() {
    this.writeByte(TAG.END)
  }

  startListTag(name: string, elementType: number, length: number) {
    this.writeTagHeader(TAG.LIST, name)
    this.writeByte(elementType)
    this.writeInt(length)
  }

  toUint8Array(): Uint8Array {
    return new Uint8Array(this.buf)
  }
}

function packBlockStates(indices: number[], bitsPerBlock: number): bigint[] {
  const longsNeeded = Math.ceil((indices.length * bitsPerBlock) / 64)
  const longs = new Array(longsNeeded).fill(0n)
  const mask = (1n << BigInt(bitsPerBlock)) - 1n

  for (let i = 0; i < indices.length; i++) {
    const bitIdx = i * bitsPerBlock
    const longIdx = Math.floor(bitIdx / 64)
    const bitOffset = bitIdx % 64
    const val = BigInt(indices[i]) & mask
    longs[longIdx] |= val << BigInt(bitOffset)
    const bitsWritten = 64 - bitOffset
    if (bitsWritten < bitsPerBlock && longIdx + 1 < longs.length) {
      longs[longIdx + 1] |= val >> BigInt(bitsWritten)
    }
  }

  return longs
}

function parseBlockState(blockStateStr: string): {
  name: string
  properties: Record<string, string>
} {
  const bracketIdx = blockStateStr.indexOf('[')
  if (bracketIdx === -1) {
    return { name: blockStateStr, properties: {} }
  }
  const name = blockStateStr.substring(0, bracketIdx)
  const propsStr = blockStateStr.substring(bracketIdx + 1, blockStateStr.length - 1)
  const properties: Record<string, string> = {}
  propsStr.split(',').forEach(pair => {
    const [k, v] = pair.split('=')
    if (k && v) properties[k.trim()] = v.trim()
  })
  return { name, properties }
}

export function exportLitematic(
  blocks: Map<string, PlacedBlock>,
  projectName: string,
  mcVersion: '1.21.4' | '1.20.4' = '1.21.4'
): Uint8Array {
  if (blocks.size === 0) throw new Error('No blocks to export')

  // ── 1. Compute bounds ──────────────────────────────────────────────────────
  let minX = Infinity, minY = Infinity, minZ = Infinity
  let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity

  blocks.forEach((_, key) => {
    const [x, y, z] = key.split(',').map(Number)
    minX = Math.min(minX, x); maxX = Math.max(maxX, x)
    minY = Math.min(minY, y); maxY = Math.max(maxY, y)
    minZ = Math.min(minZ, z); maxZ = Math.max(maxZ, z)
  })

  const sizeX = maxX - minX + 1
  const sizeY = maxY - minY + 1
  const sizeZ = maxZ - minZ + 1
  const totalVolume = sizeX * sizeY * sizeZ

  // ── 2. Build palette using correct blockstate strings ──────────────────────
  const paletteMap = new Map<string, number>()
  paletteMap.set('minecraft:air', 0)

  blocks.forEach((block) => {
    const variantType = (block.variantType ?? 'full') as VariantType
    const bs = buildBlockstateString(block.id, variantType)
    if (!paletteMap.has(bs)) {
      paletteMap.set(bs, paletteMap.size)
    }
  })

  const palette = Array.from(paletteMap.keys())
  const bitsPerBlock = Math.max(2, Math.ceil(Math.log2(palette.length)))

  // ── 3. Build block index array (YZX order) ─────────────────────────────────
  const blockIndices = new Array(totalVolume).fill(0)

  blocks.forEach((block, key) => {
    const [x, y, z] = key.split(',').map(Number)
    const lx = x - minX
    const ly = y - minY
    const lz = z - minZ
    const idx = lx + lz * sizeX + ly * sizeX * sizeZ
    const variantType = (block.variantType ?? 'full') as VariantType
    const bs = buildBlockstateString(block.id, variantType)
    blockIndices[idx] = paletteMap.get(bs) ?? 0
  })

  // ── 4. Pack into longs ─────────────────────────────────────────────────────
  const packedLongs = packBlockStates(blockIndices, bitsPerBlock)

  // ── 5. Write NBT ───────────────────────────────────────────────────────────
  const now = BigInt(Date.now())
  const dataVersion = MC_VERSIONS[mcVersion] ?? 4189
  const regionName = projectName.replace(/[^a-zA-Z0-9_\-]/g, '_') || 'Region'
  const w = new NBTWriter()

  w.startCompoundTag('')
  w.writeIntTag('Version', 6)
  w.writeIntTag('SubVersion', 1)
  w.writeIntTag('MinecraftDataVersion', dataVersion)

  // Metadata
  w.startCompoundTag('Metadata')
  w.writeStringTag('Name', projectName)
  w.writeStringTag('Author', 'Pawprint')
  w.writeIntTag('RegionCount', 1)
  w.writeLongTag('TimeCreated', now)
  w.writeLongTag('TimeModified', now)
  w.writeIntVec3Tag('EnclosingSize', sizeX, sizeY, sizeZ)
  w.writeIntTag('TotalBlocks', blocks.size)
  w.writeIntTag('TotalVolume', totalVolume)
  w.startCompoundTag('PreviewImageData')
  w.endCompound()
  w.endCompound() // Metadata

  // Regions
  w.startCompoundTag('Regions')
  w.startCompoundTag(regionName)
  w.writeIntVec3Tag('Position', 0, 0, 0)
  w.writeIntVec3Tag('Size', sizeX, sizeY, sizeZ)

  // BlockStatePalette
  w.startListTag('BlockStatePalette', TAG.COMPOUND, palette.length)
  palette.forEach(blockStateStr => {
    const { name, properties } = parseBlockState(blockStateStr)
    w.writeStringTag('Name', name)
    if (Object.keys(properties).length > 0) {
      w.startCompoundTag('Properties')
      Object.entries(properties).forEach(([k, v]) => {
        w.writeStringTag(k, v)
      })
      w.endCompound()
    }
    w.writeByte(TAG.END)
  })

  w.writeLongArrayTag('BlockStates', packedLongs)
  w.startListTag('Entities', TAG.COMPOUND, 0)
  w.startListTag('TileEntities', TAG.COMPOUND, 0)
  w.startListTag('PendingBlockTicks', TAG.COMPOUND, 0)
  w.startListTag('PendingFluidTicks', TAG.COMPOUND, 0)

  w.endCompound() // region
  w.endCompound() // Regions
  w.endCompound() // root

  // ── 6. GZip compress ──────────────────────────────────────────────────────
  return pako.gzip(w.toUint8Array())
}