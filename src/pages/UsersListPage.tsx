import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { fetchPublicUsers } from '../api/users'
import ErrorState from '../components/ErrorState'
import { usePageTitle } from '../hooks/usePageTitle'
import { useJsonLd } from '../hooks/useJsonLd'
import { usePrerenderReady } from '../hooks/usePrerenderReady'
import { siteOrigin } from '../utils/prerender'
import { gameLabel } from '../utils/gameLabels'
import type { PublicProfile } from '../types/profile'

export default function UsersListPage() {
  const { t } = useTranslation()
  const { lang = 'ru' } = useParams()

  const [users, setUsers] = useState<PublicProfile[]>([])
  const [listReady, setListReady] = useState(false)
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
  usePrerenderReady(listReady)

  const load = async () => {
    setError(false)
    try {
      const data = await fetchPublicUsers()
      setUsers(data)
    } catch {
      setError(true)
      setUsers([])
    } finally {
      setListReady(true)
    }
  }

  useEffect(() => {
    let cancelled = false
    setListReady(false)
    void (async () => {
      try {
        const data = await fetchPublicUsers()
        if (!cancelled) {
          setError(false)
          setUsers(data)
        }
      } catch {
        if (!cancelled) {
          setError(true)
          setUsers([])
        }
      } finally {
        if (!cancelled) setListReady(true)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  if (error && !users.length && listReady) {
    return (
      <div className="page users-page">
        <ErrorState
          title={t('errorUsersTitle')}
          description={t('errorUsersText')}
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

      {listReady && users.length ? (
        <ul className="users-list">
          {users.map((user) => (
            <li key={user.user_id}>
              <Link to={`/${lang}/user/${user.user_id}`} className="users-list__row">
                <span className="users-list__id">#{user.user_id}</span>
                <span className="users-list__nick">{user.nickname}</span>
                <span className="users-list__ranks">
                  {user.games.length
                    ? user.games
                        .slice()
                        .sort((a, b) => a.sort_order - b.sort_order)
                        .map((g) => (
                          <span key={g.game} className="users-list__game">
                            <span className="users-list__game-head">
                              <span className="users-list__game-name">{gameLabel(g.game)}</span>
                              {g.rank ? <span className="users-list__game-rank">{g.rank}</span> : null}
                            </span>
                          </span>
                        ))
                    : '—'}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
      {listReady && !users.length ? <p className="state">{t('usersEmpty')}</p> : null}
    </div>
  )
}
