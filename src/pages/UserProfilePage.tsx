import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { fetchPublicProfile } from '../api/admin'
import { fetchProfileOptions } from '../api/profile'
import ErrorState from '../components/ErrorState'
import { usePageTitle } from '../hooks/usePageTitle'
import { useJsonLd } from '../hooks/useJsonLd'
import { usePrerenderReady } from '../hooks/usePrerenderReady'
import { siteOrigin } from '../utils/prerender'
import { gameLabel } from '../utils/gameLabels'
import { roleLabel as roleNameFor } from '../utils/gameRoles'
import type { ProfileOptions, PublicProfile, SocialContact } from '../types/profile'

function safeHttpUrl(url: string | null | undefined): string | null {
  if (!url) return null
  const s = url.trim()
  return /^https?:\/\//i.test(s) ? s : null
}

function publicContacts(profile: PublicProfile): SocialContact[] {
  if (profile.contacts?.length) return profile.contacts.filter((c) => c.is_public && safeHttpUrl(c.url))
  const fromDict = Object.entries(profile.social_links || {})
    .map(([label, url]) => ({ label, url, is_public: true }))
    .filter((c) => safeHttpUrl(c.url))
  if (safeHttpUrl(profile.telegram_url) && !fromDict.some((c) => c.label.toLowerCase() === 'telegram')) {
    fromDict.unshift({ label: 'Telegram', url: profile.telegram_url as string, is_public: true })
  }
  return fromDict
}

export default function UserProfilePage() {
  const { t, i18n } = useTranslation()
  const { lang = 'ru', id = '' } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()

  const [profile, setProfile] = useState<PublicProfile | null>(null)
  const [options, setOptions] = useState<ProfileOptions | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const userId = Number(id)
  const isApproved = profile?.moderation_status === 'approved'
  const showPreviewBanner = Boolean(profile) && !isApproved
  const usersSearch =
    location.state && typeof location.state === 'object' && 'usersSearch' in location.state
      ? String((location.state as { usersSearch?: string }).usersSearch || '')
      : ''
  const usersBackTo = `/${lang}/users${usersSearch}`

  const profileSchema = useMemo(() => {
    if (!profile || !isApproved) return null
    const url = `${siteOrigin()}/${lang}/user/${profile.user_id}`
    return {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: profile.nickname,
      description: profile.bio?.trim() || '',
      url,
      sameAs: publicContacts(profile).map((c) => safeHttpUrl(c.url)).filter(Boolean),
    }
  }, [profile, isApproved, lang])

  usePageTitle(
    profile ? profile.nickname : t('profileTitle'),
    profile ? profile.bio?.trim() || `${profile.nickname} — ${t('profileEyebrow')}` : t('profileNotFoundText'),
  )
  useJsonLd(profileSchema)
  usePrerenderReady(!loading)

  useEffect(() => {
    void fetchProfileOptions()
      .then(setOptions)
      .catch(() => setOptions(null))
  }, [])

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

  const links = publicContacts(profile)
  const roleLabel = (game: string, slug: string) => roleNameFor(game, String(slug), i18n.language, options)

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
                {g.roles?.length ? (
                  <p className="profile-game-block__roles">
                    {(g.roles || []).map((slug) => roleLabel(g.game, slug)).join(' · ')}
                  </p>
                ) : null}
                <p className="profile-game-block__rank">{g.rank || '—'}</p>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {links.length ? (
        <section className="profile-links">
          <h2 className="profile-section__title">{t('profileLinks')}</h2>
          <ul className="profile-links__list">
            {links.map((c) => (
              <li key={`${c.label}-${c.url}`}>
                <a href={safeHttpUrl(c.url)!} target="_blank" rel="noopener noreferrer">
                  {c.label}
                </a>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  )
}
