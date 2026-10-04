/**
 * Center-crop guide covers into smaller 16:9 JPEGs.
 *   public/images/foo.png → public/images/promo/mobile/foo.jpg
 *                         → public/images/promo/tablet/foo.jpg
 */
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const imagesDir = path.join(root, 'public', 'images')

const SIZES = [
  { dir: path.join(imagesDir, 'promo', 'mobile'), width: 640, height: 360 },
  { dir: path.join(imagesDir, 'promo', 'tablet'), width: 1024, height: 576 },
]

function mimeFor(name) {
  const ext = path.extname(name).slice(1).toLowerCase()
  if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg'
  if (ext === 'webp') return 'image/webp'
  return 'image/png'
}

const covers = readdirSync(imagesDir).filter((name) => /\.(png|jpe?g|webp)$/i.test(name))
if (!covers.length) {
  console.log('[promo-covers] no covers in public/images')
  process.exit(0)
}

for (const size of SIZES) mkdirSync(size.dir, { recursive: true })

const jobs = covers.flatMap((name) => {
  const stem = name.replace(/\.[^.]+$/, '')
  const dataUrl = `data:${mimeFor(name)};base64,${readFileSync(path.join(imagesDir, name)).toString('base64')}`
  return SIZES.map((size) => ({
    dataUrl,
    to: path.join(size.dir, `${stem}.jpg`),
    width: size.width,
    height: size.height,
  }))
})

const browser = await chromium.launch()
const page = await browser.newPage()

for (const job of jobs) {
  await page.setViewportSize({ width: job.width, height: job.height })
  await page.setContent(
    `<!DOCTYPE html><html><head><style>html,body{margin:0;overflow:hidden}</style></head>
    <body><canvas id="c" width="${job.width}" height="${job.height}"></canvas>
    <script>
      const img = new Image()
      img.onload = () => {
        const ctx = document.getElementById('c').getContext('2d')
        const target = ${job.width} / ${job.height}
        const src = img.width / img.height
        let sx = 0, sy = 0, sw = img.width, sh = img.height
        if (src > target) {
          sw = img.height * target
          sx = (img.width - sw) / 2
        } else {
          sh = img.width / target
          sy = (img.height - sh) / 2
        }
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, ${job.width}, ${job.height})
        window.__jpeg = document.getElementById('c').toDataURL('image/jpeg', 0.82)
      }
      img.src = ${JSON.stringify(job.dataUrl)}
    </script></body></html>`,
    { waitUntil: 'load' },
  )
  const jpeg = await page.waitForFunction(() => window.__jpeg)
  const dataUrl = await jpeg.jsonValue()
  writeFileSync(job.to, Buffer.from(String(dataUrl).split(',')[1], 'base64'))
}

await browser.close()
console.log(`[promo-covers] ${covers.length} covers → mobile 640×360, tablet 1024×576`)
