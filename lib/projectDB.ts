import { openDB, DBSchema, IDBPDatabase } from 'idb'
import type { VariantType } from './blockVariants'

// Projects saved before block variants existed have no variantType.
export type StoredBlock = { id: string; color: string; variantType?: VariantType }

export type ProjectRecord = {
  id: string
  name: string
  createdAt: number
  updatedAt: number
  blockCount: number
  blocks: Record<string, StoredBlock>
}

interface PawPrintDB extends DBSchema {
  projects: {
    key: string
    value: ProjectRecord
    indexes: { 'by-updated': number }
  }
}

let _db: IDBPDatabase<PawPrintDB> | null = null

async function getDB() {
  if (_db) return _db
  _db = await openDB<PawPrintDB>('pawprint', 1, {
    upgrade(db) {
      const store = db.createObjectStore('projects', { keyPath: 'id' })
      store.createIndex('by-updated', 'updatedAt')
    },
  })
  return _db
}

export async function getAllProjects(): Promise<ProjectRecord[]> {
  const db = await getDB()
  const all = await db.getAllFromIndex('projects', 'by-updated')
  return all.reverse() // newest first
}

export async function getProject(id: string): Promise<ProjectRecord | undefined> {
  const db = await getDB()
  return db.get('projects', id)
}

export async function saveProject(project: ProjectRecord): Promise<void> {
  const db = await getDB()
  await db.put('projects', project)
}

export async function deleteProject(id: string): Promise<void> {
  const db = await getDB()
  await db.delete('projects', id)
}