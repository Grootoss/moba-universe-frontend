import { useTranslation } from 'react-i18next'

type Props = {
  page: number
  pageSize: number
  total: number
  onPage: (page: number) => void
}

export default function AdminPager({ page, pageSize, total, onPage }: Props) {
  const { t } = useTranslation()
  const pages = Math.max(1, Math.ceil(total / pageSize))
  if (total === 0) return null
  return (
    <div className="admin-pager">
      <button type="button" className="admin-btn admin-btn--ghost" disabled={page <= 1} onClick={() => onPage(page - 1)}>
        {t('adminPagePrev')}
      </button>
      <span>{t('adminPageOf', { page, pages })}</span>
      <button
        type="button"
        className="admin-btn admin-btn--ghost"
        disabled={page >= pages}
        onClick={() => onPage(page + 1)}
      >
        {t('adminPageNext')}
      </button>
    </div>
  )
}
