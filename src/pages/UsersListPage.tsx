import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { fetchPublicUsers } from '../api/users'
import ErrorState from '../components/ErrorState'
import { usePageTitle } from '../hooks/usePageTitle'
import { useJsonLd } from '../hooks/useJsonLd'
import { usePrerenderReady } from '../hooks/usePrerenderReady'
import { siteOrigin } from '../utils/prerender'
import type { PublicProfile } from '../types/profile'

const GAME_LABELS: Record<string, string> = {
  mlbb: 'MLBB',
  lol: 'LoL',
  wildrift: 'Wild Rift',
  dota2: 'Dota 2',
  aov: 'AoV',
  hok: 'Honor of Kings',
  smite: 'Smite',
}

function formatRanks(profile: PublicProfile): string {
  if (!profile.games.length) return '—'
  return profile.games
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((g) => `${GAME_LABELS[g.game] || g.game.toUpperCase()}: ${g.rank || '—'}`)
    .join(' · ')
}

export default function UsersListPage() {
  const { t } = useTranslation()
  const { lang = 'ru' } = useParams()

  const [users, setUsers] = useState<PublicProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const listSchema = useMemo(
    () => ({
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: t('usersTitle'),
      inLanguage: lang,
      url: `${siteOrigin()}/${lang}/users`,
      description: t('usersSubtitle'),
    }),
    [t, lang],
  )

  usePageTitle(t('usersTitle'), t('usersSubtitle'))
  useJsonLd(listSchema)
  usePrerenderReady(!loading)

  const load = async () => {
    setLoading(true)
    setError(false)
    try {
      const data = await fetchPublicUsers()
      setUsers(data)
    } catch {
      setError(true)
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  if (loading) {
    return (
      <div className="page users-page">
        <div className="state">{t('loading')}</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="page users-page">
        <ErrorState
          title={t('errorUsersTitle')}
          description={t('errorUsersText')}
          actionLabel={t('notFoundAction')}
          actionTo={`/${lang}/mlbb`}
          retryLabel={t('errorRetry')}
          onRetry={() => void load()}
        />
      </div>
    )
  }

  return (
    <div className="page users-page">
      <header className="page-header">
        <p className="page-header__eyebrow">{t('usersEyebrow')}</p>
        <h1 className="page-header__title">{t('usersTitle')}</h1>
        <p className="page-header__subtitle">{t('usersSubtitle')}</p>
      </header>

      {users.length ? (
        <ul className="users-list">
          {users.map((user) => (
            <li key={user.user_id}>
              <Link to={`/${lang}/user/${user.user_id}`} className="users-list__row">
                <span className="users-list__id">#{user.user_id}</span>
                <span className="users-list__nick">{user.nickname}</span>
                <span className="users-list__ranks">{formatRanks(user)}</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="state">{t('usersEmpty')}</p>
      )}
    </div>
  )
}
