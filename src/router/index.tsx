import { createBrowserRouter, Navigate, useParams } from 'react-router-dom'
import App from '../App'
import HomePage from '../pages/HomePage'
import ArticlesListPage from '../pages/ArticlesListPage'
import ArticlePage from '../pages/ArticlePage'
import LoginPage from '../pages/LoginPage'
import RegisterPage from '../pages/RegisterPage'
import ProfileCabinetPage from '../pages/ProfileCabinetPage'
import UserProfilePage from '../pages/UserProfilePage'
import UsersListPage from '../pages/UsersListPage'
import PrivacyPage from '../pages/PrivacyPage'
import TermsPage from '../pages/TermsPage'
import NotFoundPage from '../pages/NotFoundPage'
import AdminLoginPage from '../pages/admin/AdminLoginPage'
import AdminCabinetPage from '../pages/admin/AdminCabinetPage'
import AdminArticlesPage from '../pages/admin/AdminArticlesPage'
import AdminArticleFormPage from '../pages/admin/AdminArticleFormPage'
import AdminProfilesPage from '../pages/admin/AdminProfilesPage'
import {
  LangLayout,
  LegacyRedirect,
  RequireAdmin,
  RequireAuth,
  RequireStaff,
} from './guards'
import { getStoredLang, localizePath } from '../utils/lang'

function LegacyEvergreenArticleRedirect() {
  const { slug } = useParams()
  return <Navigate to={localizePath(`/evergreen/${slug ?? ''}`)} replace />
}

function LegacyUserRedirect() {
  const { id } = useParams()
  return <Navigate to={localizePath(`/user/${id ?? ''}`)} replace />
}

export const router = createBrowserRouter([
  {
    element: <App />,
    children: [
      { path: '/', element: <Navigate to={`/${getStoredLang()}`} replace /> },
      {
        path: '/:lang',
        element: <LangLayout />,
        children: [
          { index: true, element: <HomePage /> },
          { path: 'evergreen', element: <ArticlesListPage /> },
          { path: 'evergreen/:slug', element: <ArticlePage /> },
          { path: 'user/:id', element: <UserProfilePage /> },
          { path: 'users', element: <UsersListPage /> },
          { path: 'login', element: <LoginPage /> },
          { path: 'register', element: <RegisterPage /> },
          {
            path: 'profile',
            element: (
              <RequireAuth>
                <ProfileCabinetPage />
              </RequireAuth>
            ),
          },
          { path: 'privacy', element: <PrivacyPage /> },
          { path: 'terms', element: <TermsPage /> },
        ],
      },
      { path: '/evergreen', element: <LegacyRedirect to="/evergreen" /> },
      { path: '/evergreen/:slug', element: <LegacyEvergreenArticleRedirect /> },
      { path: '/user/:id', element: <LegacyUserRedirect /> },
      { path: '/users', element: <LegacyRedirect to="/users" /> },
      { path: '/login', element: <LegacyRedirect to="/login" /> },
      { path: '/register', element: <LegacyRedirect to="/register" /> },
      { path: '/profile', element: <LegacyRedirect to="/profile" /> },
      { path: '/privacy', element: <LegacyRedirect to="/privacy" /> },
      { path: '/terms', element: <LegacyRedirect to="/terms" /> },
      { path: '/admin/login', element: <AdminLoginPage /> },
      {
        path: '/admin',
        element: (
          <RequireStaff>
            <AdminCabinetPage />
          </RequireStaff>
        ),
      },
      {
        path: '/admin/articles',
        element: (
          <RequireAdmin>
            <AdminArticlesPage />
          </RequireAdmin>
        ),
      },
      {
        path: '/admin/articles/new',
        element: (
          <RequireAdmin>
            <AdminArticleFormPage />
          </RequireAdmin>
        ),
      },
      {
        path: '/admin/articles/:id/edit',
        element: (
          <RequireAdmin>
            <AdminArticleFormPage />
          </RequireAdmin>
        ),
      },
      {
        path: '/admin/profiles',
        element: (
          <RequireStaff>
            <AdminProfilesPage />
          </RequireStaff>
        ),
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
