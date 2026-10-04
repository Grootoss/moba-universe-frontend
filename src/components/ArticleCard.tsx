import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import FadeImage from './FadeImage'
import { formatArticleDate } from '../utils/formatDate'
import { resolveListCoverUrl, resolvePromoCoverUrl } from '../utils/mediaUrl'

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
  const { lang = i18n.language } = useParams()
  const [thumbFailed, setThumbFailed] = useState(false)

  const updatedLabel = formatArticleDate(updatedAt, lang)
  const coverSrc = thumbFailed ? null : resolveListCoverUrl(coverImage, coverThumb)

  return (
    <article className="article-card">
      <Link className="article-card__anchor" to={`/${lang}/evergreen/${slug}`}>
        {coverSrc ? (
          <div className="article-card__cover">
            <FadeImage
              src={coverSrc}
              width={224}
              height={126}
              loading={index < 12 ? 'eager' : 'lazy'}
              fetchPriority={index < 4 ? 'high' : 'auto'}
              sources={[
                { media: '(max-width: 767px)', src: resolvePromoCoverUrl(coverImage, 'mobile') || '' },
                { media: '(max-width: 1023px)', src: resolvePromoCoverUrl(coverImage, 'tablet') || '' },
              ]}
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
          <span className="article-card__more">{t('readMore')} →</span>
        </div>
      </Link>
    </article>
  )
}
