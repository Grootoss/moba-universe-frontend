import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { formatArticleDate } from '../utils/formatDate'
import { resolveListCoverUrl } from '../utils/mediaUrl'

type Props = {
  slug: string
  title: string
  excerpt?: string
  coverImage?: string | null
  coverThumb?: string | null
  updatedAt?: string | null
  index: number
}

export default function ArticleCard({
  slug,
  title,
  excerpt,
  coverImage,
  coverThumb,
  updatedAt,
  index,
}: Props) {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { lang = i18n.language } = useParams()
  const [thumbFailed, setThumbFailed] = useState(false)

  const updatedLabel = formatArticleDate(updatedAt, lang)
  const coverSrc = thumbFailed ? null : resolveListCoverUrl(coverImage, coverThumb)

  const openArticle = () => {
    void navigate(`/${lang}/evergreen/${slug}`)
  }

  const onKeydown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      openArticle()
    }
  }

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
          <img
            src={coverSrc}
            alt=""
            width={224}
            height={126}
            loading="lazy"
            decoding="async"
            onError={() => setThumbFailed(true)}
          />
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
