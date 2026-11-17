import { fetchArticlesPage, GUIDES_LIST_PAGE_SIZE } from './articles'
import { fetchCategories } from './categories'
import { fetchQuizzes } from './quizzes'
import { fetchPublicUsers } from './users'

export function prefetchPublicSections(lang: string | undefined) {
  const language = lang === 'en' ? 'en' : 'ru'
  void fetchCategories()
  void fetchArticlesPage({ lang: language, page: 1, pageSize: GUIDES_LIST_PAGE_SIZE })
  void fetchPublicUsers()
  void fetchQuizzes(language)
}
