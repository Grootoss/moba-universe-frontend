import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { formatArticleDate } from '../utils/formatDate'
import { resolveMediaUrl } from '../utils/mediaUrl'

type Props = {
  slug: string
  title: string
  excerpt?: string
  coverImage?: string | null
  updatedAt?: string | null
  index: number
}

export default function ArticleCard({ slug, title, excerpt, coverImage, updatedAt, index }: Props) {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { lang = i18n.language } = useParams()

  const updatedLabel = formatArticleDate(updatedAt, lang)

  const openArticle = () => {
    void navigate(`/${lang}/evergreen/${slug}`)
  }

  const onKeydown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      openArticle()
    }
  }

  const coverSrc = resolveMediaUrl(coverImage)

  return (
    <article
      className="article-card"
      role="link"
      tabIndex={0}
      aria-label={title}
      onClick={openArticle}
      onKeyDown={onKeydown}
    >
      {coverSrc ? (
        <div className="article-card__cover">
          <img src={coverSrc} alt={title} loading="lazy" />
        </div>
      ) : (
        <span className="article-card__num" aria-hidden="true">
          {String(index + 1).padStart(2, '0')}
        </span>
      )}
      <div className="article-card__body">
        <h2 className="article-card__title">{title}</h2>
        {excerpt ? <p className="article-card__excerpt">{excerpt}</p> : null}
        {updatedLabel ? (
          <p className="article-card__date">
            {t('articleUpdated')}: {updatedLabel}
          </p>
        ) : null}
        <span className="article-card__link">{t('readMore')} →</span>
      </div>
    </article>
  )
}
