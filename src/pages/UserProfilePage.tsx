import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { fetchPublicProfile } from '../api/admin'
import ErrorState from '../components/ErrorState'
import { usePageTitle } from '../hooks/usePageTitle'
import { useJsonLd } from '../hooks/useJsonLd'
import { usePrerenderReady } from '../hooks/usePrerenderReady'
import { siteOrigin } from '../utils/prerender'
import type { PublicProfile } from '../types/profile'

const GAME_LABELS: Record<string, string> = {
  mlbb: 'Mobile Legends',
  lol: 'LoL',
  wildrift: 'Wild Rift',
  dota2: 'Dota 2',
  aov: 'AoV',
  hok: 'Honor of Kings',
  smite: 'Smite',
}

function safeHttpUrl(url: string | null | undefined): string | null {
  if (!url) return null
  const s = url.trim()
  return /^https?:\/\//i.test(s) ? s : null
}

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

  const profileSchema = useMemo(() => {
    if (!profile || !isApproved) return null
    const url = `${siteOrigin()}/${lang}/user/${profile.user_id}`
    return {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: profile.nickname,
      description: profile.bio?.trim() || '',
      url,
      sameAs: [
        safeHttpUrl(profile.telegram_url),
        ...Object.values(profile.social_links || {}).map((s) => safeHttpUrl(s)),
      ].filter(Boolean),
    }
  }, [profile, isApproved, lang])

  usePageTitle(
    profile ? profile.nickname : t('profileTitle'),
    profile ? profile.bio?.trim() || `${profile.nickname} — ${t('profileEyebrow')}` : t('profileNotFoundText'),
  )
  useJsonLd(profileSchema)
  usePrerenderReady(!loading)

  const socialEntries = useMemo(() => {
    if (!profile) return []
    return Object.entries(profile.social_links || {}).filter(([, url]) => Boolean(safeHttpUrl(url)))
  }, [profile])

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

  if (loading) return <div className="page profile-page"><div className="state">{t('loading')}</div></div>

  if (error || !profile) {
    return (
      <div className="page profile-page">
        <ErrorState
          title={t('profileNotFoundTitle')}
          description={t('profileNotFoundText')}
          actionLabel={t('notFoundAction')}
          actionTo={`/${lang}/mlbb`}
        />
      </div>
    )
  }

  return (
    <div className="page profile-page">
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
                <h3 className="profile-game-block__game">{GAME_LABELS[g.game] || g.game.toUpperCase()}</h3>
                <p className="profile-game-block__rank">{g.rank || '—'}</p>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {safeHttpUrl(profile.telegram_url) || socialEntries.length ? (
        <section className="profile-links">
          <h2 className="profile-section__title">{t('profileLinks')}</h2>
          <ul className="profile-links__list">
            {safeHttpUrl(profile.telegram_url) ? (
              <li>
                <a href={safeHttpUrl(profile.telegram_url)!} target="_blank" rel="noopener noreferrer">
                  Telegram
                </a>
              </li>
            ) : null}
            {socialEntries.map(([name, url]) => (
              <li key={name}>
                <a href={safeHttpUrl(url)!} target="_blank" rel="noopener noreferrer">
                  {name}
                </a>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  )
}
