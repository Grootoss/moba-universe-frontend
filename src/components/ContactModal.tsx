import type { SocialContact } from '../types/profile'

type Props = {
  title: string
  nickname: string
  contacts: SocialContact[] | null
  emptyText: string
  closeLabel: string
  onClose: () => void
}

export default function ContactModal({ title, nickname, contacts, emptyText, closeLabel, onClose }: Props) {
  return (
    <div className="contact-modal" role="dialog" aria-modal="true" aria-labelledby="contact-modal-title">
      <button type="button" className="contact-modal__backdrop" aria-label={closeLabel} onClick={onClose} />
      <div className="contact-modal__panel">
        <div className="contact-modal__head">
          <h2 id="contact-modal-title" className="contact-modal__title">
            {title}: {nickname}
          </h2>
          <button type="button" className="mobile-menu__close" aria-label={closeLabel} onClick={onClose}>
            ✕
          </button>
        </div>
        {contacts?.length ? (
          <ul className="contact-modal__list">
            {contacts.map((c) => (
              <li key={`${c.label}-${c.url}`}>
                <span className="contact-modal__label">{c.label}</span>
                <a href={c.url} target="_blank" rel="noopener noreferrer">
                  {c.url}
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="contact-modal__empty">{emptyText}</p>
        )}
      </div>
    </div>
  )
}
