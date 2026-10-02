/**
 * Build-time prerender: crawl public routes, save HTML under dist/.
 *
 * Env:
 *   PRERENDER_API_URL  — backend origin for /api (default http://127.0.0.1:8000)
 *   PRERENDER_ORIGIN   — preview origin (default http://127.0.0.1:4173)
 *   PRERENDER_PUBLIC_ORIGIN / SITE_URL — canonical origin in OG/canonical
 *   SKIP_PRERENDER=1   — no-op exit 0
 *   PRERENDER_TIMEOUT_MS — per-page wait (default 20000)
 */

import { spawn } from 'node:child_process'
import { access } from 'node:fs/promises'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const distDir = path.join(root, 'dist')
const viteBin = path.join(root, 'node_modules', 'vite', 'bin', 'vite.js')

const API_URL = (process.env.PRERENDER_API_URL || 'http://127.0.0.1:8000').replace(/\/$/, '')
const PREVIEW_ORIGIN = (process.env.PRERENDER_ORIGIN || 'http://127.0.0.1:4173').replace(/\/$/, '')
const PUBLIC_ORIGIN = (
  process.env.PRERENDER_PUBLIC_ORIGIN ||
  process.env.SITE_URL ||
  'https://mobauniverse.com'
).replace(/\/$/, '')
const PREVIEW_PORT = Number(new URL(PREVIEW_ORIGIN).port || 4173)
const TIMEOUT_MS = Number(process.env.PRERENDER_TIMEOUT_MS || 20_000)
const LANGS = ['ru', 'en']

function log(msg) {
  console.log(`[prerender] ${msg}`)
}

async function fetchJson(url) {
  let res
  try {
    res = await fetch(url)
  } catch (err) {
    throw new Error(`${err.cause?.code || err.code || 'fetch failed'}: ${url}`)
  }
  if (!res.ok) throw new Error(`${res.status} ${url}`)
  return res.json()
}

async function collectArticleSlugs() {
  const slugs = []
  let page = 1
  const pageSize = 100
  for (;;) {
    const data = await fetchJson(
      `${API_URL}/api/evergreen/articles?paginated=true&page=${page}&page_size=${pageSize}`,
    )
    const items = data.items || []
    for (const item of items) {
      if (item.slug) slugs.push(item.slug)
    }
    if (slugs.length >= (data.total ?? items.length) || items.length === 0) break
    page += 1
    if (page > 50) break
  }
  return slugs
}

async function collectUserIds() {
  const users = await fetchJson(`${API_URL}/api/users`)
  if (!Array.isArray(users)) return []
  return users.map((u) => u.user_id ?? u.id).filter((id) => Number.isFinite(id) && id > 0)
}

async function buildRoutes() {
  const routes = []
  for (const lang of LANGS) {
    routes.push(`/${lang}`)
    routes.push(`/${lang}/evergreen`)
    routes.push(`/${lang}/users`)
    routes.push(`/${lang}/privacy`)
    routes.push(`/${lang}/terms`)
  }

  let slugs = []
  let userIds = []
  try {
    slugs = await collectArticleSlugs()
    log(`articles: ${slugs.length}`)
  } catch (err) {
    log(`WARN articles API unavailable (${err.message}) — start backend on :8000 for full prerender`)
  }
  try {
    userIds = await collectUserIds()
    log(`users: ${userIds.length}`)
  } catch (err) {
    log(`WARN users API unavailable (${err.message})`)
  }

  for (const lang of LANGS) {
    for (const slug of slugs) {
      routes.push(`/${lang}/evergreen/${slug}`)
    }
    for (const id of userIds) {
      routes.push(`/${lang}/user/${id}`)
    }
  }

  return [...new Set(routes)]
}

async function waitForPreview(timeoutMs = 15000) {
  const started = Date.now()
  while (Date.now() - started < timeoutMs) {
    try {
      const res = await fetch(`${PREVIEW_ORIGIN}/`)
      if (res.ok || res.status === 404) return
    } catch {
      // not up yet
    }
    await new Promise((r) => setTimeout(r, 200))
  }
  throw new Error(`vite preview did not start at ${PREVIEW_ORIGIN}`)
}

