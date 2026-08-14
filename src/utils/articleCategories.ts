import type { ArticleCategory } from '../api/categories'

export const MLBB_CATEGORY_SLUG = 'mlbb'

/** MLBB last; other categories keep API order. */
export function sortArticleCategories(categories: ArticleCategory[]): ArticleCategory[] {
  const rest = categories.filter((c) => c.slug !== MLBB_CATEGORY_SLUG)
  const mlbb = categories.find((c) => c.slug === MLBB_CATEGORY_SLUG)
  return mlbb ? [...rest, mlbb] : rest
}

export function categoryDisplayName(cat: ArticleCategory, lang: string): string {
  if (cat.slug === MLBB_CATEGORY_SLUG) return 'MLBB'
  return lang === 'en' ? cat.name_en : cat.name_ru
}
