import { Link } from 'react-router-dom'

type Props = {
  title: string
  description: string
  code?: string
  actionLabel: string
  actionTo?: string
  retryLabel?: string
  onRetry?: () => void
}

export default function ErrorState({
  title,
  description,
  code,
  actionLabel,
  actionTo = '/',
  retryLabel,
  onRetry,
}: Props) {
  return (
    <section className="error-state" role="alert">
      {code ? <p className="error-state__code">{code}</p> : null}
      <h1 className="error-state__title">{title}</h1>
      <p className="error-state__desc">{description}</p>
      <div className="error-state__actions">
        {retryLabel && onRetry ? (
          <button type="button" className="error-state__btn error-state__btn--ghost" onClick={onRetry}>
            {retryLabel}
          </button>
        ) : null}
        <Link to={actionTo} className="error-state__btn error-state__btn--primary">
          {actionLabel}
        </Link>
      </div>
    </section>
  )
}
