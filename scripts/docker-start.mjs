/**
 * Container entrypoint (Docker image only).
 *
 * The image is built without database access, so prerendered pages start with
 * empty placeholder content (see src/server/services/content.ts). This script
 * starts the Next.js standalone server, then requests every prerendered route
 * once so they regenerate with real data before the first visitor arrives.
 */
import { spawn } from 'node:child_process'
import { readFileSync } from 'node:fs'

const port = process.env.PORT || '3000'
const base = `http://127.0.0.1:${port}`

const server = spawn(process.execPath, ['server.js'], { stdio: 'inherit' })
for (const signal of ['SIGTERM', 'SIGINT']) process.on(signal, () => server.kill(signal))
server.on('exit', (code) => process.exit(code ?? 0))

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function waitUntilReady() {
  for (let i = 0; i < 120; i++) {
    try {
      if ((await fetch(`${base}/api/health`)).ok) return true
    } catch {}
    await sleep(500)
  }
  return false
}

async function warmUp() {
  if (!(await waitUntilReady())) return console.warn('[warmup] server not ready, skipped')
  let routes = []
  try {
    const manifest = JSON.parse(readFileSync('.next/prerender-manifest.json', 'utf8'))
    routes = Object.keys(manifest.routes ?? {}).filter((r) => !r.includes('['))
  } catch {
    routes = ['/fr', '/en']
  }
  // Two passes: the first marks stale entries for regeneration, the second
  // waits for fresh ones (stale-while-revalidate).
  for (let pass = 0; pass < 2; pass++) {
    await Promise.all(
      routes.map((r) =>
        fetch(base + r)
          .then((res) => res.arrayBuffer())
          .catch(() => {}),
      ),
    )
    await sleep(1500)
  }
  console.log(`[warmup] ${routes.length} prerendered routes refreshed with live data`)
}

warmUp()
