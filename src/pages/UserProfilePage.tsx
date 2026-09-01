import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { fetchPublicProfile } from '../api/admin'
import ErrorState from '../components/ErrorState'
import { usePageTitle } from '../hooks/usePageTitle'
import { useJsonLd } from '../hooks/useJsonLd'
import { usePrerenderReady } from '../hooks/usePrerenderReady'
import { siteOrigin } from '../utils/prerender'
import { gameLabel } from '../utils/gameLabels'
import type { PublicProfile } from '../types/profile'

export default function UserProfilePage() {
  const { t } = useTranslation()
  const { lang = 'ru', id = '' } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [profile, setProfile] = useState<PublicProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const userId = Number(id)
  const isApproved = profile?.moderation_status === 'approved'
  const showPreviewBanner = Boolean(profile) && !isApproved
  const usersBackTo = `/${lang}/users`

  const profileSchema = useMemo(() => {
    if (!profile || !isApproved) return null
    const url = `${siteOrigin()}/${lang}/user/${profile.user_id}`
    return {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: profile.nickname,
      description: profile.bio?.trim() || '',
      url,
    }
  }, [profile, isApproved, lang])

  usePageTitle(
    profile ? profile.nickname : t('profileTitle'),
    profile ? profile.bio?.trim() || `${profile.nickname} — ${t('profileEyebrow')}` : t('profileNotFoundText'),
  )
  useJsonLd(profileSchema)
  usePrerenderReady(!loading)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(false)
      setProfile(null)
      if (!Number.isFinite(userId) || userId <= 0) {
        setError(true)
        setLoading(false)
        return
      }
      try {
        const data = await fetchPublicProfile(userId)
        setProfile(data)
        if (data.moderation_status === 'approved' && searchParams.get('preview') === '1') {
          const next = new URLSearchParams(searchParams)
          next.delete('preview')
          void navigate({ pathname: `/${lang}/user/${userId}`, search: next.toString() ? `?${next}` : '' }, { replace: true })
        }
      } catch {
        setError(true)
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [userId, lang, navigate, searchParams])

  if (loading) {
    return (
      <div className="page profile-page">
        <Link to={usersBackTo} className="back-link">
          {t('backToUsers')}
        </Link>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="page profile-page">
        <ErrorState
          title={t('profileNotFoundTitle')}
          description={t('profileNotFoundText')}
          actionLabel={t('backToUsers')}
          actionTo={usersBackTo}
        />
      </div>
    )
  }

  return (
    <div className="page profile-page">
      <Link to={usersBackTo} className="back-link">
        {t('backToUsers')}
      </Link>
      {showPreviewBanner ? (
        <p className="cabinet__banner cabinet__banner--pending">{t('cabinetPreviewBanner')}</p>
      ) : null}
      <header className="page-header">
        <p className="page-header__eyebrow">{t('profileEyebrow')}</p>
        <h1 className="page-header__title">{profile.nickname}</h1>
        <p className="page-header__subtitle">ID {profile.user_id}</p>
      </header>

      <section className="profile-bio">
        <h2 className="profile-section__title">{t('profileBio')}</h2>
        <p className="profile-bio__text">{profile.bio}</p>
      </section>

      {profile.games.length ? (
        <section className="profile-games">
          <h2 className="profile-section__title">{t('profileGames')}</h2>
          <div className="profile-games__grid">
            {profile.games.map((g) => (
              <article key={g.game} className="profile-game-block">
                <h3 className="profile-game-block__game">{gameLabel(g.game)}</h3>
                <p className="profile-game-block__rank">{g.rank || '—'}</p>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  )
}
