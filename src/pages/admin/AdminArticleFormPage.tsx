import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  createAdminArticle,
  fetchAdminArticle,
  fetchAdminCategories,
  updateAdminArticle,
} from '../../api/admin'
import type { AdminCategory, ArticleFormPayload } from '../../types/profile'
import { usePageTitle } from '../../hooks/usePageTitle'
import { resolveMediaUrl } from '../../utils/mediaUrl'

export default function AdminArticleFormPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id } = useParams()

  const articleId = useMemo(() => {
    if (!id) return null
    const n = Number(id)
    return Number.isFinite(n) ? n : null
  }, [id])

  const isEdit = articleId !== null

  const [categories, setCategories] = useState<AdminCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [formError, setFormError] = useState('')
  const [slug, setSlug] = useState('')
  const [categorySlug, setCategorySlug] = useState('')
  const [status, setStatus] = useState('published')
  const [coverImage, setCoverImage] = useState('')
  const [coverThumb, setCoverThumb] = useState('')
  const [titleRu, setTitleRu] = useState('')
  const [excerptRu, setExcerptRu] = useState('')
  const [contentRu, setContentRu] = useState('')
  const [mlbbExampleRu, setMlbbExampleRu] = useState('')
  const [titleEn, setTitleEn] = useState('')
  const [excerptEn, setExcerptEn] = useState('')
  const [contentEn, setContentEn] = useState('')
  const [mlbbExampleEn, setMlbbExampleEn] = useState('')

  usePageTitle(isEdit ? t('adminArticleEdit') : t('adminArticleNew'))

  const toPayload = (): ArticleFormPayload => ({
    slug: slug.trim(),
    category_slug: categorySlug || null,
    status,
    cover_image: coverImage.trim() || null,
    cover_thumb: coverThumb.trim() || null,
    translations: {
      ru: {
        title: titleRu.trim(),
        excerpt: excerptRu.trim(),
        content: contentRu.trim(),
        mlbb_example: mlbbExampleRu.trim(),
      },
      en: {
        title: titleEn.trim(),
        excerpt: excerptEn.trim(),
        content: contentEn.trim(),
        mlbb_example: mlbbExampleEn.trim(),
      },
    },
  })

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError('')
      setFormError('')
      try {
        const cats = await fetchAdminCategories()
        setCategories(cats)
        if (isEdit && articleId) {
          const a = await fetchAdminArticle(articleId)
          setSlug(a.slug)
          setCategorySlug(a.category || '')
          setStatus(a.status)
          setCoverImage(a.cover_image || '')
          setCoverThumb(a.cover_thumb || '')
          setTitleRu(a.title_ru || '')
          setExcerptRu(a.excerpt_ru || '')
          setContentRu(a.content_ru || '')
          setMlbbExampleRu(a.mlbb_example_ru || '')
          setTitleEn(a.title_en || '')
          setExcerptEn(a.excerpt_en || '')
          setContentEn(a.content_en || '')
          setMlbbExampleEn(a.mlbb_example_en || '')
        } else if (cats[0]) {
          setCategorySlug(cats[0].slug)
        }
      } catch {
        setError(t('adminLoadError'))
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [articleId, isEdit, t])

  const onSave = async () => {
    setFormError('')
    if (!slug.trim()) {
      setFormError(t('adminArticleSlugRequired'))
      return
    }
    if (!titleRu.trim() || !contentRu.trim()) {
      setFormError(t('adminArticleRuRequired'))
      return
    }
    if (!titleEn.trim() || !contentEn.trim()) {
      setFormError(t('adminArticleEnRequired'))
      return
    }
    setSaving(true)
    try {
      const payload = toPayload()
      if (isEdit && articleId) await updateAdminArticle(articleId, payload)
      else await createAdminArticle(payload)
      void navigate('/admin/articles')
    } catch (e) {
      setFormError(e instanceof Error ? e.message : t('adminSaveError'))
    } finally {
      setSaving(false)
    }
  }

  const coverPreviewSrc = resolveMediaUrl(coverImage)

  return (
    <div className="admin-page">
      <header className="admin-page__hero">
        <h1 className="admin-page__title">{isEdit ? t('adminArticleEdit') : t('adminArticleNew')}</h1>
      </header>

      <div className="admin-page__toolbar">
        <Link to="/admin/articles" className="admin-back">
          ← {t('adminNavArticles')}
        </Link>
      </div>

      {loading ? (
        <p className="state">{t('loading')}</p>
      ) : error ? (
        <p className="admin-login__error">{error}</p>
      ) : (
        <section className="admin-form">
          {formError ? <p className="admin-login__error">{formError}</p> : null}

          <div className="admin-form__grid">
            <label className="admin-field">
              <span>Slug</span>
              <input type="text" placeholder="my-guide-slug" value={slug} onChange={(e) => setSlug(e.target.value)} />
            </label>
            <label className="admin-field">
              <span>{t('adminColStatus')}</span>
              <select value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="published">published</option>
                <option value="draft">draft</option>
              </select>
            </label>
            <label className="admin-field">
              <span>{t('adminArticleCategory')}</span>
              <select value={categorySlug} onChange={(e) => setCategorySlug(e.target.value)}>
                <option value="">—</option>
                {categories.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.slug} ({c.name_ru})
                  </option>
                ))}
              </select>
            </label>
            <label className="admin-field admin-field--wide">
              <span>{t('adminArticleCover')}</span>
              <input
                type="text"
                placeholder="/images/roles-03.png"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
              />
              {coverPreviewSrc ? (
                <figure className="admin-cover-preview">
                  <img src={coverPreviewSrc} alt="" />
                </figure>
              ) : null}
            </label>
            <label className="admin-field admin-field--wide">
              <span>{t('adminArticleCoverThumb')}</span>
              <input
                type="text"
                placeholder="/images/thumbs/roles-03.jpg"
                value={coverThumb}
                onChange={(e) => setCoverThumb(e.target.value)}
              />
            </label>
          </div>

          <p className="admin-hint">{t('adminArticleCoverHint')}</p>

          <div className="admin-form__langs">
            <fieldset className="admin-lang-block">
              <legend>RU</legend>
              <label className="admin-field">
                <span>{t('adminColTitle')}</span>
                <input type="text" value={titleRu} onChange={(e) => setTitleRu(e.target.value)} />
              </label>
              <label className="admin-field">
                <span>{t('adminArticleExcerpt')}</span>
                <input type="text" value={excerptRu} onChange={(e) => setExcerptRu(e.target.value)} />
              </label>
              <label className="admin-field">
                <span>{t('adminArticleContent')}</span>
                <textarea rows={12} value={contentRu} onChange={(e) => setContentRu(e.target.value)} />
              </label>
              <label className="admin-field">
                <span>{t('adminArticleMlbbExample')}</span>
                <textarea rows={8} value={mlbbExampleRu} onChange={(e) => setMlbbExampleRu(e.target.value)} />
              </label>
            </fieldset>

            <fieldset className="admin-lang-block">
              <legend>EN</legend>
              <label className="admin-field">
                <span>{t('adminColTitle')}</span>
                <input type="text" value={titleEn} onChange={(e) => setTitleEn(e.target.value)} />
              </label>
              <label className="admin-field">
                <span>{t('adminArticleExcerpt')}</span>
                <input type="text" value={excerptEn} onChange={(e) => setExcerptEn(e.target.value)} />
              </label>
              <label className="admin-field">
                <span>{t('adminArticleContent')}</span>
                <textarea rows={12} value={contentEn} onChange={(e) => setContentEn(e.target.value)} />
              </label>
              <label className="admin-field">
                <span>{t('adminArticleMlbbExampleEn')}</span>
                <textarea rows={8} value={mlbbExampleEn} onChange={(e) => setMlbbExampleEn(e.target.value)} />
              </label>
            </fieldset>
          </div>

          <p className="admin-hint">{t('adminArticleHtmlHint')}</p>

          <div className="admin-form__actions">
            <button type="button" className="admin-btn" disabled={saving} onClick={() => void onSave()}>
              {saving ? t('loading') : t('adminSave')}
            </button>
            <Link to="/admin/articles" className="admin-btn admin-btn--ghost">
              {t('adminCancel')}
            </Link>
          </div>
        </section>
      )}
    </div>
  )
}
