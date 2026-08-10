import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { fetchAdminProfiles, moderateProfile, unlockAdminProfile } from '../../api/profile'
import type { AdminProfile } from '../../types/profile'
import { usePageTitle } from '../../hooks/usePageTitle'

export default function AdminProfilesPage() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language === 'en' ? 'en' : 'ru'
  const [rows, setRows] = useState<AdminProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [rejectNotes, setRejectNotes] = useState<Record<number, string>>({})
  const [busyId, setBusyId] = useState<number | null>(null)

  usePageTitle(t('adminNavProfiles'))

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      setRows(await fetchAdminProfiles())
    } catch {
      setError(t('adminLoadError'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const onUnlock = async (p: AdminProfile) => {
    setBusyId(p.user_id)
    try {
      await unlockAdminProfile(p.user_id)
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : t('adminLoadError'))
    } finally {
      setBusyId(null)
    }
  }

  const onApprove = async (p: AdminProfile) => {
    setBusyId(p.user_id)
    try {
      await moderateProfile(p.user_id, { moderation_status: 'approved', is_public: true })
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : t('adminLoadError'))
    } finally {
      setBusyId(null)
    }
  }

  const onReject = async (p: AdminProfile) => {
    const note = (rejectNotes[p.user_id] || '').trim()
    if (!note) {
      setError(t('adminRejectNeedNote'))
      return
    }
    setBusyId(p.user_id)
    try {
      await moderateProfile(p.user_id, {
        moderation_status: 'rejected',
        is_public: false,
        moderation_note: note,
      })
      setRejectNotes((prev) => ({ ...prev, [p.user_id]: '' }))
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : t('adminLoadError'))
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="admin-page">
      <header className="admin-page__hero">
        <h1 className="admin-page__title">{t('adminNavProfiles')}</h1>
        <p className="admin-page__lead">{t('adminProfilesHint')}</p>
      </header>

      <div className="admin-page__toolbar">
        <Link to="/admin" className="admin-back">
          ← {t('adminCabinetTitle')}
        </Link>
      </div>

      {loading ? (
        <p className="state">{t('loading')}</p>
      ) : error ? (
        <p className="admin-login__error">{error}</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>{t('adminColNickname')}</th>
                <th>{t('authUsername')}</th>
                <th>{t('adminColStatus')}</th>
                <th>{t('profileGames')}</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.user_id}>
                  <td>
                    {p.moderation_status === 'approved' ? (
                      <Link to={`/${lang}/user/${p.user_id}`}>{p.user_id}</Link>
                    ) : (
                      p.user_id
                    )}
                  </td>
                  <td>
                    <div className="admin-profile-nick">{p.nickname}</div>
                    <div className="admin-profile-bio">
                      <span className="admin-profile-bio__label">{t('cabinetBio')}</span>
                      <p className="admin-profile-bio__text">{p.bio?.trim() || t('cabinetBioEmpty')}</p>
                    </div>
                  </td>
                  <td>{p.username || '—'}</td>
                  <td>
                    {p.moderation_status}
                    {p.moderation_note ? <div className="admin-note">{p.moderation_note}</div> : null}
                  </td>
                  <td>
                    {p.games.map((g) => (
                      <span key={g.game} className="admin-chip">
                        {g.game.toUpperCase()}: {g.rank}
                      </span>
                    ))}
                  </td>
                  <td className="admin-actions admin-actions--stack">
                    {!p.profile_edit_unlocked ? (
                      <button
                        type="button"
                        className="admin-btn admin-btn--ghost"
                        disabled={busyId === p.user_id}
                        onClick={() => void onUnlock(p)}
                      >
                        {t('adminUnlock')}
                      </button>
                    ) : null}
                    <button
                      type="button"
                      className="admin-btn"
                      disabled={busyId === p.user_id || p.moderation_status === 'approved'}
                      onClick={() => void onApprove(p)}
                    >
                      {t('adminApprove')}
                    </button>
                    <textarea
                      className="admin-reject-note"
                      rows={2}
                      placeholder={t('adminRejectPlaceholder')}
                      value={rejectNotes[p.user_id] || ''}
                      onChange={(e) => setRejectNotes((prev) => ({ ...prev, [p.user_id]: e.target.value }))}
                    />
                    <button
                      type="button"
                      className="admin-btn admin-btn--ghost"
                      disabled={busyId === p.user_id}
                      onClick={() => void onReject(p)}
                    >
                      {t('adminReject')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="admin-hint">{t('adminProfilesModHint')}</p>
        </div>
      )}
    </div>
  )
}
