import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { createAdminQuiz, fetchAdminQuiz, updateAdminQuiz } from '../../api/admin'
import type { QuizFormPayload, QuizOptionDraft, QuizQuestionDraft, QuizResultDraft } from '../../types/quiz'
import { usePageTitle } from '../../hooks/usePageTitle'
import { resolveMediaUrl } from '../../utils/mediaUrl'

function blankOption(correct = false): QuizOptionDraft {
  return { textRu: '', textEn: '', isCorrect: correct }
}

function blankQuestion(): QuizQuestionDraft {
  return {
    image: '',
    promptRu: '',
    promptEn: '',
    explanationRu: '',
    explanationEn: '',
    options: [blankOption(true), blankOption(false)],
  }
}

function blankResult(): QuizResultDraft {
  return { minCorrect: 0, maxCorrect: 0, titleRu: '', titleEn: '', bodyRu: '', bodyEn: '' }
}

function moveItem<T>(items: T[], index: number, direction: -1 | 1): T[] {
  const next = index + direction
  if (next < 0 || next >= items.length) return items
  const copy = items.slice()
  const [item] = copy.splice(index, 1)
  copy.splice(next, 0, item)
  return copy
}

export default function AdminQuizFormPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id } = useParams()
  const quizId = useMemo(() => {
    if (!id) return null
    const value = Number(id)
    return Number.isFinite(value) ? value : null
  }, [id])
  const isEdit = quizId !== null

  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [formError, setFormError] = useState('')
  const [slug, setSlug] = useState('')
  const [status, setStatus] = useState('draft')
  const [titleRu, setTitleRu] = useState('')
  const [titleEn, setTitleEn] = useState('')
  const [descriptionRu, setDescriptionRu] = useState('')
  const [descriptionEn, setDescriptionEn] = useState('')
  const [questions, setQuestions] = useState<QuizQuestionDraft[]>([])
  const [results, setResults] = useState<QuizResultDraft[]>([])

  usePageTitle(isEdit ? t('adminQuizEdit') : t('adminQuizNew'))

  useEffect(() => {
    if (!isEdit || quizId === null) return
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const quiz = await fetchAdminQuiz(quizId)
        setSlug(quiz.slug)
        setStatus(quiz.status)
        setTitleRu(quiz.translations.ru?.title || '')
        setTitleEn(quiz.translations.en?.title || '')
        setDescriptionRu(quiz.translations.ru?.description || '')
        setDescriptionEn(quiz.translations.en?.description || '')
        setQuestions(
          quiz.questions.map((question) => ({
            image: question.image || '',
            promptRu: question.translations.ru?.prompt || '',
            promptEn: question.translations.en?.prompt || '',
            explanationRu: question.translations.ru?.explanation || '',
            explanationEn: question.translations.en?.explanation || '',
            options: question.options.map((option) => ({
              textRu: option.translations.ru?.text || '',
              textEn: option.translations.en?.text || '',
              isCorrect: option.is_correct,
            })),
          })),
        )
        setResults(
          quiz.results.map((result) => ({
            minCorrect: result.min_correct,
            maxCorrect: result.max_correct,
            titleRu: result.translations.ru?.title || '',
            titleEn: result.translations.en?.title || '',
            bodyRu: result.translations.ru?.body || '',
            bodyEn: result.translations.en?.body || '',
          })),
        )
      } catch {
        setError(t('adminLoadError'))
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [isEdit, quizId, t])

  const updateQuestion = (index: number, patch: Partial<QuizQuestionDraft>) => {
    setQuestions((current) => current.map((question, i) => (i === index ? { ...question, ...patch } : question)))
  }

  const updateOption = (questionIndex: number, optionIndex: number, patch: Partial<QuizOptionDraft>) => {
    setQuestions((current) =>
      current.map((question, i) => {
        if (i !== questionIndex) return question
        return {
          ...question,
          options: question.options.map((option, j) => (j === optionIndex ? { ...option, ...patch } : option)),
        }
      }),
    )
  }

  const onSave = async () => {
    setFormError('')
    if (!slug.trim() || !titleRu.trim() || !titleEn.trim()) {
      setFormError(t('adminQuizPublishedRules'))
      return
    }
    if (questions.length > 20) {
      setFormError(t('adminQuizLimit'))
      return
    }
    for (const question of questions) {
      if (!question.promptRu.trim() || !question.promptEn.trim() || question.options.length < 2) {
        setFormError(t('adminQuizQuestionsRequired'))
        return
      }
      if (!question.options.some((option) => option.isCorrect)) {
        setFormError(t('adminQuizOptionRequired'))
        return
      }
      if (question.options.some((option) => !option.textRu.trim() || !option.textEn.trim())) {
        setFormError(t('adminQuizOptionRequired'))
        return
      }
      if (status === 'published' && (!question.explanationRu.trim() || !question.explanationEn.trim())) {
        setFormError(t('adminQuizPublishedRules'))
        return
      }
    }
    if (status === 'published' && questions.length === 0) {
      setFormError(t('adminQuizPublishedRules'))
      return
    }

    for (const question of questions) {
      const image = question.image.trim()
      if (image && !image.startsWith('/') && !image.startsWith('http://') && !image.startsWith('https://')) {
        setFormError(t('adminQuizImage'))
        return
      }
    }
    const filledResults = results.filter(
      (result) => result.titleRu.trim() || result.titleEn.trim() || result.bodyRu.trim() || result.bodyEn.trim(),
    )
    if (filledResults.some((result) => !result.titleRu.trim() || !result.titleEn.trim())) {
      setFormError(t('adminQuizPublishedRules'))
      return
    }

    const payload: QuizFormPayload = {
      slug: slug.trim().toLowerCase(),
      status,
      translations: {
        ru: { title: titleRu.trim(), description: descriptionRu.trim() },
        en: { title: titleEn.trim(), description: descriptionEn.trim() },
      },
      questions: questions.map((question) => ({
        image: question.image.trim() || null,
        translations: {
          ru: { prompt: question.promptRu.trim(), explanation: question.explanationRu.trim() },
          en: { prompt: question.promptEn.trim(), explanation: question.explanationEn.trim() },
        },
        options: question.options.map((option) => ({
          is_correct: option.isCorrect,
          translations: {
            ru: { text: option.textRu.trim() },
            en: { text: option.textEn.trim() },
          },
        })),
      })),
      results: filledResults.map((result) => ({
        min_correct: Number(result.minCorrect) || 0,
        max_correct: Number(result.maxCorrect) || 0,
        translations: {
          ru: { title: result.titleRu.trim(), body: result.bodyRu.trim() },
          en: { title: result.titleEn.trim(), body: result.bodyEn.trim() },
        },
      })),
    }

    setSaving(true)
    try {
      if (isEdit && quizId !== null) await updateAdminQuiz(quizId, payload)
      else await createAdminQuiz(payload)
      void navigate('/admin/quizzes')
    } catch (err) {
      setFormError(err instanceof Error ? err.message : t('adminSaveError'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="admin-page">
      <header className="admin-page__hero">
        <h1 className="admin-page__title">{isEdit ? t('adminQuizEdit') : t('adminQuizNew')}</h1>
      </header>
      <div className="admin-page__toolbar">
        <Link to="/admin/quizzes" className="admin-back">
          ← {t('adminNavQuizzes')}
        </Link>
      </div>

      {loading ? (
        <p className="state">{t('loading')}</p>
      ) : error ? (
        <p className="admin-login__error">{error}</p>
      ) : (
        <section className="admin-form">
          {formError ? <p className="admin-login__error">{formError}</p> : null}
          <p className="admin-page__subtitle">{t('adminQuizzesHint')}</p>

          <div className="admin-form__grid">
            <label className="admin-field">
              <span>Slug</span>
              <input value={slug} placeholder="roam-basics" onChange={(e) => setSlug(e.target.value)} />
            </label>
            <label className="admin-field">
              <span>{t('adminColStatus')}</span>
              <select value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="draft">draft</option>
                <option value="published">published</option>
              </select>
            </label>
            <label className="admin-field">
              <span>{t('adminQuizRu')} — {t('adminColTitle')}</span>
              <input value={titleRu} onChange={(e) => setTitleRu(e.target.value)} />
            </label>
            <label className="admin-field">
              <span>{t('adminQuizEn')} — {t('adminColTitle')}</span>
              <input value={titleEn} onChange={(e) => setTitleEn(e.target.value)} />
            </label>
            <label className="admin-field admin-field--wide">
              <span>{t('adminQuizRu')} — {t('testsDescription')}</span>
              <textarea rows={3} value={descriptionRu} onChange={(e) => setDescriptionRu(e.target.value)} />
            </label>
            <label className="admin-field admin-field--wide">
              <span>{t('adminQuizEn')} — {t('testsDescription')}</span>
              <textarea rows={3} value={descriptionEn} onChange={(e) => setDescriptionEn(e.target.value)} />
            </label>
          </div>

          <div className="quiz-admin__head">
            <h2>{t('adminQuizQuestions')}</h2>
            <button
              type="button"
              className="admin-btn"
              disabled={questions.length >= 20}
              onClick={() => setQuestions((current) => [...current, blankQuestion()])}
            >
              {t('adminQuizAddQuestion')}
            </button>
          </div>

          {questions.map((question, questionIndex) => {
            const preview = resolveMediaUrl(question.image)
            return (
              <article key={questionIndex} className="quiz-admin-card">
                <div className="quiz-admin-card__toolbar">
                  <strong>
                    {t('adminQuizQuestion')} {questionIndex + 1}
                  </strong>
                  <div className="quiz-admin-card__actions">
                    <button type="button" onClick={() => setQuestions((current) => moveItem(current, questionIndex, -1))}>
                      {t('adminQuizMoveUp')}
                    </button>
                    <button type="button" onClick={() => setQuestions((current) => moveItem(current, questionIndex, 1))}>
                      {t('adminQuizMoveDown')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuestions((current) => current.filter((_, i) => i !== questionIndex))}
                    >
                      {t('adminQuizRemoveQuestion')}
                    </button>
                  </div>
                </div>
                <label className="admin-field">
                  <span>{t('adminQuizImage')}</span>
                  <input
                    value={question.image}
                    placeholder="/images/roam-map.png"
                    onChange={(e) => updateQuestion(questionIndex, { image: e.target.value })}
                  />
                </label>
                {preview ? <img className="quiz-admin-card__preview" src={preview} alt="" /> : null}
                <label className="admin-field">
                  <span>{t('adminQuizPrompt')} (RU)</span>
                  <textarea rows={3} value={question.promptRu} onChange={(e) => updateQuestion(questionIndex, { promptRu: e.target.value })} />
                </label>
                <label className="admin-field">
                  <span>{t('adminQuizPrompt')} (EN)</span>
                  <textarea rows={3} value={question.promptEn} onChange={(e) => updateQuestion(questionIndex, { promptEn: e.target.value })} />
                </label>
                <label className="admin-field">
                  <span>{t('adminQuizExplanation')} (RU)</span>
                  <textarea
                    rows={3}
                    value={question.explanationRu}
                    onChange={(e) => updateQuestion(questionIndex, { explanationRu: e.target.value })}
                  />
                </label>
                <label className="admin-field">
                  <span>{t('adminQuizExplanation')} (EN)</span>
                  <textarea
                    rows={3}
                    value={question.explanationEn}
                    onChange={(e) => updateQuestion(questionIndex, { explanationEn: e.target.value })}
                  />
                </label>

                <div className="quiz-admin__head">
                  <h3>{t('adminQuizOptions')}</h3>
                  <button
                    type="button"
                    className="admin-btn admin-btn--ghost"
                    disabled={question.options.length >= 20}
                    onClick={() =>
                      updateQuestion(questionIndex, { options: [...question.options, blankOption(false)] })
                    }
                  >
                    {t('adminQuizAddOption')}
                  </button>
                </div>
                {question.options.map((option, optionIndex) => (
                  <div key={optionIndex} className="quiz-admin-option">
                    <label className="quiz-admin-option__correct">
                      <input
                        type="checkbox"
                        checked={option.isCorrect}
                        onChange={(e) => updateOption(questionIndex, optionIndex, { isCorrect: e.target.checked })}
                      />
                      <span>{t('adminQuizCorrect')}</span>
                    </label>
                    <label className="admin-field">
                      <span>RU</span>
                      <input
                        value={option.textRu}
                        onChange={(e) => updateOption(questionIndex, optionIndex, { textRu: e.target.value })}
                      />
                    </label>
                    <label className="admin-field">
                      <span>EN</span>
                      <input
                        value={option.textEn}
                        onChange={(e) => updateOption(questionIndex, optionIndex, { textEn: e.target.value })}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        updateQuestion(questionIndex, {
                          options: question.options.filter((_, i) => i !== optionIndex),
                        })
                      }
                    >
                      {t('adminQuizRemoveOption')}
                    </button>
                  </div>
                ))}
              </article>
            )
          })}

          <div className="quiz-admin__head">
            <h2>{t('adminQuizResults')}</h2>
            <button type="button" className="admin-btn" onClick={() => setResults((current) => [...current, blankResult()])}>
              {t('adminQuizAddResult')}
            </button>
          </div>
          {results.map((result, index) => (
            <article key={index} className="quiz-admin-card">
              <div className="quiz-admin-card__toolbar">
                <strong>
                  {t('adminQuizResultTitle')} {index + 1}
                </strong>
                <button type="button" onClick={() => setResults((current) => current.filter((_, i) => i !== index))}>
                  {t('adminQuizRemoveResult')}
                </button>
              </div>
              <div className="quiz-admin-range">
                <label className="admin-field">
                  <span>{t('adminQuizMin')}</span>
                  <input
                    type="number"
                    min={0}
                    max={20}
                    value={result.minCorrect}
                    onChange={(e) =>
                      setResults((current) =>
                        current.map((item, i) => (i === index ? { ...item, minCorrect: Number(e.target.value) } : item)),
                      )
                    }
                  />
                </label>
                <label className="admin-field">
                  <span>{t('adminQuizMax')}</span>
                  <input
                    type="number"
                    min={0}
                    max={20}
                    value={result.maxCorrect}
                    onChange={(e) =>
                      setResults((current) =>
                        current.map((item, i) => (i === index ? { ...item, maxCorrect: Number(e.target.value) } : item)),
                      )
                    }
                  />
                </label>
              </div>
              <label className="admin-field">
                <span>RU</span>
                <input
                  value={result.titleRu}
                  onChange={(e) =>
                    setResults((current) => current.map((item, i) => (i === index ? { ...item, titleRu: e.target.value } : item)))
                  }
                />
              </label>
              <label className="admin-field">
                <span>EN</span>
                <input
                  value={result.titleEn}
                  onChange={(e) =>
                    setResults((current) => current.map((item, i) => (i === index ? { ...item, titleEn: e.target.value } : item)))
                  }
                />
              </label>
              <label className="admin-field">
                <span>{t('adminQuizResultBody')} (RU)</span>
                <textarea
                  rows={3}
                  value={result.bodyRu}
                  onChange={(e) =>
                    setResults((current) => current.map((item, i) => (i === index ? { ...item, bodyRu: e.target.value } : item)))
                  }
                />
              </label>
              <label className="admin-field">
                <span>{t('adminQuizResultBody')} (EN)</span>
                <textarea
                  rows={3}
                  value={result.bodyEn}
                  onChange={(e) =>
                    setResults((current) => current.map((item, i) => (i === index ? { ...item, bodyEn: e.target.value } : item)))
                  }
                />
              </label>
            </article>
          ))}

          <button type="button" className="admin-btn" disabled={saving} onClick={() => void onSave()}>
            {saving ? t('loading') : t('adminSave')}
          </button>
        </section>
      )}
    </div>
  )
}
