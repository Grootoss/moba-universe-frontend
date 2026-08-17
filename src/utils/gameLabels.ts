export const GAME_LABELS: Record<string, string> = {
  mlbb: 'Mobile Legends',
  lol: 'LoL',
  wildrift: 'Wild Rift',
  dota2: 'Dota 2',
  aov: 'AoV',
  hok: 'Honor of Kings',
  smite: 'Smite',
}

export function gameLabel(slug: string): string {
  return GAME_LABELS[slug] || slug.toUpperCase()
}
