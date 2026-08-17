import { copyFileSync, existsSync, mkdirSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const dst = path.join(root, 'public', 'images')
const thumbs = path.join(dst, 'thumbs')

const sources = [
  path.join(root, '..', '.cursor', 'projects', 'c-Projects-moba-universe-be', 'assets'),
  path.join(process.env.HOME || process.env.USERPROFILE || '', '.cursor', 'projects', 'c-Projects-moba-universe-be', 'assets'),
  'C:/Users/Admin/.cursor/projects/c-Projects-moba-universe-be/assets',
]

const files = [
  'mainrole-01.png',
  'minimap-06.png',
  'pool-05.png',
  'replay-04.png',
  'roles-03.png',
  'season-07.png',
  'tilt-08.png',
]

function psLiteral(value) {
  return `'${String(value).replace(/'/g, "''")}'`
}

function writeThumb(from, to) {
  const script = `
Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Image]::FromFile(${psLiteral(from)})
$w = 320
$h = [Math]::Max(1, [int]($img.Height * $w / $img.Width))
$bmp = New-Object System.Drawing.Bitmap $w, $h
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.DrawImage($img, 0, 0, $w, $h)
$bmp.Save(${psLiteral(to)}, [System.Drawing.Imaging.ImageFormat]::Jpeg)
$g.Dispose(); $bmp.Dispose(); $img.Dispose()
`
  execFileSync('powershell', ['-NoProfile', '-Command', script], { stdio: 'ignore' })
}

const srcDir = sources.find((dir) => existsSync(dir))
if (!srcDir) {
  console.error('[copy-covers] Source assets folder not found.')
  process.exit(1)
}

mkdirSync(dst, { recursive: true })
mkdirSync(thumbs, { recursive: true })
for (const file of files) {
  const from = path.join(srcDir, file)
  const to = path.join(dst, file)
  if (!existsSync(from)) {
    console.error(`[copy-covers] Missing: ${from}`)
    process.exit(1)
  }
  copyFileSync(from, to)
  const thumbName = file.replace(/\.[^.]+$/, '.jpg')
  const thumbTo = path.join(thumbs, thumbName)
  try {
    writeThumb(from, thumbTo)
    console.log(`[copy-covers] ${file} + thumb`)
  } catch {
    copyFileSync(from, path.join(thumbs, file))
    console.log(`[copy-covers] ${file} (thumb fallback copy)`)
  }
}

console.log(`[copy-covers] Done → ${dst}`)
