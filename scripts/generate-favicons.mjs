/**
 * Generate PNG + ICO favicons from public/favicon.svg for search engines (Yandex/Google).
 */
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

/** Vista+ ICO that embeds PNG payloads. 16 and 32 only — a 120px bitmap made favicon.ico ~285 KB. */
function icoFromPngs(pngs) {
  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0)
  header.writeUInt16LE(1, 2)
  header.writeUInt16LE(pngs.length, 4)
  const entries = []
  let offset = 6 + pngs.length * 16
  for (const png of pngs) {
    const width = png.readUInt32BE(16)
    const height = png.readUInt32BE(20)
    const entry = Buffer.alloc(16)
    entry.writeUInt8(width >= 256 ? 0 : width, 0)
    entry.writeUInt8(height >= 256 ? 0 : height, 1)
    entry.writeUInt16LE(1, 4)
    entry.writeUInt16LE(32, 6)
    entry.writeUInt32LE(png.length, 8)
    entry.writeUInt32LE(offset, 12)
    offset += png.length
    entries.push(entry)
  }
  return Buffer.concat([header, ...entries, ...pngs])
}

async function main() {
  const png16 = path.join(publicDir, 'favicon-16.png')
  const png32 = path.join(publicDir, 'favicon-32.png')
  const png120 = path.join(publicDir, 'favicon-120.png')
  const apple = path.join(publicDir, 'apple-touch-icon.png')
  const ico = path.join(publicDir, 'favicon.ico')

  await renderPng(16, png16)
  await renderPng(32, png32)
  await renderPng(120, png120)
  writeFileSync(apple, readFileSync(png120))
  writeFileSync(ico, icoFromPngs([readFileSync(png16), readFileSync(png32)]))
  console.log('[favicons] public/favicon.ico')
}

main().catch((err) => {
  console.error('[favicons]', err)
  process.exit(1)
})
