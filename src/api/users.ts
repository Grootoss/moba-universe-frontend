import { cachedJson, peekCached } from './cache'
import type { PublicProfile } from '../types/profile'

const USERS_URL = '/api/users'

export function peekPublicUsers(): PublicProfile[] | undefined {
  return peekCached<PublicProfile[]>(USERS_URL)
}

export function fetchPublicUsers(): Promise<PublicProfile[]> {
  return cachedJson<PublicProfile[]>(USERS_URL)
}
