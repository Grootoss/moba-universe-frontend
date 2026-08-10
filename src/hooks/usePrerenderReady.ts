import { useEffect } from 'react'
import { clearPrerenderReady, markPrerenderReady } from '../utils/prerender'

/**
 * Signals Playwright that SEO meta + main content are ready to snapshot.
 * Call with `ready=true` when the page finished loading (success or error UI).
 */
export function usePrerenderReady(ready: boolean) {
  useEffect(() => {
    if (!ready) {
      clearPrerenderReady()
      return
    }
    // Let title/meta effects from the same paint flush first.
    const id = window.setTimeout(() => markPrerenderReady(), 0)
    return () => {
      window.clearTimeout(id)
      clearPrerenderReady()
    }
  }, [ready])
}
