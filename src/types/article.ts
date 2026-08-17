export type Lang = 'ru' | 'en'

export interface ArticleTranslation {
  title: string
  excerpt?: string
  text: string
  mlbb_example?: string
}

export interface Article {
  id_article: number
  slug: string
  category?: string | null
  cover_image?: string | null
  cover_thumb?: string | null
  translations: Record<Lang, ArticleTranslation>
  created_at?: string | null
  updated_at?: string | null
}

export interface ArticlePreview {
  id_article: number
  slug: string
  title: string
  excerpt?: string
  cover_image?: string | null
  cover_thumb?: string | null
  created_at?: string | null
  updated_at?: string | null
}

export interface ArticlesPage {
  items: Article[]
  total: number
  page: number
  page_size: number
}
