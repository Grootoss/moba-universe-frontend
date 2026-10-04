import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { clearTokens, fetchMe, getAccessToken, logout as logoutSession } from '../api/auth'
import {
  acceptContactRequest,
  cancelOwnProfile,
  declineContactRequest,
  fetchMyContacts,
  fetchOwnProfile,
  fetchProfileOptions,
  submitOwnProfile,
  updateOwnContacts,
  updateOwnGames,
  updateOwnProfile,
} from '../api/profile'
import type { AuthUser, ContactsList, OwnProfile, ProfileOptions, SocialContact } from '../types/profile'
import { usePageTitle } from '../hooks/usePageTitle'

type GameRow = { game: string; rank: string; sort_order: number }

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
  const [gamesNotice, setGamesNotice] = useState('')
  const [telegramUrl, setTelegramUrl] = useState('')
  const [telegramPublic, setTelegramPublic] = useState(false)
  const [discordUrl, setDiscordUrl] = useState('')
  const [discordPublic, setDiscordPublic] = useState(false)
  const [savingContacts, setSavingContacts] = useState(false)
  const [contactsNotice, setContactsNotice] = useState('')
  const [contactBox, setContactBox] = useState<ContactsList | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [nickname, setNickname] = useState('')
  const [bio, setBio] = useState('')
  const [games, setGames] = useState<GameRow[]>([])

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
    const byLabel = (label: string) =>
      (p.contacts || []).find((c) => c.label.toLowerCase() === label)
    const telegram = byLabel('telegram')
    const discord = byLabel('discord')
    setTelegramUrl(telegram?.url || '')
    setTelegramPublic(Boolean(telegram?.is_public))
    setDiscordUrl(discord?.url || '')
    setDiscordPublic(Boolean(discord?.is_public))
    if (!mode.keepGames) {
      const mapped = (Array.isArray(p.games) ? p.games : []).map((g, i) => ({
        game: g.game,
        rank: g.rank,
        sort_order: g.sort_order ?? i,
      }))
      if (mapped.length) {
        setGames(mapped)
      } else {
        const first = opts?.games[0]
        const ranks = first ? opts?.ranks[first.slug] || [] : []
        setGames(first ? [{ game: first.slug, rank: ranks[0] || '', sort_order: 0 }] : [])
      }
    }
  }

  const gameName = (slug: string) => {
    const g = options?.games.find((x) => x.slug === slug)
    if (!g) return slug.toUpperCase()
    return i18n.language === 'ru' ? g.name_ru : g.name_en
  }

  const ranksFor = (game: string) => options?.ranks[game] || []

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const [opts, own, box] = await Promise.all([fetchProfileOptions(), fetchOwnProfile(), fetchMyContacts()])
      setOptions(opts)
      setContactBox(box)
      applyProfile(own, opts)
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
            roles: [],
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

  const contactPayload = () => {
    const rows: SocialContact[] = []
    const telegram = telegramUrl.trim()
    const discord = discordUrl.trim()
    if (telegram && !/^https?:\/\//i.test(telegram)) return null
    if (discord && !/^https?:\/\//i.test(discord)) return null
    if (telegram) rows.push({ label: 'Telegram', url: telegram, is_public: telegramPublic })
    if (discord) rows.push({ label: 'Discord', url: discord, is_public: discordPublic })
    return rows
  }

  const onSaveContacts = async () => {
    const rows = contactPayload()
    if (!rows) {
      setError(t('contactsUrlInvalid'))
      return
    }
    setSavingContacts(true)
    setContactsNotice('')
    setError('')
    setSuccess('')
    try {
      applyProfile(await updateOwnContacts({ contacts: rows }), options, { keepGames: true })
      setContactsNotice(t('contactsSaved'))
    } catch (e) {
      setError(e instanceof Error ? e.message : t('adminSaveError'))
    } finally {
      setSavingContacts(false)
    }
  }

  const refreshContacts = async () => {
    setContactBox(await fetchMyContacts())
  }

  const onAcceptRequest = async (requestId: number) => {
    setError('')
    try {
      await acceptContactRequest(requestId)
      await refreshContacts()
    } catch (e) {
      setError(e instanceof Error ? e.message : t('contactsRequestError'))
    }
  }

  const onDeclineRequest = async (requestId: number) => {
    setError('')
    try {
      await declineContactRequest(requestId)
      await refreshContacts()
    } catch (e) {
      setError(e instanceof Error ? e.message : t('contactsRequestError'))
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
      { game: next.slug, rank: ranks[0] || '', sort_order: prev.length },
    ])
    setGamesNotice('')
  }

  const removeGame = (index: number) => {
    setGames((prev) => prev.filter((_, i) => i !== index).map((g, i) => ({ ...g, sort_order: i })))
    setGamesNotice('')
  }

  const logout = () => {
    void logoutSession().then(() => navigate(`/${lang}/login`))
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
                    <li key={`${g.game}-${g.rank}`} className="cabinet__summary-game">
                      <span className="cabinet__summary-game-name">{gameName(g.game)}</span>
                      <span className="cabinet__summary-game-rank">{g.rank || '—'}</span>
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
                              prev.map((row, i) => (i === index ? { ...row, game, rank } : row)),
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
            <h2 className="cabinet__block-title">{t('contactsTitle')}</h2>
            <p className="cabinet__block-hint">{t('contactsEditHint')}</p>
            <div className="cabinet__form">
              <div className="cabinet__contact-row">
                <label className="admin-field">
                  <span>Telegram</span>
                  <input
                    type="url"
                    placeholder="https://t.me/username"
                    value={telegramUrl}
                    onChange={(e) => setTelegramUrl(e.target.value)}
                  />
                </label>
                <label className="cabinet__contact-public">
                  <input type="checkbox" checked={telegramPublic} onChange={(e) => setTelegramPublic(e.target.checked)} />
                  <span>{t('contactsPublic')}</span>
                </label>
              </div>
              <div className="cabinet__contact-row">
                <label className="admin-field">
                  <span>Discord</span>
                  <input
                    type="url"
                    placeholder="https://discord.gg/example"
                    value={discordUrl}
                    onChange={(e) => setDiscordUrl(e.target.value)}
                  />
                </label>
                <label className="cabinet__contact-public">
                  <input type="checkbox" checked={discordPublic} onChange={(e) => setDiscordPublic(e.target.checked)} />
                  <span>{t('contactsPublic')}</span>
                </label>
              </div>
              <div className="cabinet__actions">
                <button type="button" className="admin-btn" disabled={savingContacts} onClick={() => void onSaveContacts()}>
                  {savingContacts ? t('loading') : t('contactsSave')}
                </button>
              </div>
              {contactsNotice ? (
                <p className="cabinet__notice" role="status">
                  {contactsNotice}
                </p>
              ) : null}
            </div>
          </section>

          <section className="cabinet__block">
            <h2 className="cabinet__block-title">{t('contactsIncoming')}</h2>
            <p className="cabinet__block-hint">{t('contactsHint')}</p>
            {contactBox && contactBox.incoming.length ? (
              <ul className="cabinet__requests">
                {contactBox.incoming.map((item) => (
                  <li key={item.request_id} className="cabinet__request">
                    <Link to={`/${lang}/user/${item.user_id}`}>{item.nickname}</Link>
                    {item.status === 'pending' ? (
                      <div className="cabinet__request-actions">
                        <button type="button" className="admin-btn" onClick={() => void onAcceptRequest(item.request_id)}>
                          {t('contactsAccept')}
                        </button>
                        <button type="button" className="admin-btn admin-btn--ghost" onClick={() => void onDeclineRequest(item.request_id)}>
                          {t('contactsDecline')}
                        </button>
                      </div>
                    ) : (
                      <p className="cabinet__request-status">
                        {item.status === 'accepted' ? t('contactsSentOk') : t('contactsDeclined')}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="cabinet__block-hint">{t('contactsEmptyIncoming')}</p>
            )}

            <h2 className="cabinet__block-title">{t('contactsOutgoing')}</h2>
            {contactBox && contactBox.outgoing.length ? (
              <ul className="cabinet__requests">
                {contactBox.outgoing.map((item) => (
                  <li key={item.request_id} className="cabinet__request">
                    <Link to={`/${lang}/user/${item.user_id}`}>{item.nickname}</Link>
                    <p className="cabinet__request-status">
                      {item.status === 'accepted'
                        ? t('contactsAlreadyConnected')
                        : item.status === 'declined'
                          ? t('contactsDeclined')
                          : t('contactsPendingOut')}
                    </p>
                    {item.contacts?.length ? (
                      <ul className="profile-contacts">
                        {item.contacts.map((c) => (
                          <li key={c.label}>
                            <a href={c.url} target="_blank" rel="noreferrer">
                              {c.label}
                            </a>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="cabinet__block-hint">{t('contactsEmptyOutgoing')}</p>
            )}
          </section>
        </>
      ) : null}
    </div>
  )
}
