import type { ArticleCategory } from '../api/categories'

export const MLBB_CATEGORY_SLUG = 'mlbb'

export const MLBB_CATEGORY: ArticleCategory = {
  slug: MLBB_CATEGORY_SLUG,
  name_ru: 'MLBB',
  name_en: 'MLBB',
}

/** MLBB last; inject if API has not migrated yet. */
export function ensureArticleCategories(categories: ArticleCategory[]): ArticleCategory[] {
  if (!categories.length) return []
  const hasMlbb = categories.some((c) => c.slug === MLBB_CATEGORY_SLUG)
  const merged = hasMlbb ? categories : [...categories, MLBB_CATEGORY]
  const rest = merged.filter((c) => c.slug !== MLBB_CATEGORY_SLUG)
  return [...rest, MLBB_CATEGORY]
}

export function categoryDisplayName(cat: ArticleCategory, lang: string): string {
  if (cat.slug === MLBB_CATEGORY_SLUG) return 'MLBB'
  return lang === 'en' ? cat.name_en : cat.name_ru
}
