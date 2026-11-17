export type QuizLang = 'ru' | 'en'

export type QuizCard = {
  slug: string
  title: string
  description: string
  question_count: number
}

export type QuizOptionPublic = {
  id: number
  text: string
}

export type QuizQuestionPublic = {
  id: number
  image: string | null
  prompt: string
  multiple: boolean
  options: QuizOptionPublic[]
}

export type QuizPublic = {
  slug: string
  title: string
  description: string
  questions: QuizQuestionPublic[]
}

export type QuizOptionReview = {
  id: number
  text: string
  is_correct: boolean
  selected: boolean
}

export type QuizQuestionReview = {
  id: number
  image: string | null
  prompt: string
  explanation: string
  correct: boolean
  options: QuizOptionReview[]
}

export type QuizSubmitResult = {
  score: number
  total: number
  result: { title: string; body: string } | null
  questions: QuizQuestionReview[]
}

export type QuizOptionDraft = {
  textRu: string
  textEn: string
  isCorrect: boolean
}

export type QuizQuestionDraft = {
  image: string
  promptRu: string
  promptEn: string
  explanationRu: string
  explanationEn: string
  options: QuizOptionDraft[]
}

export type QuizResultDraft = {
  minCorrect: number
  maxCorrect: number
  titleRu: string
  titleEn: string
  bodyRu: string
  bodyEn: string
}

export type QuizFormPayload = {
  slug: string
  status: string
  translations: {
    ru: { title: string; description: string }
    en: { title: string; description: string }
  }
  questions: Array<{
    image: string | null
    translations: {
      ru: { prompt: string; explanation: string }
      en: { prompt: string; explanation: string }
    }
    options: Array<{
      is_correct: boolean
      translations: {
        ru: { text: string }
        en: { text: string }
      }
    }>
  }>
  results: Array<{
    min_correct: number
    max_correct: number
    translations: {
      ru: { title: string; body: string }
      en: { title: string; body: string }
    }
  }>
}

export type AdminQuizCard = {
  id: number
  slug: string
  status: string
  title_ru: string
  title_en: string
  question_count: number
}

export type AdminQuiz = QuizFormPayload & {
  id: number
  question_count: number
}
