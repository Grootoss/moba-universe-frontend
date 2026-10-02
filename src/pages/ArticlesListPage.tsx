import { useEffect, useMemo, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { fetchArticlesPage } from '../api/articles'
import { fetchCategories } from '../api/categories'
import ArticleCard from '../components/ArticleCard'
import ErrorState from '../components/ErrorState'
import { usePageTitle } from '../hooks/usePageTitle'
import { useJsonLd } from '../hooks/useJsonLd'
import { usePrerenderReady } from '../hooks/usePrerenderReady'
import { categoryDisplayName, ensureArticleCategories } from '../utils/articleCategories'
import { siteOrigin } from '../utils/prerender'
import type { ArticlePreview } from '../types/article'
import type { ArticleCategory } from '../api/categories'

const PAGE_SIZE = 40
const TAG_SKELETON_COUNT = 10

export default function ArticlesListPage() {
  const { t, i18n } = useTranslation()
  const { lang = 'ru' } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()

  const categorySlug = (searchParams.get('category') ?? '').trim()

  const [articles, setArticles] = useState<ArticlePreview[]>([])
  const [categories, setCategories] = useState<ArticleCategory[]>([])
  const [categoriesReady, setCategoriesReady] = useState(false)
  const [query, setQuery] = useState('')
  const [listReady, setListReady] = useState(false)
  const [error, setError] = useState(false)

  const sortedCategories = useMemo(() => ensureArticleCategories(categories), [categories])

  const previews = articles

  const emptyMessage = categorySlug ? t('articlesCategoryEmpty') : t('articlesEmpty')
  const showTagSkeleton = error || !categoriesReady

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
  usePrerenderReady(listReady && categoriesReady)

  useEffect(() => {
    let cancelled = false
    void fetchCategories()
      .then((rows) => {
        if (!cancelled) setCategories(rows)
      })
      .catch(() => {
        if (!cancelled) setCategories([])
      })
      .finally(() => {
        if (!cancelled) setCategoriesReady(true)
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    setListReady(false)
    setError(false)

    const run = async () => {
      try {
        const data = await fetchArticlesPage({
          lang: lang === 'en' ? 'en' : 'ru',
          page: 1,
          pageSize: PAGE_SIZE,
          q: query,
          category: categorySlug,
        })
        if (cancelled) return
        setArticles(data.items)
      } catch {
        if (cancelled) return
        setError(true)
        setArticles([])
      } finally {
        if (!cancelled) setListReady(true)
      }
    }

    const delay = query.trim() ? 300 : 0
    const timer = window.setTimeout(() => {
      void run()
    }, delay)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [query, categorySlug, lang])

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

      <nav className="articles-categories" aria-label={t('articlesCategoriesLabel')}>
        {showTagSkeleton ? (
          Array.from({ length: TAG_SKELETON_COUNT }, (_, i) => (
            <span key={i} className="articles-categories__skeleton" aria-hidden="true" />
          ))
        ) : (
          <>
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
          </>
        )}
      </nav>

      {error ? (
        <ErrorState
          title={t('errorArticlesTitle')}
          description={t('errorArticlesText')}
          actionLabel={t('notFoundAction')}
          actionTo={`/${lang}/evergreen`}
        />
      ) : (
        <>
          {listReady && !previews.length ? <p className="state">{emptyMessage}</p> : null}
          <div className="articles-grid">
            {previews.map((article, index) => (
              <ArticleCard
                key={article.id_article}
                slug={article.slug}
                title={article.title}
                excerpt={article.excerpt || ''}
                coverImage={article.cover_image}
                coverThumb={article.cover_thumb}
                updatedAt={article.updated_at}
                index={index}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
