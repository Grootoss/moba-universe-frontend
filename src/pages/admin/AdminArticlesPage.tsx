import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { deleteAdminArticle, fetchAdminArticles } from '../../api/admin'
import type { AdminArticle } from '../../types/profile'
import { usePageTitle } from '../../hooks/usePageTitle'

export default function AdminArticlesPage() {
  const { t, i18n } = useTranslation()
  const [rows, setRows] = useState<AdminArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'published'>('all')

  usePageTitle(t('adminNavArticles'))

  const filtered = useMemo(() => {
    if (statusFilter === 'all') return rows
    return rows.filter((a) => a.status === statusFilter)
  }, [rows, statusFilter])

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      setRows(await fetchAdminArticles())
    } catch {
      setError(t('adminLoadError'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const onDelete = async (id: number) => {
    if (!confirm(t('adminConfirmDelete'))) return
    try {
      await deleteAdminArticle(id)
      await load()
    } catch {
      setError(t('adminLoadError'))
    }
  }

  return (
    <div className="admin-page">
      <header className="admin-page__hero">
        <h1 className="admin-page__title">{t('adminNavArticles')}</h1>
      </header>

      <div className="admin-page__toolbar">
        <Link to="/admin" className="admin-back">
          ← {t('adminCabinetTitle')}
        </Link>
        <Link to="/admin/articles/new" className="admin-btn">
          {t('adminArticleNew')}
        </Link>
      </div>

      <div className="admin-filters">
        <label className="admin-field admin-field--inline">
          <span>{t('adminColStatus')}</span>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}>
            <option value="all">{t('adminFilterAll')}</option>
            <option value="published">published</option>
            <option value="draft">draft</option>
          </select>
        </label>
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
                <th>Slug</th>
                <th>{t('adminColTitle')}</th>
                <th>{t('adminColStatus')}</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr key={a.id}>
                  <td>{a.id}</td>
                  <td>{a.slug}</td>
                  <td>{a.title_ru || a.title_en}</td>
                  <td>
                    <span className={`admin-status admin-status--${a.status}`}>{a.status}</span>
                  </td>
                  <td className="admin-actions admin-actions--inline">
                    {a.status === 'published' ? (
                      <a
                        className="admin-btn admin-btn--ghost"
                        href={`/${i18n.language === 'en' ? 'en' : 'ru'}/evergreen/${a.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {t('adminPreview')}
                      </a>
                    ) : (
                      <span className="admin-preview-disabled" title={t('adminPreviewDraftHint')}>
                        {t('adminPreview')}
                      </span>
                    )}
                    <Link to={`/admin/articles/${a.id}/edit`} className="admin-btn">
                      {t('adminEdit')}
                    </Link>
                    <button type="button" className="admin-btn admin-btn--danger" onClick={() => void onDelete(a.id)}>
                      {t('adminDelete')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!filtered.length ? <p className="admin-hint">{t('adminArticlesEmptyFilter')}</p> : null}
          <p className="admin-hint">{t('adminArticlesCrudHint')}</p>
        </div>
      )}
    </div>
  )
}
