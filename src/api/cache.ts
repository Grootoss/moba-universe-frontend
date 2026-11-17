const TTL_MS = 60_000

type Entry = { at: number; data: unknown }

const fresh = new Map<string, Entry>()
const pending = new Map<string, Promise<unknown>>()

export function peekCached<T>(key: string): T | undefined {
  const hit = fresh.get(key)
  if (!hit || Date.now() - hit.at >= TTL_MS) return undefined
  return hit.data as T
}

export function cachedJson<T>(url: string): Promise<T> {
  const hit = peekCached<T>(url)
  if (hit !== undefined) return Promise.resolve(hit)
  const existing = pending.get(url)
  if (existing) return existing as Promise<T>
  const task = fetch(url)
    .then((response) => {
      if (!response.ok) throw new Error(url)
      return response.json() as Promise<T>
    })
    .then((data) => {
      fresh.set(url, { at: Date.now(), data })
      pending.delete(url)
      return data
    })
    .catch((error: unknown) => {
      pending.delete(url)
      throw error
    })
  pending.set(url, task)
  return task
}
