import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { deleteAdminQuiz, fetchAdminQuizzes } from '../../api/admin'
import type { AdminQuizCard } from '../../types/quiz'
import { usePageTitle } from '../../hooks/usePageTitle'

export default function AdminQuizzesPage() {
  const { t, i18n } = useTranslation()
  const [rows, setRows] = useState<AdminQuizCard[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  usePageTitle(t('adminNavQuizzes'))

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      setRows(await fetchAdminQuizzes())
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
      await deleteAdminQuiz(id)
      await load()
    } catch {
      setError(t('adminLoadError'))
    }
  }

  const lang = i18n.language === 'en' ? 'en' : 'ru'

  return (
    <div className="admin-page">
      <header className="admin-page__hero">
        <h1 className="admin-page__title">{t('adminNavQuizzes')}</h1>
      </header>

      <div className="admin-page__toolbar">
        <Link to="/admin" className="admin-back">
          ← {t('adminCabinetTitle')}
        </Link>
        <Link to="/admin/quizzes/new" className="admin-btn">
          {t('adminQuizNew')}
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
                <th>Slug</th>
                <th>{t('adminColTitle')}</th>
                <th>{t('testsQuestionCount')}</th>
                <th>{t('adminColStatus')}</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((quiz) => (
                <tr key={quiz.id}>
                  <td>{quiz.id}</td>
                  <td>{quiz.slug}</td>
                  <td>{quiz.title_ru || quiz.title_en}</td>
                  <td>{quiz.question_count}</td>
                  <td>
                    <span className={`admin-status admin-status--${quiz.status}`}>{quiz.status}</span>
                  </td>
                  <td className="admin-actions admin-actions--inline">
                    {quiz.status === 'published' ? (
                      <a href={`/${lang}/tests/${quiz.slug}`} target="_blank" rel="noreferrer">
                        {t('testsStart')}
                      </a>
                    ) : null}
                    <Link to={`/admin/quizzes/${quiz.id}/edit`}>{t('adminQuizEdit')}</Link>
                    <button type="button" onClick={() => void onDelete(quiz.id)}>
                      {t('adminDelete')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
