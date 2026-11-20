import { cachedJson, peekCached } from './cache'
import type { QuizCard, QuizLang, QuizPublic, QuizSubmitResult } from '../types/quiz'

function langOf(lang: string | undefined): QuizLang {
  return lang === 'en' ? 'en' : 'ru'
}

export function quizGame(game?: string | null): string {
  return game || 'mlbb'
}

export function quizListPath(lang: string, game?: string | null): string {
  return `/${lang}/tests/${quizGame(game)}`
}

export function quizStartPath(lang: string, slug: string, game?: string | null): string {
  return `${quizListPath(lang, game)}/${slug}`
}

export function quizPlayPath(lang: string, slug: string, game?: string | null): string {
  return `${quizStartPath(lang, slug, game)}/play`
}

export function quizzesUrl(lang: string | undefined, game?: string): string {
  const params = new URLSearchParams({ lang: langOf(lang) })
  if (game) params.set('game', game)
  return `/api/quizzes?${params}`
}

export function peekQuizzes(lang: string | undefined, game = 'mlbb'): QuizCard[] | undefined {
  return peekCached<QuizCard[]>(quizzesUrl(lang, game))
}

export function fetchQuizzes(lang: string | undefined, game = 'mlbb'): Promise<QuizCard[]> {
  return cachedJson<QuizCard[]>(quizzesUrl(lang, game))
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
