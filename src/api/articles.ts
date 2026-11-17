import { cachedJson, peekCached } from './cache'
import type { Article, ArticlePreview, ArticlesPage, Lang } from '../types/article'

const API_BASE = '/api/evergreen/articles'
export const GUIDES_LIST_PAGE_SIZE = 40

export function articlesPageUrl(options: {
  lang?: Lang
  page?: number
  pageSize?: number
  q?: string
  category?: string
}): string {
  const params = new URLSearchParams({
    paginated: 'true',
    lang: options.lang === 'en' ? 'en' : 'ru',
    page: String(options.page ?? 1),
    page_size: String(options.pageSize ?? 6),
  })
  const q = options.q?.trim()
  if (q) params.set('q', q)
  const category = options.category?.trim()
  if (category) params.set('category', category)
  return `${API_BASE}?${params}`
}

export function peekArticlesPage(options: {
  lang?: Lang
  page?: number
  pageSize?: number
  q?: string
  category?: string
}): ArticlesPage | undefined {
  return peekCached<ArticlesPage>(articlesPageUrl(options))
}

export function fetchArticlesPage(options: {
  lang?: Lang
  page?: number
  pageSize?: number
  q?: string
  category?: string
}): Promise<ArticlesPage> {
  return cachedJson<ArticlesPage>(articlesPageUrl(options))
}

export async function fetchArticles(lang: Lang = 'ru'): Promise<ArticlePreview[]> {
  const page = await fetchArticlesPage({ lang, page: 1, pageSize: 100 })
  return page.items
}

export async function fetchArticle(slug: string): Promise<Article> {
  const response = await fetch(`${API_BASE}/${slug}`)
  if (!response.ok) {
    throw new Error('Article not found')
  }
  return response.json()
}
