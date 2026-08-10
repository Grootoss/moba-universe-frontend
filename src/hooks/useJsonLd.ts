import { useEffect } from 'react'

const SCRIPT_ID = 'seo-json-ld'

function ensureScriptTag(): HTMLScriptElement {
  let el = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null
  if (!el) {
    el = document.createElement('script')
    el.id = SCRIPT_ID
    el.type = 'application/ld+json'
    document.head.appendChild(el)
  }
  return el
}

export function useJsonLd(schema: Record<string, unknown> | null | undefined) {
  useEffect(() => {
    const tag = ensureScriptTag()
    if (!schema) {
      tag.textContent = ''
      return
    }
    tag.textContent = JSON.stringify(schema)
  }, [schema])
}
