/**
 * Center-crop guide covers into smaller 16:9 JPEGs.
 *   public/images/foo.png → public/images/promo/mobile/foo.jpg
 *                         → public/images/promo/tablet/foo.jpg
 *
 * Docker builds keep the committed JPEGs and skip the crop.
 */
import { existsSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const imagesDir = path.join(root, 'public', 'images')

const SIZES = [
  { dir: path.join(imagesDir, 'promo', 'mobile'), width: 640, height: 360 },
  { dir: path.join(imagesDir, 'promo', 'tablet'), width: 1024, height: 576 },
]

const covers = readdirSync(imagesDir).filter((name) => /\.(png|jpe?g|webp)$/i.test(name))
if (!covers.length) {
  console.log('[promo-covers] no covers in public/images')
  process.exit(0)
}

const missing = covers.flatMap((name) => {
  const stem = name.replace(/\.[^.]+$/, '')
  return SIZES.map((size) => path.join(size.dir, `${stem}.jpg`))
}).filter((file) => !existsSync(file))

if (missing.length) {
  console.log(`[promo-covers] skip crop, missing ${missing.length} files (use committed promo JPEGs)`)
} else {
  console.log(`[promo-covers] ${covers.length} covers already in promo/mobile and promo/tablet`)
}
