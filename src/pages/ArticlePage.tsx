import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { fetchArticle, fetchArticlesPage } from '../api/articles'
import ErrorState from '../components/ErrorState'
import { usePageTitle } from '../hooks/usePageTitle'
import { useJsonLd } from '../hooks/useJsonLd'
import { usePrerenderReady } from '../hooks/usePrerenderReady'
import { formatArticleDate } from '../utils/formatDate'
import { siteOrigin } from '../utils/prerender'
import type { Article, Lang } from '../types/article'

export default function ArticlePage() {
  const { t, i18n } = useTranslation()
  const { lang = 'ru', slug = '' } = useParams()

  const [article, setArticle] = useState<Article | null>(null)
  const [related, setRelated] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const translation = useMemo(() => {
    if (!article) return null
    const currentLang = i18n.language as Lang
    return article.translations[currentLang] ?? article.translations.en
  }, [article, i18n.language])

  const relatedPreviews = useMemo(
    () =>
      related.map((item) => {
        const tr = item.translations[i18n.language as Lang] ?? item.translations.en
        return {
          slug: item.slug,
          title: tr?.title ?? item.slug,
          excerpt: tr?.excerpt?.trim() || '',
        }
      }),
    [related, i18n.language],
  )

  const createdLabel = formatArticleDate(article?.created_at, lang)
  const updatedLabel = formatArticleDate(article?.updated_at, lang)

  const articleSchema = useMemo(() => {
    if (!article || !translation) return null
    const url = `${siteOrigin()}/${lang}/evergreen/${article.slug}`
    return {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: translation.title,
      description: translation.excerpt?.trim() || translation.title,
      inLanguage: lang,
      mainEntityOfPage: { '@type': 'WebPage', '@id': url },
      url,
      datePublished: article.created_at || undefined,
      dateModified: article.updated_at || article.created_at || undefined,
      image: article.cover_image
        ? article.cover_image.startsWith('http')
          ? article.cover_image
          : `${siteOrigin()}${article.cover_image.startsWith('/') ? '' : '/'}${article.cover_image}`
        : undefined,
      publisher: { '@type': 'Organization', name: 'Moba Universe' },
    }
  }, [article, translation, lang])

  useJsonLd(articleSchema)

  usePageTitle(
    loading ? t('loading') : error || !translation ? t('errorArticleTitle') : translation.title,
    !translation ? t('errorArticleText') : translation.excerpt?.trim() || translation.title,
    article?.cover_image || undefined,
  )
  usePrerenderReady(!loading)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(false)
      setArticle(null)
      try {
        const current = await fetchArticle(slug)
        setArticle(current)
        const all = await fetchArticlesPage({ page: 1, pageSize: 24 })
        setRelated(all.items.filter((item) => item.slug !== current.slug).slice(0, 3))
      } catch {
        setError(true)
        setRelated([])
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [slug])

  if (loading) return <div className="page"><div className="state">{t('loading')}</div></div>

  if (error || !article || !translation) {
    return (
      <div className="page">
        <ErrorState
          code="404"
          title={t('errorArticleTitle')}
          description={t('errorArticleText')}
          actionLabel={t('notFoundAction')}
          actionTo={`/${lang}/evergreen`}
        />
      </div>
    )
  }

  return (
    <div className="page">
      <Link to={`/${lang}/evergreen`} className="back-link">
        {t('backToArticles')}
      </Link>
      <article className="article">
        <header className="article__header">
          <h1 className="article__title">{translation.title}</h1>
          {(createdLabel || updatedLabel) ? (
            <p className="article__meta">
              {createdLabel ? (
                <span>
                  {t('articleCreated')}: {createdLabel}
                </span>
              ) : null}
              {createdLabel && updatedLabel ? <span className="article__meta-sep"> · </span> : null}
              {updatedLabel ? (
                <span>
                  {t('articleUpdated')}: {updatedLabel}
                </span>
              ) : null}
            </p>
          ) : null}
          {article.cover_image ? (
            <figure className="article__cover">
              <img
                src={article.cover_image}
                alt={translation.title}
                width={1200}
                height={675}
                decoding="async"
                fetchPriority="high"
              />
            </figure>
          ) : null}
        </header>
        <div className="article__content prose" dangerouslySetInnerHTML={{ __html: translation.text }} />
        {translation.mlbb_example?.trim() ? (
          <section className="article__mlbb">
            <h2 className="article__mlbb-title">{t('articleMlbbExampleTitle')}</h2>
            <div
              className="article__mlbb-content prose"
              dangerouslySetInnerHTML={{ __html: translation.mlbb_example }}
            />
          </section>
        ) : null}
      </article>

      {relatedPreviews.length ? (
        <section className="article-related">
          <h2 className="article-related__title">
            {i18n.language === 'ru' ? 'Похожие статьи' : 'Related Articles'}
          </h2>
          <ul className="article-related__list">
            {relatedPreviews.map((item) => (
              <li key={item.slug}>
                <Link to={`/${lang}/evergreen/${item.slug}`}>{item.title}</Link>
                {item.excerpt ? <p className="article-related__excerpt">{item.excerpt}</p> : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  )
}
