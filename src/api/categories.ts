export interface ArticleCategory {
  slug: string
  name_ru: string
  name_en: string
}

const API_BASE = '/api/evergreen/categories'

export async function fetchCategories(): Promise<ArticleCategory[]> {
  const response = await fetch(API_BASE)
  if (!response.ok) {
    throw new Error('Failed to load categories')
  }
  return response.json()
}
