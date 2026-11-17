import { cachedJson, peekCached } from './cache'
import type { QuizCard, QuizFormPayload, QuizLang, QuizPublic, QuizSubmitResult } from '../types/quiz'

function langOf(lang: string | undefined): QuizLang {
  return lang === 'en' ? 'en' : 'ru'
}

export function quizzesUrl(lang: string | undefined): string {
  return `/api/quizzes?lang=${langOf(lang)}`
}

export function peekQuizzes(lang: string | undefined): QuizCard[] | undefined {
  return peekCached<QuizCard[]>(quizzesUrl(lang))
}

export function fetchQuizzes(lang: string | undefined): Promise<QuizCard[]> {
  return cachedJson<QuizCard[]>(quizzesUrl(lang))
}

export async function fetchQuizPreview(slug: string, lang: string | undefined): Promise<QuizCard> {
  const response = await fetch(`/api/quizzes/${encodeURIComponent(slug)}/preview?lang=${langOf(lang)}`)
  if (!response.ok) throw new Error('Test not found')
  return response.json()
}

export async function fetchQuiz(slug: string, lang: string | undefined): Promise<QuizPublic> {
  const response = await fetch(`/api/quizzes/${encodeURIComponent(slug)}?lang=${langOf(lang)}`)
  if (!response.ok) throw new Error('Test not found')
  return response.json()
}

export async function submitQuiz(
  slug: string,
  lang: string | undefined,
  answers: Array<{ question_id: number; option_ids: number[] }>,
): Promise<QuizSubmitResult> {
  const response = await fetch(`/api/quizzes/${encodeURIComponent(slug)}/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ lang: langOf(lang), answers }),
  })
  if (!response.ok) throw new Error('Failed to submit test')
  return response.json()
}

export function quizPayload(input: {
  slug: string
  status: string
  titleRu: string
  titleEn: string
  descriptionRu: string
  descriptionEn: string
  questions: QuizFormPayload['questions']
  results: QuizFormPayload['results']
}): QuizFormPayload {
  return {
    slug: input.slug.trim(),
    status: input.status,
    translations: {
      ru: { title: input.titleRu.trim(), description: input.descriptionRu.trim() },
      en: { title: input.titleEn.trim(), description: input.descriptionEn.trim() },
    },
    questions: input.questions,
    results: input.results,
  }
}
