import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { fetchArticlesPage } from '../api/articles'
import { fetchCategories } from '../api/categories'
import ArticleCard from '../components/ArticleCard'
import ErrorState from '../components/ErrorState'
import { usePageTitle } from '../hooks/usePageTitle'
import { useJsonLd } from '../hooks/useJsonLd'
import { usePrerenderReady } from '../hooks/usePrerenderReady'
import { siteOrigin } from '../utils/prerender'
import type { Article, Lang } from '../types/article'
import type { ArticleCategory } from '../api/categories'

const PAGE_SIZE = 6

export default function ArticlesListPage() {
  const { t, i18n } = useTranslation()
  const { lang = 'ru' } = useParams()

  const [articles, setArticles] = useState<Article[]>([])
  const [categories, setCategories] = useState<ArticleCategory[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [query, setQuery] = useState('')
  const [categorySlug, setCategorySlug] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState(false)

  const previews = useMemo(
    () =>
      articles.map((article) => {
        const tr = article.translations[i18n.language as Lang] ?? article.translations.en
        return {
          id_article: article.id_article,
          slug: article.slug,
          title: tr?.title ?? article.slug,
          excerpt: tr?.excerpt || '',
          cover_image: article.cover_image || null,
          updated_at: article.updated_at,
        }
      }),
    [articles, i18n.language],
  )

  const hasMore = articles.length < total

  const emptyMessage = categorySlug ? t('articlesCategoryEmpty') : t('articlesEmpty')

  const listSchema = useMemo(
    () => ({
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: t('articlesTitle'),
      inLanguage: lang,
      url: `${siteOrigin()}/${lang}/evergreen`,
      description: t('articlesSubtitle'),
    }),
    [t, lang],
  )

  usePageTitle(t('articlesTitle'), t('articlesSubtitle'))
  useJsonLd(listSchema)
  usePrerenderReady(!loading)

  const loadFirstPage = async (opts?: { q?: string; category?: string }) => {
    const q = opts?.q ?? query
    const category = opts?.category ?? categorySlug
    setLoading(true)
    setError(false)
    setPage(1)
    try {
      const data = await fetchArticlesPage({ page: 1, pageSize: PAGE_SIZE, q, category })
      setArticles(data.items)
      setTotal(data.total)
    } catch {
      setError(true)
      setArticles([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }

  const loadMore = async () => {
    if (!hasMore || loadingMore) return
    setLoadingMore(true)
    try {
      const next = page + 1
      const data = await fetchArticlesPage({
        page: next,
        pageSize: PAGE_SIZE,
        q: query,
        category: categorySlug,
      })
      setArticles((prev) => [...prev, ...data.items])
      setTotal(data.total)
      setPage(next)
    } catch {
      setError(true)
    } finally {
      setLoadingMore(false)
    }
  }

  useEffect(() => {
    void fetchCategories()
      .then(setCategories)
      .catch(() => setCategories([]))
    void loadFirstPage()
  }, [])

  const queryBootstrapped = useRef(false)
  useEffect(() => {
    if (!queryBootstrapped.current) {
      queryBootstrapped.current = true
      return
    }
    const timer = setTimeout(() => {
      void loadFirstPage()
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  const onCategorySelect = (slug: string) => {
    setCategorySlug(slug)
    void loadFirstPage({ category: slug })
  }

  const categoryLabel = (cat: ArticleCategory) =>
    i18n.language === 'en' ? cat.name_en : cat.name_ru

  return (
    <div className="page">
      <header className="page-header">
        <h1 className="page-header__title">{t('articlesTitle')}</h1>
        <p className="page-header__subtitle">{t('articlesSubtitle')}</p>
      </header>

      <form
        className="articles-search"
        onSubmit={(e) => {
          e.preventDefault()
          void loadFirstPage()
        }}
      >
        <label className="articles-search__label">
          <span className="visually-hidden">{t('articlesSearch')}</span>
          <input
            type="search"
            className="articles-search__input"
            placeholder={t('articlesSearchPlaceholder')}
            autoComplete="off"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <button type="submit" className="btn btn--primary articles-search__btn">
          {t('articlesSearch')}
        </button>
      </form>

      {categories.length ? (
        <nav className="articles-categories" aria-label={t('articlesCategoriesLabel')}>
          <button
            type="button"
            className={`articles-categories__btn${categorySlug === '' ? ' articles-categories__btn--active' : ''}`}
            onClick={() => onCategorySelect('')}
          >
            {t('articlesCategoryAll')}
          </button>
          {categories.map((cat) => (
            <button
              key={cat.slug}
              type="button"
              className={`articles-categories__btn${categorySlug === cat.slug ? ' articles-categories__btn--active' : ''}`}
              onClick={() => onCategorySelect(cat.slug)}
            >
              {categoryLabel(cat)}
            </button>
          ))}
        </nav>
      ) : null}

      {loading ? (
        <div className="state">{t('loading')}</div>
      ) : error ? (
        <ErrorState
          title={t('errorArticlesTitle')}
          description={t('errorArticlesText')}
          actionLabel={t('notFoundAction')}
          actionTo={`/${lang}/evergreen`}
        />
      ) : (
        <>
          {!previews.length ? <p className="state">{emptyMessage}</p> : null}
          <div className="articles-grid">
            {previews.map((article, index) => (
              <ArticleCard
                key={article.id_article}
                slug={article.slug}
                title={article.title}
                excerpt={article.excerpt}
                coverImage={article.cover_image}
                updatedAt={article.updated_at}
                index={index}
              />
            ))}
          </div>
          {hasMore ? (
            <div className="articles-more">
              <button
                type="button"
                className="articles-more__btn"
                disabled={loadingMore}
                onClick={() => void loadMore()}
              >
                {loadingMore ? t('loading') : t('articlesLoadMore')}
              </button>
            </div>
          ) : null}
        </>
      )}
    </div>
  )
}
