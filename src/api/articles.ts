import type { Article, ArticlesPage } from '../types/article'

const API_BASE = '/api/evergreen/articles'

export async function fetchArticlesPage(options: {
  page?: number
  pageSize?: number
  q?: string
}): Promise<ArticlesPage> {
  const params = new URLSearchParams({
    paginated: 'true',
    page: String(options.page ?? 1),
    page_size: String(options.pageSize ?? 6),
  })
  const q = options.q?.trim()
  if (q) params.set('q', q)

  const response = await fetch(`${API_BASE}?${params}`)
  if (!response.ok) {
    throw new Error('Failed to load articles')
  }
  return response.json()
}

export async function fetchArticles(): Promise<Article[]> {
  const page = await fetchArticlesPage({ page: 1, pageSize: 100 })
  return page.items
}

export async function fetchArticle(slug: string): Promise<Article> {
  const response = await fetch(`${API_BASE}/${slug}`)
  if (!response.ok) {
    throw new Error('Article not found')
  }
  return response.json()
}
