import { Link } from 'react-router-dom'

type Props = {
  title: string
  description: string
  code?: string
  actionLabel?: string
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
  const showRetry = Boolean(retryLabel && onRetry)
  const showAction = Boolean(actionLabel)

  return (
    <section className="error-state" role="alert">
      {code ? <p className="error-state__code">{code}</p> : null}
      <h1 className="error-state__title">{title}</h1>
      <p className="error-state__desc">{description}</p>
      {showRetry || showAction ? (
        <div className="error-state__actions">
          {showRetry ? (
            <button
              type="button"
              className={`error-state__btn${showAction ? ' error-state__btn--ghost' : ' error-state__btn--primary'}`}
              onClick={onRetry}
            >
              {retryLabel}
            </button>
          ) : null}
          {showAction ? (
            <Link to={actionTo} className="error-state__btn error-state__btn--primary">
              {actionLabel}
            </Link>
          ) : null}
        </div>
      ) : null}
    </section>
  )
}
