import { readFileSync } from 'node:fs'
import { join } from 'node:path'

// Health check for the deploy workflow and uptime monitors.
// The version comes from CHANGELOG.json (the newest release is first), which
// the Docker image copies next to server.js.
export const dynamic = 'force-dynamic'

let cachedVersion: string | null = null

function appVersion(): string {
  if (cachedVersion === null) {
    try {
      const changelog = JSON.parse(readFileSync(join(process.cwd(), 'CHANGELOG.json'), 'utf8'))
      const version = changelog?.releases?.[0]?.version
      cachedVersion = typeof version === 'string' ? version : 'unknown'
    } catch {
      cachedVersion = 'unknown'
    }
  }
  return cachedVersion
}

export function GET() {
  return Response.json(
    { ok: true, version: appVersion() },
    { headers: { 'Cache-Control': 'no-store' } },
  )
}
