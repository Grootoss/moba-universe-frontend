import { cachedJson } from './cache'

export interface ArticleCategory {
  slug: string
  name_ru: string
  name_en: string
}

const API_BASE = '/api/evergreen/categories'

export function fetchCategories(): Promise<ArticleCategory[]> {
  return cachedJson<ArticleCategory[]>(API_BASE)
}