async function startPreview() {
  await access(viteBin)

  // Spawn node + vite.js directly (avoids Windows npx.cmd → spawn EINVAL)
  const child = spawn(
    process.execPath,
    [viteBin, 'preview', '--host', '127.0.0.1', '--port', String(PREVIEW_PORT), '--strictPort'],
    {
      cwd: root,
      env: {
        ...process.env,
        PRERENDER_API_URL: API_URL,
      },
      stdio: ['ignore', 'pipe', 'pipe'],
      windowsHide: true,
    },
  )

  child.stdout.on('data', (buf) => {
    const text = buf.toString().trim()
    if (text) log(`preview: ${text}`)
  })
  child.stderr.on('data', (buf) => {
    const text = buf.toString().trim()
    if (text) log(`preview: ${text}`)
  })

  const earlyExit = new Promise((_, reject) => {
    child.on('error', reject)
    child.on('exit', (code) => {
      reject(new Error(`vite preview exited early (${code})`))
    })
  })

  await Promise.race([waitForPreview(), earlyExit])
  return child
}

function stopPreview(child) {
  if (!child || child.killed) return
  try {
    if (process.platform === 'win32') {
      spawn('taskkill', ['/pid', String(child.pid), '/f', '/t'], {
        stdio: 'ignore',
        windowsHide: true,
      })
    } else {
      child.kill('SIGTERM')
    }
  } catch {
    child.kill()
  }
}

function routeToFile(route) {
  const clean = route.replace(/\/$/, '') || '/'
  return path.join(distDir, clean.slice(1), 'index.html')
}

async function waitForReady(page) {
  await page.waitForFunction(() => window.__PRERENDER_READY__ === true, null, {
    timeout: TIMEOUT_MS,
  })
  // Flush late meta/json-ld effects and ignore brief ready flicker
  await new Promise((r) => setTimeout(r, 150))
  await page.waitForFunction(() => window.__PRERENDER_READY__ === true, null, {
    timeout: TIMEOUT_MS,
  })
}

async function snapshotRoute(page, route) {
  const url = `${PREVIEW_ORIGIN}${route}`
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: TIMEOUT_MS })
  await waitForReady(page)

  let html = await page.content()
  const boot = await page.evaluate(() => window.__PRERENDER_BOOT__ || null)
  if (boot) {
    const json = JSON.stringify(boot).replace(/</g, '\\u003c')
    html = html.replace('</head>', `<script type="application/json" id="__BOOT__">${json}</script></head>`)
  }
  const file = routeToFile(route)
  await mkdir(path.dirname(file), { recursive: true })
  await writeFile(file, html, 'utf8')
  log(`saved ${route} → ${path.relative(root, file)}`)
}

async function main() {
  if (process.env.SKIP_PRERENDER === '1') {
    log('SKIP_PRERENDER=1 — skipping')
    return
  }

  const routes = await buildRoutes()
  log(`routes: ${routes.length}`)
  log(`API: ${API_URL}`)
  log(`preview: ${PREVIEW_ORIGIN}`)
  log(`public origin: ${PUBLIC_ORIGIN}`)

  const preview = await startPreview()
  let browser
  try {
    browser = await chromium.launch({ headless: true })
    const context = await browser.newContext()
    await context.addInitScript((publicOrigin) => {
      window.__PRERENDER__ = true
      window.__PRERENDER_READY__ = false
      window.__PRERENDER_PUBLIC_ORIGIN__ = publicOrigin
      try {
        localStorage.setItem('cookie_consent', 'rejected')
      } catch {
        /* ignore */
      }
    }, PUBLIC_ORIGIN)

    const page = await context.newPage()
    let ok = 0
    let fail = 0
    for (const route of routes) {
      try {
        await snapshotRoute(page, route)
        ok += 1
      } catch (err) {
        fail += 1
        log(`FAIL ${route}: ${err.message}`)
      }
    }
    log(`done: ${ok} ok, ${fail} failed`)
    if (ok === 0) {
      throw new Error('No pages were prerendered')
    }
  } finally {
    if (browser) await browser.close()
    stopPreview(preview)
  }
}

main().catch((err) => {
  console.error('[prerender]', err)
  process.exit(1)
})
