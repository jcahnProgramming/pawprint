import pako from 'pako'
import { PlacedBlock } from '@/store/editorStore'
import { exportLitematic as exportLitematicNBT } from './litematic'

export type ImportResult = {
  blocks: Map<string, PlacedBlock>
  name: string
  error?: string
}

export type ExportFormat = 'pawprint' | 'litematic' | 'schem' | 'schematic'

export const FORMAT_LABELS: Record<ExportFormat, string> = {
  pawprint: '.pawprint',
  litematic: '.litematic',
  schem: '.schem',
  schematic: '.schematic',
}

// ── .pawprint (native JSON) ──────────────────────────────────────────────────

export function exportPawPrint(
  blocks: Map<string, PlacedBlock>,
  name: string
): string {
  const obj: Record<string, PlacedBlock> = {}
  blocks.forEach((block, key) => { obj[key] = block })
  return JSON.stringify({ version: 1, name, blocks: obj }, null, 2)
}

export function importPawPrint(json: string): ImportResult {
  try {
    const data = JSON.parse(json)
    if (!data.blocks) throw new Error('Invalid .pawprint file')
    const blocks = new Map<string, PlacedBlock>()
    Object.entries(data.blocks).forEach(([key, block]) => {
      blocks.set(key, block as PlacedBlock)
    })
    return { blocks, name: data.name ?? 'Imported Build' }
  } catch (e) {
    return { blocks: new Map(), name: 'Failed Import', error: String(e) }
  }
}

// ── .litematic ───────────────────────────────────────────────────────────────

export function exportLitematic(
  blocks: Map<string, PlacedBlock>,
  name: string,
  mcVersion: '1.21.4' | '1.20.4' = '1.21.4'
): { data?: Blob; filename?: string; error?: string } {
  try {
    const bytes = exportLitematicNBT(blocks, name, mcVersion)
    return {
      data: new Blob([bytes], { type: 'application/octet-stream' }),
      filename: `${name.replace(/[^a-z0-9_\-]/gi, '_')}.litematic`,
    }
  } catch (e) {
    return { error: String(e) }
  }
}

export function importLitematic(buffer: ArrayBuffer): ImportResult {
  return {
    blocks: new Map(),
    name: 'Litematic Import',
    error: '.litematic import coming soon — use .pawprint for now',
  }
}

// ── .schem (stub) ────────────────────────────────────────────────────────────

export function exportSchem(
  blocks: Map<string, PlacedBlock>,
  name: string
): { error: string } {
  return { error: '.schem export coming soon — use .pawprint for now' }
}

export function importSchem(buffer: ArrayBuffer): ImportResult {
  return {
    blocks: new Map(),
    name: 'Schem Import',
    error: '.schem import coming soon',
  }
}

// ── .schematic legacy (stub) ─────────────────────────────────────────────────

export function exportSchematic(
  blocks: Map<string, PlacedBlock>,
  name: string
): { error: string } {
  return { error: '.schematic export coming soon — use .pawprint for now' }
}

export function importSchematic(buffer: ArrayBuffer): ImportResult {
  return {
    blocks: new Map(),
    name: 'Schematic Import',
    error: '.schematic import coming soon',
  }
}

// ── Universal file importer ──────────────────────────────────────────────────

export async function importFromFile(file: File): Promise<ImportResult> {
  const ext = file.name.split('.').pop()?.toLowerCase()
  const nameWithoutExt = file.name.replace(/\.[^.]+$/, '')

  if (ext === 'pawprint') {
    const text = await file.text()
    const result = importPawPrint(text)
    return { ...result, name: result.name || nameWithoutExt }
  }

  const buffer = await file.arrayBuffer()
  if (ext === 'litematic') return { ...importLitematic(buffer), name: nameWithoutExt }
  if (ext === 'schem') return { ...importSchem(buffer), name: nameWithoutExt }
  if (ext === 'schematic') return { ...importSchematic(buffer), name: nameWithoutExt }

  return {
    blocks: new Map(),
    name: nameWithoutExt,
    error: `Unsupported file type: .${ext}`,
  }
}

// ── Universal file exporter ──────────────────────────────────────────────────

export function exportToFile(
  blocks: Map<string, PlacedBlock>,
  name: string,
  format: ExportFormat,
  mcVersion: '1.21.4' | '1.20.4' = '1.21.4'
): { data?: Blob; filename?: string; error?: string } {
  const safeName = name.replace(/[^a-z0-9_\-]/gi, '_')

  if (format === 'pawprint') {
    const json = exportPawPrint(blocks, name)
    return {
      data: new Blob([json], { type: 'application/json' }),
      filename: `${safeName}.pawprint`,
    }
  }

  if (format === 'litematic') {
    return exportLitematic(blocks, name, mcVersion)
  }

  if (format === 'schem') {
    const result = exportSchem(blocks, name)
    return { error: result.error }
  }

  if (format === 'schematic') {
    const result = exportSchematic(blocks, name)
    return { error: result.error }
  }

  return { error: 'Unknown format' }
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}