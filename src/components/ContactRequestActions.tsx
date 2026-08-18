import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { acceptContact, declineContact } from '../api/contacts'
import type { ContactItem } from '../types/profile'

type Props = {
  item: ContactItem
  onUpdated: (item: ContactItem, action: 'accept' | 'decline') => void | Promise<void>
}

export default function ContactRequestActions({ item, onUpdated }: Props) {
  const { t } = useTranslation()
  const [busy, setBusy] = useState<'accept' | 'decline' | null>(null)

  if (item.status !== 'pending' || item.direction !== 'incoming') return null

  const run = async (action: 'accept' | 'decline') => {
    setBusy(action)
    try {
      const next = action === 'accept' ? await acceptContact(item.request_id) : await declineContact(item.request_id)
      await onUpdated(next, action)
    } catch {
      setBusy(null)
      return
    }
    setBusy(null)
  }

  return (
    <span className="contacts-actions">
      <button type="button" className="admin-btn" disabled={busy !== null} onClick={() => void run('accept')}>
        {busy === 'accept' ? t('loading') : t('contactsSendMine')}
      </button>
      <button type="button" className="admin-btn admin-btn--ghost" disabled={busy !== null} onClick={() => void run('decline')}>
        {busy === 'decline' ? t('loading') : t('contactsDecline')}
      </button>
    </span>
  )
}
