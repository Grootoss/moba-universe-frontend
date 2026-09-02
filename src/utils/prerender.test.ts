import { describe, expect, it } from 'vitest'
import { PRODUCTION_ORIGIN, canonicalizeOrigin } from './prerender'

describe('canonicalizeOrigin', () => {
  it('collapses www and http to the public apex', () => {
    expect(canonicalizeOrigin('https://www.mobauniverse.com')).toBe(PRODUCTION_ORIGIN)
    expect(canonicalizeOrigin('http://mobauniverse.com/')).toBe(PRODUCTION_ORIGIN)
    expect(canonicalizeOrigin('https://mobauniverse.com')).toBe(PRODUCTION_ORIGIN)
  })

  it('leaves local and unknown origins unchanged', () => {
    expect(canonicalizeOrigin('http://127.0.0.1:5173')).toBe('http://127.0.0.1:5173')
    expect(canonicalizeOrigin('http://localhost:4173/')).toBe('http://localhost:4173')
  })
})
