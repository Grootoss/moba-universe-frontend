import type { ProfileOptions, RoleOption } from '../types/profile'

export const GENERIC_ROLES: RoleOption[] = [
  { slug: '1', number: 1, name_ru: 'Роль 1', name_en: 'Role 1' },
  { slug: '2', number: 2, name_ru: 'Роль 2', name_en: 'Role 2' },
  { slug: '3', number: 3, name_ru: 'Роль 3', name_en: 'Role 3' },
  { slug: '4', number: 4, name_ru: 'Роль 4', name_en: 'Role 4' },
  { slug: '5', number: 5, name_ru: 'Роль 5', name_en: 'Role 5' },
]

export const GAME_ROLES: Record<string, RoleOption[]> = {
  mlbb: [
    { slug: '1', number: 1, name_ru: '1 · Эксп', name_en: '1 · Exp' },
    { slug: '2', number: 2, name_ru: '2 · Лес', name_en: '2 · Jungle' },
    { slug: '3', number: 3, name_ru: '3 · Мид', name_en: '3 · Mid' },
    { slug: '4', number: 4, name_ru: '4 · Золото', name_en: '4 · Gold' },
    { slug: '5', number: 5, name_ru: '5 · Роум', name_en: '5 · Roam' },
  ],
  lol: [
    { slug: '1', number: 1, name_ru: '1 · Топ', name_en: '1 · Top' },
    { slug: '2', number: 2, name_ru: '2 · Лес', name_en: '2 · Jungle' },
    { slug: '3', number: 3, name_ru: '3 · Мид', name_en: '3 · Mid' },
    { slug: '4', number: 4, name_ru: '4 · АДК', name_en: '4 · ADC' },
    { slug: '5', number: 5, name_ru: '5 · Поддержка', name_en: '5 · Support' },
  ],
  wildrift: [
    { slug: '1', number: 1, name_ru: '1 · Топ', name_en: '1 · Top' },
    { slug: '2', number: 2, name_ru: '2 · Лес', name_en: '2 · Jungle' },
    { slug: '3', number: 3, name_ru: '3 · Мид', name_en: '3 · Mid' },
    { slug: '4', number: 4, name_ru: '4 · АДК', name_en: '4 · ADC' },
    { slug: '5', number: 5, name_ru: '5 · Поддержка', name_en: '5 · Support' },
  ],
  dota2: [
    { slug: '1', number: 1, name_ru: '1 · Керри', name_en: '1 · Carry' },
    { slug: '2', number: 2, name_ru: '2 · Мид', name_en: '2 · Mid' },
    { slug: '3', number: 3, name_ru: '3 · Сложная', name_en: '3 · Offlane' },
    { slug: '4', number: 4, name_ru: '4 · Частичная поддержка', name_en: '4 · Soft support' },
    { slug: '5', number: 5, name_ru: '5 · Полная поддержка', name_en: '5 · Hard support' },
  ],
  aov: [
    { slug: '1', number: 1, name_ru: '1 · Дарк Слейер', name_en: '1 · Dark Slayer' },
    { slug: '2', number: 2, name_ru: '2 · Лес', name_en: '2 · Jungle' },
    { slug: '3', number: 3, name_ru: '3 · Мид', name_en: '3 · Mid' },
    { slug: '4', number: 4, name_ru: '4 · Эбиссл', name_en: '4 · Abyssal' },
    { slug: '5', number: 5, name_ru: '5 · Роум', name_en: '5 · Roam' },
  ],
  hok: [
    { slug: '1', number: 1, name_ru: '1 · Клэш', name_en: '1 · Clash' },
    { slug: '2', number: 2, name_ru: '2 · Лес', name_en: '2 · Jungle' },
    { slug: '3', number: 3, name_ru: '3 · Мид', name_en: '3 · Mid' },
    { slug: '4', number: 4, name_ru: '4 · Фарм', name_en: '4 · Farm' },
    { slug: '5', number: 5, name_ru: '5 · Роум', name_en: '5 · Roam' },
  ],
  smite: [
    { slug: '1', number: 1, name_ru: '1 · Соло', name_en: '1 · Solo' },
    { slug: '2', number: 2, name_ru: '2 · Лес', name_en: '2 · Jungle' },
    { slug: '3', number: 3, name_ru: '3 · Мид', name_en: '3 · Mid' },
    { slug: '4', number: 4, name_ru: '4 · Керри', name_en: '4 · Carry' },
    { slug: '5', number: 5, name_ru: '5 · Поддержка', name_en: '5 · Support' },
  ],
}

export function rolesForGame(game: string, options?: ProfileOptions | null): RoleOption[] {
  const fromApi = options?.roles?.[game]
  if (fromApi?.length) return fromApi
  return GAME_ROLES[game] || GENERIC_ROLES
}

export function roleLabel(game: string, slug: string, lang: string, options?: ProfileOptions | null): string {
  const opt = rolesForGame(game, options).find((r) => r.slug === slug)
  if (!opt) return slug
  return lang === 'ru' ? opt.name_ru : opt.name_en
}
