import { copyFileSync, existsSync, mkdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const dst = path.join(root, 'public', 'images')

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

const srcDir = sources.find((dir) => existsSync(dir))
if (!srcDir) {
  console.error('[copy-covers] Source assets folder not found.')
  process.exit(1)
}

mkdirSync(dst, { recursive: true })
for (const file of files) {
  const from = path.join(srcDir, file)
  const to = path.join(dst, file)
  if (!existsSync(from)) {
    console.error(`[copy-covers] Missing: ${from}`)
    process.exit(1)
  }
  copyFileSync(from, to)
  console.log(`[copy-covers] ${file}`)
}

console.log(`[copy-covers] Done → ${dst}`)
