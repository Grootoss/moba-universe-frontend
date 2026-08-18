import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { clearTokens, fetchMe, getAccessToken } from '../api/auth'
import { fetchMyContacts } from '../api/contacts'
import {
  cancelOwnProfile,
  fetchOwnProfile,
  fetchProfileOptions,
  submitOwnProfile,
  updateOwnContacts,
  updateOwnGames,
  updateOwnProfile,
} from '../api/profile'
import ContactModal from '../components/ContactModal'
import ContactRequestActions from '../components/ContactRequestActions'
import type { AuthUser, ContactItem, OwnProfile, ProfileOptions, SocialContact } from '../types/profile'
import { usePageTitle } from '../hooks/usePageTitle'
import { rolesForGame } from '../utils/gameRoles'

type GameRow = { game: string; rank: string; roles: string[]; sort_order: number }
type ContactRow = { label: string; url: string; is_public: boolean }

const CONTACT_PRESETS = ['Telegram', 'Discord', 'VK', 'Twitch', 'YouTube']

function emptyContacts(existing: SocialContact[] | undefined): ContactRow[] {
  const rows = (existing || []).map((c) => ({
    label: c.label,
    url: c.url,
    is_public: Boolean(c.is_public),
  }))
  while (rows.length < 3) rows.push({ label: CONTACT_PRESETS[rows.length] || 'Telegram', url: '', is_public: false })
  return rows.slice(0, 3)
}

