/**
 * Generate PNG + ICO favicons from public/favicon.svg for search engines (Yandex/Google).
 */
import { execSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const publicDir = path.join(root, 'public')
const svg = readFileSync(path.join(publicDir, 'favicon.svg'), 'utf8')

async function renderPng(size, outPath) {
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: size, height: size } })
  const sizedSvg = svg.replace('<svg ', `<svg width="${size}" height="${size}" `)
  const html = `<!DOCTYPE html><html><head><style>html,body{margin:0;padding:0;width:${size}px;height:${size}px;overflow:hidden;background:#0c0e14}</style></head><body>${sizedSvg}</body></html>`
  await page.setContent(html, { waitUntil: 'load' })
  await page.screenshot({ path: outPath, type: 'png' })
  await browser.close()
  console.log(`[favicons] ${path.relative(root, outPath)}`)
}

async function main() {
  const png32 = path.join(publicDir, 'favicon-32.png')
  const png120 = path.join(publicDir, 'favicon-120.png')
  const apple = path.join(publicDir, 'apple-touch-icon.png')
  const ico = path.join(publicDir, 'favicon.ico')

  await renderPng(32, png32)
  await renderPng(120, png120)
  writeFileSync(apple, readFileSync(png120))

  const icoBuf = execSync(`npx --yes png-to-ico "${png32}" "${png120}"`, {
    cwd: root,
    encoding: 'buffer',
    maxBuffer: 10 * 1024 * 1024,
  })
  writeFileSync(ico, icoBuf)
  console.log('[favicons] public/favicon.ico')
}

main().catch((err) => {
  console.error('[favicons]', err)
  process.exit(1)
})
