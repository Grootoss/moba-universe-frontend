import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useParams, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { fetchPublicUsers } from '../api/users'
import { fetchProfileOptions } from '../api/profile'
import ErrorState from '../components/ErrorState'
import { usePageTitle } from '../hooks/usePageTitle'
import { useJsonLd } from '../hooks/useJsonLd'
import { usePrerenderReady } from '../hooks/usePrerenderReady'
import { siteOrigin } from '../utils/prerender'
import { gameLabel } from '../utils/gameLabels'
import { GENERIC_ROLES, roleLabel, rolesForGame } from '../utils/gameRoles'
import type { ProfileOptions, PublicProfile } from '../types/profile'

function formatGames(profile: PublicProfile, options: ProfileOptions | null, lang: string): string {
  if (!profile.games.length) return '—'
  return profile.games
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((g) => {
      const roles = (g.roles || []).map((slug) => roleLabel(g.game, String(slug), lang, options)).filter(Boolean)
      const rolePart = roles.length ? ` (${roles.join(', ')})` : ''
      return `${gameLabel(g.game)}: ${g.rank || '—'}${rolePart}`
    })
    .join(' · ')
}

export default function UsersListPage() {
  const { t, i18n } = useTranslation()
  const { lang = 'ru' } = useParams()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()

  const nameQuery = searchParams.get('q') ?? ''
  const game = searchParams.get('game') ?? ''
  const role = searchParams.get('role') ?? ''

  const [users, setUsers] = useState<PublicProfile[]>([])
  const [options, setOptions] = useState<ProfileOptions | null>(null)
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

  const roleOptions = game ? rolesForGame(game, options) : GENERIC_ROLES

  const patchSearch = (patch: { q?: string; game?: string; role?: string }) => {
    const next = new URLSearchParams(searchParams)
    const values = {
      q: patch.q ?? nameQuery,
      game: patch.game ?? game,
      role: patch.role ?? role,
    }
    if (patch.game !== undefined && patch.game !== game) values.role = ''
    for (const [key, value] of Object.entries(values)) {
      const trimmed = value.trim()
      if (trimmed) next.set(key, trimmed)
      else next.delete(key)
    }
    setSearchParams(next, { replace: true })
  }

  const load = async (params?: { q?: string; game?: string; role?: string }) => {
    setError(false)
    try {
      const data = await fetchPublicUsers({
        q: params?.q ?? nameQuery,
        game: params?.game ?? game,
        role: params?.role ?? role,
      })
      setUsers(data)
    } catch {
      setError(true)
      setUsers([])
    } finally {
      setListReady(true)
    }
  }

  useEffect(() => {
    void fetchProfileOptions()
      .then(setOptions)
      .catch(() => setOptions(null))
  }, [])

  useEffect(() => {
    let cancelled = false
    setListReady(false)
    const timer = window.setTimeout(() => {
      void (async () => {
        try {
          const data = await fetchPublicUsers({ q: nameQuery, game, role })
          if (!cancelled) setUsers(data)
        } catch {
          if (!cancelled) {
            setError(true)
            setUsers([])
          }
        } finally {
          if (!cancelled) setListReady(true)
        }
      })()
    }, nameQuery.trim() ? 300 : 0)
    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [nameQuery, game, role])

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

      <form
        className="users-search"
        onSubmit={(e) => {
          e.preventDefault()
          void load()
        }}
      >
        <label className="admin-field">
          <span>{t('usersSearchName')}</span>
          <input
            type="search"
            value={nameQuery}
            onChange={(e) => patchSearch({ q: e.target.value })}
            placeholder={t('usersSearchNamePlaceholder')}
            autoComplete="off"
          />
        </label>
        <label className="admin-field">
          <span>{t('usersSearchGame')}</span>
          <select
            value={game}
            onChange={(e) => patchSearch({ game: e.target.value, role: '' })}
          >
            <option value="">{t('usersSearchAnyGame')}</option>
            {(options?.games || []).map((g) => (
              <option key={g.slug} value={g.slug}>
                {i18n.language === 'ru' ? g.name_ru : g.name_en}
              </option>
            ))}
          </select>
        </label>
        <label className="admin-field">
          <span>{t('usersSearchRole')}</span>
          <select value={role} onChange={(e) => patchSearch({ role: e.target.value })}>
            <option value="">{t('usersSearchAnyRole')}</option>
            {roleOptions.map((r) => (
              <option key={r.slug} value={r.slug}>
                {i18n.language === 'ru' ? r.name_ru : r.name_en}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className="btn btn--primary users-search__btn">
          {t('usersSearchSubmit')}
        </button>
      </form>

      {listReady && users.length ? (
        <ul className="users-list">
          {users.map((user) => (
            <li key={user.user_id}>
              <Link
                to={`/${lang}/user/${user.user_id}`}
                state={{ usersSearch: location.search }}
                className="users-list__row"
              >
                <span className="users-list__id">#{user.user_id}</span>
                <span className="users-list__nick">{user.nickname}</span>
                <span className="users-list__ranks">{formatGames(user, options, i18n.language)}</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
      {listReady && !users.length ? <p className="state">{t('usersEmpty')}</p> : null}
    </div>
  )
}