export default function ProfileCabinetPage() {
  const { t, i18n } = useTranslation()
  const { lang = i18n.language } = useParams()
  const navigate = useNavigate()

  const [me, setMe] = useState<AuthUser | null>(null)
  const [profile, setProfile] = useState<OwnProfile | null>(null)
  const [options, setOptions] = useState<ProfileOptions | null>(null)
  const [loading, setLoading] = useState(true)
  const [savingText, setSavingText] = useState(false)
  const [savingGames, setSavingGames] = useState(false)
  const [savingContacts, setSavingContacts] = useState(false)
  const [gamesNotice, setGamesNotice] = useState('')
  const [contactsNotice, setContactsNotice] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [nickname, setNickname] = useState('')
  const [bio, setBio] = useState('')
  const [games, setGames] = useState<GameRow[]>([])
  const [contactRows, setContactRows] = useState<ContactRow[]>(emptyContacts([]))
  const [inbox, setInbox] = useState<{ incoming: ContactItem[]; outgoing: ContactItem[] }>({
    incoming: [],
    outgoing: [],
  })
  const [modalItem, setModalItem] = useState<ContactItem | null>(null)

  usePageTitle(t('cabinetTitle'))

  const canEditText = Boolean(profile?.can_edit)
  const isPending = profile?.moderation_status === 'pending'
  const isDraft = profile?.moderation_status === 'draft'
  const isRejected = profile?.moderation_status === 'rejected'
  const isApproved = profile?.moderation_status === 'approved'
  const showFillPrompt = isDraft || isRejected

  const statusLabel = useMemo(() => {
    const s = profile?.moderation_status
    if (s === 'draft') return t('cabinetStatusDraft')
    if (s === 'pending') return t('cabinetStatusPending')
    if (s === 'approved') return t('cabinetStatusApproved')
    if (s === 'rejected') return t('cabinetStatusRejected')
    return s || ''
  }, [profile, t])

  const applyProfile = (
    p: OwnProfile,
    opts: ProfileOptions | null = options,
    mode: { keepGames?: boolean } = {},
  ) => {
    setProfile(p)
    setNickname(p.nickname || '')
    setBio(p.bio || '')
    if (!mode.keepGames) {
      const mapped = (Array.isArray(p.games) ? p.games : []).map((g, i) => ({
        game: g.game,
        rank: g.rank,
        roles: Array.isArray(g.roles) ? g.roles.map(String) : [],
        sort_order: g.sort_order ?? i,
      }))
      if (mapped.length) {
        setGames(mapped)
      } else {
        const first = opts?.games[0]
        const ranks = first ? opts?.ranks[first.slug] || [] : []
        setGames(first ? [{ game: first.slug, rank: ranks[0] || '', roles: [], sort_order: 0 }] : [])
      }
    }
    setContactRows(emptyContacts(p.contacts))
  }

  const gameName = (slug: string) => {
    const g = options?.games.find((x) => x.slug === slug)
    if (!g) return slug.toUpperCase()
    return i18n.language === 'ru' ? g.name_ru : g.name_en
  }

  const ranksFor = (game: string) => options?.ranks[game] || []
  const rolesFor = (game: string) => rolesForGame(game, options)

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const [opts, own, contacts] = await Promise.all([
        fetchProfileOptions(),
        fetchOwnProfile(),
        fetchMyContacts().catch(() => ({ incoming: [], outgoing: [] })),
      ])
      setOptions(opts)
      applyProfile(own, opts)
      setInbox(contacts)
    } catch (e) {
      setProfile(null)
      setError(e instanceof Error ? e.message : t('adminLoadError'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const init = async () => {
      if (!getAccessToken()) {
        void navigate(`/${lang}/login`, { replace: true })
        return
      }
      try {
        setMe(await fetchMe())
        await load()
      } catch {
        clearTokens()
        void navigate(`/${lang}/login`, { replace: true })
      }
    }
    void init()
  }, [lang, navigate])

  const onSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canEditText) return
    setSavingText(true)
    setError('')
    setSuccess('')
    try {
      const updated = await updateOwnProfile({ nickname: nickname.trim(), bio })
      applyProfile(updated.moderation_status === 'pending' ? updated : await submitOwnProfile())
      setSuccess(t('cabinetSubmitted'))
    } catch (e) {
      setError(e instanceof Error ? e.message : t('adminSaveError'))
    } finally {
      setSavingText(false)
    }
  }

  const onSaveGames = async () => {
    setSavingGames(true)
    setGamesNotice('')
    setError('')
    setSuccess('')
    try {
      applyProfile(
        await updateOwnGames({
          games: games.map((g, i) => ({
            game: g.game,
            rank: g.rank,
            roles: g.roles.map(String),
            sort_order: i,
          })),
        }),
        options,
      )
      setGamesNotice(t('cabinetGamesSaved'))
    } catch (e) {
      setError(e instanceof Error ? e.message : t('adminSaveError'))
    } finally {
      setSavingGames(false)
    }
  }

  const onSaveContacts = async () => {
    setSavingContacts(true)
    setContactsNotice('')
    setError('')
    setSuccess('')
    try {
      const contacts = contactRows
        .filter((c) => c.url.trim())
        .map((c) => ({ label: c.label.trim() || 'Telegram', url: c.url.trim(), is_public: c.is_public }))
      applyProfile(await updateOwnContacts({ contacts }), options, { keepGames: true })
      setContactsNotice(t('cabinetContactsSaved'))
    } catch (e) {
      setError(e instanceof Error ? e.message : t('adminSaveError'))
    } finally {
      setSavingContacts(false)
    }
  }

  const onCancelReview = async () => {
    setSavingText(true)
    setError('')
    setSuccess('')
    try {
      applyProfile(await cancelOwnProfile())
      setSuccess(t('cabinetCancelled'))
    } catch (e) {
      setError(e instanceof Error ? e.message : t('adminSaveError'))
    } finally {
      setSavingText(false)
    }
  }

  const addGame = () => {
    const used = new Set(games.map((g) => g.game))
    const next = options?.games.find((g) => !used.has(g.slug))
    if (!next) return
    const ranks = ranksFor(next.slug)
    setGames((prev) => [
      ...prev,
      { game: next.slug, rank: ranks[0] || '', roles: [], sort_order: prev.length },
    ])
    setGamesNotice('')
  }

  const removeGame = (index: number) => {
    setGames((prev) => prev.filter((_, i) => i !== index).map((g, i) => ({ ...g, sort_order: i })))
    setGamesNotice('')
  }

  const toggleRole = (index: number, slug: string) => {
    setGames((prev) =>
      prev.map((row, i) => {
        if (i !== index) return row
        const key = String(slug)
        const has = row.roles.map(String).includes(key)
        return { ...row, roles: has ? row.roles.filter((r) => String(r) !== key) : [...row.roles, key] }
      }),
    )
    setGamesNotice('')
  }

  const logout = () => {
    clearTokens()
    void navigate(`/${lang}/login`)
  }

  if (loading) return <div className="page cabinet"><p className="state">{t('loading')}</p></div>

  return (
    <div className="page cabinet">
      <div className="cabinet__bar">
        <h1>{t('cabinetTitle')}</h1>
        <button type="button" className="admin-btn admin-btn--ghost" onClick={logout}>
          {t('adminLogout')}
        </button>
      </div>

      {error && !profile ? (
        <p className="admin-login__error">
          {error}{' '}
          <button type="button" className="admin-btn admin-btn--ghost" onClick={() => void load()}>
            {t('cabinetRetry')}
          </button>
        </p>
      ) : null}

      {me && (me.role === 'admin' || me.role === 'moderator') ? (
        <p className="cabinet__banner cabinet__banner--pending">
          {t('cabinetStaffHint')} <Link to="/admin">{t('adminCabinetTitle')}</Link>
        </p>
      ) : profile ? (
        <>
          {showFillPrompt ? (
            <p className="cabinet__banner cabinet__banner--fill" role="status">
              {t('cabinetFillProfile')}
            </p>
          ) : null}

          <section className="cabinet__summary" aria-label="profile summary">
            <div className="cabinet__summary-main">
              <p className="cabinet__summary-eyebrow">{t('profileEyebrow')}</p>
              <h2 className="cabinet__summary-name">{nickname || profile.nickname || '—'}</h2>
              {me ? (
                <p className="cabinet__summary-meta">
                  {me.email} · @{me.username} · ID {profile.user_id}
                </p>
              ) : null}
              <p className="cabinet__summary-link">
                <Link to={`/${lang}/user/${profile.user_id}`}>{t('cabinetProfileLink')}</Link>
              </p>
              <p className="cabinet__summary-status">
                {t('cabinetStatus')}: <strong>{statusLabel}</strong>
                {profile.is_public ? ` · ${t('cabinetPublicYes')}` : ` · ${t('cabinetPublicNo')}`}
              </p>
              <p className="cabinet__summary-bio">{bio?.trim() || t('cabinetBioEmpty')}</p>
              {games.length ? (
                <ul className="cabinet__summary-games">
                  {games.map((g) => (
                    <li key={`${g.game}-${g.rank}`}>
                      {gameName(g.game)}: {g.rank || '—'}
                      {g.roles.length ? ` · ${g.roles.map((r) => roleLabel(g.game, r)).join(', ')}` : ''}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </section>

          <div className="cabinet__status">
            {isRejected && profile.moderation_note ? (
              <span className="cabinet__banner cabinet__banner--reject">
                {t('cabinetRejectNote')}: {profile.moderation_note}
              </span>
            ) : isPending ? (
              <span className="cabinet__banner cabinet__banner--pending">{t('cabinetPendingHint')}</span>
            ) : isApproved ? (
              <span className="cabinet__banner">{t('cabinetApprovedHint')}</span>
            ) : null}
          </div>

          {error ? <p className="admin-login__error">{error}</p> : null}
          {success ? <p className="cabinet__ok">{success}</p> : null}

          <section className="cabinet__block">
            <h2 className="cabinet__block-title">{t('cabinetSectionAbout')}</h2>
            <p className="cabinet__block-hint">{t('cabinetSectionAboutHint')}</p>
            {isPending ? <p className="cabinet__readonly-hint">{t('cabinetFormReadonly')}</p> : null}

            <form className="cabinet__form" onSubmit={onSubmitReview}>
              <label className="admin-field">
                <span>{t('cabinetNickname')}</span>
                <input
                  type="text"
                  disabled={!canEditText}
                  placeholder={t('cabinetNicknamePlaceholder')}
                  required
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                />
              </label>
              <label className="admin-field">
                <span>{t('cabinetBio')}</span>
                <textarea
                  rows={5}
                  disabled={!canEditText}
                  placeholder={t('cabinetBioPlaceholder')}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />
              </label>
              <div className="cabinet__actions">
                {canEditText ? (
                  <button type="submit" className="admin-btn" disabled={savingText}>
                    {t('cabinetSubmit')}
                  </button>
                ) : null}
                {isPending ? (
                  <button type="button" className="admin-btn admin-btn--ghost" disabled={savingText} onClick={() => void onCancelReview()}>
                    {t('cabinetCancelSubmit')}
                  </button>
                ) : null}
              </div>
            </form>
          </section>

          <section className="cabinet__block">
            <h2 className="cabinet__block-title">{t('profileGames')}</h2>
            <p className="cabinet__block-hint">{t('cabinetSectionGamesHint')}</p>
            <div className="cabinet__form">
              <div className="cabinet__games">
                {games.map((g, index) => (
                  <div key={`${g.game}-${index}`} className="cabinet__game-row">
                    <div className="cabinet__game-row-main">
                      <label className="admin-field">
                        <span>{t('cabinetGame')}</span>
                        <select
                          value={g.game}
                          onChange={(e) => {
                            const game = e.target.value
                            const rank = ranksFor(game)[0] || ''
                            setGames((prev) =>
                              prev.map((row, i) => (i === index ? { ...row, game, rank, roles: [] } : row)),
                            )
                            setGamesNotice('')
                          }}
                        >
                          {(options?.games || [])
                            .filter(
                              (opt) =>
                                opt.slug === g.game || !games.some((row, i) => i !== index && row.game === opt.slug),
                            )
                            .map((opt) => (
                            <option key={opt.slug} value={opt.slug}>
                              {gameName(opt.slug)}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="admin-field">
                        <span>{t('cabinetRank')}</span>
                        <select
                          value={g.rank}
                          onChange={(e) => {
                            const rank = e.target.value
                            setGames((prev) => prev.map((row, i) => (i === index ? { ...row, rank } : row)))
                            setGamesNotice('')
                          }}
                        >
                          {ranksFor(g.game).map((r) => (
                            <option key={r} value={r}>
                              {r}
                            </option>
                          ))}
                        </select>
                      </label>
                      <button type="button" className="admin-btn admin-btn--ghost" onClick={() => removeGame(index)}>
                        {t('cabinetRemoveGame')}
                      </button>
                    </div>
                    <div className="cabinet__roles">
                      <span className="cabinet__roles-label">{t('cabinetRoles')}</span>
                      <div className="cabinet__roles-list">
                        {rolesFor(g.game).map((role) => {
                          const on = g.roles.map(String).includes(String(role.slug))
                          return (
                            <button
                              key={role.slug}
                              type="button"
                              className={`cabinet__role-chip${on ? ' is-on' : ''}`}
                              aria-pressed={on}
                              onClick={() => toggleRole(index, String(role.slug))}
                            >
                              {i18n.language === 'ru' ? role.name_ru : role.name_en}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                ))}
                {games.length < (options?.games.length || 0) ? (
                  <button type="button" className="admin-btn admin-btn--ghost cabinet__add-game" onClick={addGame}>
                    {t('cabinetAddGame')}
                  </button>
                ) : null}
              </div>
              <div className="cabinet__actions">
                <button type="button" className="admin-btn" disabled={savingGames} onClick={() => void onSaveGames()}>
                  {savingGames ? t('loading') : t('cabinetSaveGames')}
                </button>
              </div>
              {gamesNotice ? (
                <p className="cabinet__notice" role="status" aria-live="polite">
                  {gamesNotice}
                </p>
              ) : null}
            </div>
          </section>

          <section className="cabinet__block">
            <h2 className="cabinet__block-title">{t('cabinetSectionContacts')}</h2>
            <p className="cabinet__block-hint">{t('cabinetSectionContactsHint')}</p>
            <div className="cabinet__form">
              {contactRows.map((row, index) => (
                <div key={index} className="cabinet__contact-row">
                  <label className="admin-field">
                    <span>{t('cabinetContactLabel')}</span>
                    <select
                      value={CONTACT_PRESETS.includes(row.label) ? row.label : 'Telegram'}
                      onChange={(e) => {
                        const label = e.target.value
                        setContactRows((prev) => prev.map((r, i) => (i === index ? { ...r, label } : r)))
                        setContactsNotice('')
                      }}
                    >
                      {CONTACT_PRESETS.map((label) => (
                        <option key={label} value={label}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="admin-field">
                    <span>{t('cabinetContactUrl')}</span>
                    <input
                      type="url"
                      placeholder="https://"
                      value={row.url}
                      onChange={(e) => {
                        const url = e.target.value
                        setContactRows((prev) => prev.map((r, i) => (i === index ? { ...r, url } : r)))
                        setContactsNotice('')
                      }}
                    />
                  </label>
                  <label className="cabinet__public-toggle">
                    <input
                      type="checkbox"
                      checked={row.is_public}
                      onChange={(e) => {
                        const is_public = e.target.checked
                        setContactRows((prev) => prev.map((r, i) => (i === index ? { ...r, is_public } : r)))
                        setContactsNotice('')
                      }}
                    />
                    <span>{row.is_public ? t('cabinetContactPublic') : t('cabinetContactPrivate')}</span>
                  </label>
                </div>
              ))}
              <div className="cabinet__actions">
                <button type="button" className="admin-btn" disabled={savingContacts} onClick={() => void onSaveContacts()}>
                  {savingContacts ? t('loading') : t('cabinetSaveContacts')}
                </button>
              </div>
              {contactsNotice ? (
                <p className="cabinet__notice" role="status" aria-live="polite">
                  {contactsNotice}
                </p>
              ) : null}
            </div>
          </section>

          <section className="cabinet__block">
            <h2 className="cabinet__block-title">{t('contactsTitle')}</h2>
            <p className="cabinet__block-hint">{t('contactsHint')}</p>
            <div className="contacts-columns">
              <div>
                <h3 className="contacts-columns__title">{t('contactsIncoming')}</h3>
                {inbox.incoming.length ? (
                  <ul className="contacts-list">
                    {inbox.incoming.map((item) => (
                      <li key={item.request_id}>
                        <button type="button" className="contacts-list__btn" onClick={() => setModalItem(item)}>
                          {item.nickname}
                        </button>
                        <ContactRequestActions
                          item={item}
                          onUpdated={async (next, action) => {
                            setInbox(await fetchMyContacts())
                            if (action === 'accept') {
                              setModalItem(next)
                              setContactsNotice(t('contactsSentOk'))
                            }
                          }}
                        />
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="state">{t('contactsEmptyIncoming')}</p>
                )}
              </div>
              <div>
                <h3 className="contacts-columns__title">{t('contactsOutgoing')}</h3>
                {inbox.outgoing.length ? (
                  <ul className="contacts-list">
                    {inbox.outgoing.map((item) => (
                      <li key={item.request_id}>
                        <button type="button" className="contacts-list__btn" onClick={() => setModalItem(item)}>
                          {item.nickname}
                        </button>
                        {item.status === 'declined' ? (
                          <span className="contacts-list__status">{t('contactsDeclined')}</span>
                        ) : item.status === 'pending' ? (
                          <span className="contacts-list__status">{t('contactsPendingOut')}</span>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="state">{t('contactsEmptyOutgoing')}</p>
                )}
              </div>
            </div>
          </section>
        </>
      ) : null}

      {modalItem ? (
        <ContactModal
          title={t('contactsModalTitle')}
          nickname={modalItem.nickname}
          contacts={modalItem.status === 'accepted' ? modalItem.contacts : null}
          emptyText={
            modalItem.status === 'accepted'
              ? t('contactsModalEmpty')
              : modalItem.status === 'declined'
                ? t('contactsDeclined')
                : t('contactsPendingOut')
          }
          closeLabel={t('menuClose')}
          onClose={() => setModalItem(null)}
        />
      ) : null}
    </div>
  )
}
