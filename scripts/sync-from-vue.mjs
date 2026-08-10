import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const oldSrc = path.resolve(root, '..', 'moba-universe-fe-old', 'src')

const copies = [
  ['content/privacy.ts', 'content/privacy.ts'],
  ['locales/ru.json', 'locales/ru.json'],
  ['locales/en.json', 'locales/en.json'],
  ['assets/styles/global.css', 'styles/global.css'],
]

if (!fs.existsSync(oldSrc)) {
  const missing = copies.filter(([, to]) => !fs.existsSync(path.join(root, 'src', to)))
  if (missing.length) {
    console.warn(
      'moba-universe-fe-old not found; copy these manually:',
      missing.map(([, to]) => to).join(', '),
    )
    process.exit(1)
  }
  console.log('sync skipped (assets already present)')
  process.exit(0)
}

for (const [from, to] of copies) {
  const src = path.join(oldSrc, from)
  const dst = path.join(root, 'src', to)
  fs.mkdirSync(path.dirname(dst), { recursive: true })
  let text = fs.readFileSync(src, 'utf8')
  if (to === 'styles/global.css') {
    text = text.replace('#app {', '#root,#app {')
    if (!text.includes('--muted:')) {
      text = text.replace('--text-faint:', '--muted: var(--text-faint);\n  --text-faint:')
    }
    const related = `

.article-related {
  margin-top: 2.5rem;
  padding-top: 2rem;
  border-top: 1px solid var(--border);
}
.article-related__title {
  font-family: 'Outfit', sans-serif;
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 1rem;
}
.article-related__list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.article-related__list a {
  font-weight: 600;
  color: var(--prose-link);
  text-decoration: underline;
  text-underline-offset: 3px;
}
.article-related__excerpt {
  margin: 0.35rem 0 0;
  font-size: 0.9375rem;
  color: var(--text-muted);
  line-height: 1.4;
}
`
    if (!text.includes('.article-related')) text += related
  }
  fs.writeFileSync(dst, text)
  console.log('copied', to)
}

console.log('done')
