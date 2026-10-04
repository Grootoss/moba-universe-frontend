/**
 * Center-crop guide covers into smaller 16:9 JPEGs.
 *   public/images/foo.png → public/images/promo/mobile/foo.jpg
 *                         → public/images/promo/tablet/foo.jpg
 */
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readdirSync, unlinkSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const imagesDir = path.join(root, 'public', 'images')
const mobileDir = path.join(imagesDir, 'promo', 'mobile')
const tabletDir = path.join(imagesDir, 'promo', 'tablet')

const SIZES = [
  { dir: mobileDir, width: 640, height: 360 },
  { dir: tabletDir, width: 1024, height: 576 },
]

function psLiteral(value) {
  return `'${String(value).replace(/'/g, "''")}'`
}

const covers = readdirSync(imagesDir).filter((name) => /\.(png|jpe?g|webp)$/i.test(name))
if (!covers.length) {
  console.log('[promo-covers] no covers in public/images')
  process.exit(0)
}

for (const size of SIZES) mkdirSync(size.dir, { recursive: true })

const jobs = []
for (const name of covers) {
  const from = path.join(imagesDir, name)
  const stem = name.replace(/\.[^.]+$/, '')
  for (const size of SIZES) {
    jobs.push({ from, to: path.join(size.dir, `${stem}.jpg`), width: size.width, height: size.height })
  }
}

const scriptPath = path.join(root, 'scripts', '.promo-covers.ps1')
const lines = [
  'Add-Type -AssemblyName System.Drawing',
  '$codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq "image/jpeg" }',
  '$enc = New-Object System.Drawing.Imaging.EncoderParameters 1',
  '$enc.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter ([System.Drawing.Imaging.Encoder]::Quality, [long]82)',
]
for (const job of jobs) {
  lines.push(`
$img = [System.Drawing.Image]::FromFile(${psLiteral(job.from)})
$targetRatio = ${job.width} / ${job.height}
$srcRatio = $img.Width / $img.Height
if ($srcRatio -gt $targetRatio) {
  $cropH = $img.Height
  $cropW = [int][Math]::Round($cropH * $targetRatio)
  $x = [int][Math]::Floor(($img.Width - $cropW) / 2)
  $y = 0
} else {
  $cropW = $img.Width
  $cropH = [int][Math]::Round($cropW / $targetRatio)
  $x = 0
  $y = [int][Math]::Floor(($img.Height - $cropH) / 2)
}
$bmp = New-Object System.Drawing.Bitmap ${job.width}, ${job.height}
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$dest = New-Object System.Drawing.Rectangle 0, 0, ${job.width}, ${job.height}
$src = New-Object System.Drawing.Rectangle $x, $y, $cropW, $cropH
$g.DrawImage($img, $dest, $src, [System.Drawing.GraphicsUnit]::Pixel)
$bmp.Save(${psLiteral(job.to)}, $codec, $enc)
$g.Dispose(); $bmp.Dispose(); $img.Dispose()
`)
}
writeFileSync(scriptPath, lines.join('\n'), 'utf8')

if (!existsSync(imagesDir)) {
  console.error('[promo-covers] public/images is missing')
  process.exit(1)
}

try {
  execFileSync('powershell', ['-NoProfile', '-File', scriptPath], { stdio: 'inherit' })
} finally {
  unlinkSync(scriptPath)
}
console.log(`[promo-covers] ${covers.length} covers → mobile 640×360, tablet 1024×576`)
