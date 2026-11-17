/**
 * Build the small guide previews from each full cover in public/images.
 *
 *   public/images/foo.png
 *     → public/images/thumbs/foo.jpg            320px wide, list on desktop
 *     → public/images/promo/mobile/foo.jpg      640×360, phones
 *     → public/images/promo/tablet/foo.jpg      1024×576, tablets
 *
 * Existing files are left untouched, so a hand-made thumb is not overwritten.
 * Missing files are cropped with sharp. If nothing is missing, sharp is not loaded.
 */
import { existsSync, mkdirSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const imagesDir = path.join(root, 'public', 'images')
const thumbsDir = path.join(imagesDir, 'thumbs')
const mobileDir = path.join(imagesDir, 'promo', 'mobile')
const tabletDir = path.join(imagesDir, 'promo', 'tablet')

const covers = readdirSync(imagesDir).filter((name) => /\.(png|jpe?g|webp)$/i.test(name))
if (!covers.length) {
  console.log('[promo-covers] no covers in public/images')
  process.exit(0)
}

function jobsFor(name) {
  const stem = name.replace(/\.[^.]+$/, '')
  return [
    { kind: 'thumb', file: path.join(thumbsDir, `${stem}.jpg`) },
    { kind: 'mobile', file: path.join(mobileDir, `${stem}.jpg`) },
    { kind: 'tablet', file: path.join(tabletDir, `${stem}.jpg`) },
  ].map((job) => ({ ...job, source: path.join(imagesDir, name), stem }))
}

const missing = covers.flatMap((name) => jobsFor(name).filter((job) => !existsSync(job.file)))
if (!missing.length) {
  console.log(`[promo-covers] ${covers.length} covers already have thumbs and promo crops`)
  process.exit(0)
}

let sharp
try {
  ;({ default: sharp } = await import('sharp'))
} catch {
  console.error(
    `[promo-covers] ${missing.length} preview files are missing and sharp is not installed. Run npm install.`,
  )
  process.exit(1)
}

mkdirSync(thumbsDir, { recursive: true })
mkdirSync(mobileDir, { recursive: true })
mkdirSync(tabletDir, { recursive: true })

for (const job of missing) {
  const image = sharp(job.source).rotate()
  if (job.kind === 'thumb') {
    await image.resize({ width: 320, withoutEnlargement: true }).jpeg({ quality: 74, mozjpeg: true }).toFile(job.file)
  } else if (job.kind === 'mobile') {
    await image.resize(640, 360, { fit: 'cover', position: 'centre' }).jpeg({ quality: 76, mozjpeg: true }).toFile(job.file)
  } else {
    await image.resize(1024, 576, { fit: 'cover', position: 'centre' }).jpeg({ quality: 76, mozjpeg: true }).toFile(job.file)
  }
  console.log(`[promo-covers] ${path.relative(root, job.file)}`)
}
