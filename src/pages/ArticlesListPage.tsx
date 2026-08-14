import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { fetchArticlesPage } from '../api/articles'
import { fetchCategories } from '../api/categories'
import ArticleCard from '../components/ArticleCard'
import ErrorState from '../components/ErrorState'
import { usePageTitle } from '../hooks/usePageTitle'
import { useJsonLd } from '../hooks/useJsonLd'
import { usePrerenderReady } from '../hooks/usePrerenderReady'
import { categoryDisplayName, sortArticleCategories } from '../utils/articleCategories'
import { siteOrigin } from '../utils/prerender'
import type { Article, Lang } from '../types/article'
import type { ArticleCategory } from '../api/categories'

const PAGE_SIZE = 6

export default function ArticlesListPage() {
  const { t, i18n } = useTranslation()
  const { lang = 'ru' } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()

  const categorySlug = (searchParams.get('category') ?? '').trim()

  const [articles, setArticles] = useState<Article[]>([])
  const [categories, setCategories] = useState<ArticleCategory[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState(false)

  const sortedCategories = useMemo(() => sortArticleCategories(categories), [categories])

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

  const listUrl = useMemo(() => {
    const base = `${siteOrigin()}/${lang}/evergreen`
    if (!categorySlug) return base
    return `${base}?category=${encodeURIComponent(categorySlug)}`
  }, [lang, categorySlug])

  const listSchema = useMemo(
    () => ({
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: t('articlesTitle'),
      inLanguage: lang,
      url: listUrl,
      description: t('articlesSubtitle'),
    }),
    [t, lang, listUrl],
  )

  usePageTitle(t('articlesTitle'), t('articlesSubtitle'))
  useJsonLd(listSchema)
  usePrerenderReady(!loading)

  const loadFirstPage = useCallback(
    async (opts?: { q?: string; category?: string }) => {
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
    },
    [query, categorySlug],
  )

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
  }, [])

  useEffect(() => {
    void loadFirstPage({ category: categorySlug })
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reload list when URL category changes
  }, [categorySlug])

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
  }, [query, loadFirstPage])

  const onCategorySelect = (slug: string) => {
    const next = new URLSearchParams(searchParams)
    if (slug) next.set('category', slug)
    else next.delete('category')
    setSearchParams(next, { replace: true })
  }

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

      {sortedCategories.length ? (
        <nav className="articles-categories" aria-label={t('articlesCategoriesLabel')}>
          <button
            type="button"
            className={`articles-categories__btn${categorySlug === '' ? ' articles-categories__btn--active' : ''}`}
            onClick={() => onCategorySelect('')}
          >
            {t('articlesCategoryAll')}
          </button>
          {sortedCategories.map((cat) => (
            <button
              key={cat.slug}
              type="button"
              className={`articles-categories__btn${cat.slug === 'mlbb' ? ' articles-categories__btn--mlbb' : ''}${categorySlug === cat.slug ? ' articles-categories__btn--active' : ''}`}
              onClick={() => onCategorySelect(cat.slug)}
            >
              {categoryDisplayName(cat, i18n.language)}
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
