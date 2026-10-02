import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { fetchArticle, fetchArticlesPage } from '../api/articles'
import ErrorState from '../components/ErrorState'
import FadeImage from '../components/FadeImage'
import { usePageTitle } from '../hooks/usePageTitle'
import { useJsonLd } from '../hooks/useJsonLd'
import { usePrerenderReady } from '../hooks/usePrerenderReady'
import { formatArticleDate } from '../utils/formatDate'
import { isPrerender, siteOrigin } from '../utils/prerender'
import { absoluteMediaUrl, resolveMediaUrl } from '../utils/mediaUrl'
import type { Article, ArticlePreview, Lang } from '../types/article'

function readBoot(slug: string): { article: Article; related: ArticlePreview[] } | null {
  const el = document.getElementById('__BOOT__')
  if (!el?.textContent) return null
  try {
    const data = JSON.parse(el.textContent) as {
      slug?: string
      article?: Article
      related?: ArticlePreview[]
    }
    if (data.slug !== slug || !data.article) return null
    return { article: data.article, related: data.related ?? [] }
  } catch {
    return null
  }
}

export default function ArticlePage() {
  const { t, i18n } = useTranslation()
  const { lang = 'ru', slug = '' } = useParams()

  const boot = readBoot(slug)
  const [article, setArticle] = useState<Article | null>(boot?.article ?? null)
  const [related, setRelated] = useState<ArticlePreview[]>(boot?.related ?? [])
  const [loading, setLoading] = useState(!boot)
  const [error, setError] = useState(false)

  const translation = useMemo(() => {
    if (!article) return null
    const currentLang = i18n.language as Lang
    return article.translations[currentLang] ?? article.translations.en
  }, [article, i18n.language])

  const relatedPreviews = related

  const createdLabel = formatArticleDate(article?.created_at, lang)
  const updatedLabel = formatArticleDate(article?.updated_at, lang)

  const coverSrc = resolveMediaUrl(article?.cover_image)

  const articleSchema = useMemo(() => {
    if (!article || !translation) return null
    const url = `${siteOrigin()}/${lang}/evergreen/${article.slug}`
    const home = `${siteOrigin()}/${lang}`
    const guides = `${home}/evergreen`
    return {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'BlogPosting',
          headline: translation.title,
          description: translation.excerpt?.trim() || translation.title,
          inLanguage: lang,
          mainEntityOfPage: { '@type': 'WebPage', '@id': url },
          url,
          datePublished: article.created_at || undefined,
          dateModified: article.updated_at || article.created_at || undefined,
          image: absoluteMediaUrl(article.cover_image) || undefined,
          author: { '@type': 'Organization', name: 'Moba Universe' },
          publisher: { '@type': 'Organization', name: 'Moba Universe' },
        },
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: t('navHome'), item: home },
            { '@type': 'ListItem', position: 2, name: t('navGuides'), item: guides },
            { '@type': 'ListItem', position: 3, name: translation.title, item: url },
          ],
        },
      ],
    }
  }, [article, translation, lang, t])

  useJsonLd(articleSchema)

  usePageTitle(
    translation?.title || (error ? t('errorArticleTitle') : undefined),
    translation ? translation.excerpt?.trim() || translation.title : error ? t('errorArticleText') : undefined,
    article?.cover_image || undefined,
    'article',
  )
  usePrerenderReady(!loading)

  useEffect(() => {
    if (!isPrerender() || !article) return
    window.__PRERENDER_BOOT__ = { slug: article.slug, article, related }
  }, [article, related])

  useEffect(() => {
    const boot = readBoot(slug)
    let cancelled = false
    if (boot) {
      setArticle(boot.article)
      setRelated(boot.related)
      setError(false)
      setLoading(false)
    } else {
      setLoading(true)
      setError(false)
      setArticle(null)
    }
    const load = async () => {
      try {
        const current = boot?.article ?? (await fetchArticle(slug))
        if (cancelled) return
        if (!boot) setArticle(current)
        const all = await fetchArticlesPage({
          lang: lang === 'en' ? 'en' : 'ru',
          page: 1,
          pageSize: 12,
        })
        if (cancelled) return
        setRelated(all.items.filter((item) => item.slug !== current.slug).slice(0, 3))
      } catch {
        if (cancelled || boot) return
        setError(true)
        setRelated([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [slug, lang])

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
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <Link to={`/${lang}`}>{t('navHome')}</Link>
        <span aria-hidden="true"> / </span>
        <Link to={`/${lang}/evergreen`}>{t('navGuides')}</Link>
        <span aria-hidden="true"> / </span>
        <span>{translation.title}</span>
      </nav>
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
          {coverSrc ? (
            <figure className="article__cover">
              <FadeImage
                src={coverSrc}
                alt={translation.title}
                width={1200}
                height={675}
                loading="eager"
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
                {item.excerpt?.trim() ? <p className="article-related__excerpt">{item.excerpt}</p> : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  )
}
