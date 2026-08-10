/** Public user profile types */

export interface GameRank {
  game: 'mlbb' | 'lol' | string
  rank: string
  sort_order: number
}

export interface PublicProfile {
  id: number
  user_id: number
  nickname: string
  bio: string
  telegram_url: string | null
  social_links: Record<string, string>
  games: GameRank[]
  moderation_status?: string | null
  is_public?: boolean | null
}

export interface OwnProfile extends PublicProfile {
  moderation_status: 'draft' | 'pending' | 'approved' | 'rejected' | string
  moderation_note: string
  is_public: boolean
  profile_edit_unlocked: boolean
  can_edit: boolean
}

export interface AdminProfile extends PublicProfile {
  email?: string | null
  username?: string | null
  moderation_status: 'draft' | 'pending' | 'approved' | 'rejected' | string
  moderation_note: string
  is_public: boolean
  profile_edit_unlocked: boolean
}

export interface AuthUser {
  id: number
  email: string
  username: string
  role: string
  profile_edit_unlocked: boolean
}

export interface TokenPair {
  access_token: string
  refresh_token: string
  token_type: string
}

export interface ProfileUpdatePayload {
  nickname: string
  bio: string
  telegram_url?: string | null
}

export interface ProfileGamesPayload {
  games: GameRank[]
}

export interface ProfileOptions {
  games: { slug: string; name_ru: string; name_en: string }[]
  ranks: Record<string, string[]>
}

export interface AdminArticle {
  id: number
  slug: string
  status: string
  category: string | null
  cover_image?: string | null
  title_ru: string | null
  title_en: string | null
  excerpt_ru?: string | null
  excerpt_en?: string | null
  content_ru?: string | null
  content_en?: string | null
}

export interface AdminCategory {
  slug: string
  name_ru: string
  name_en: string
}

export interface ArticleFormPayload {
  slug: string
  category_slug: string | null
  status: string
  cover_image?: string | null
  translations: {
    ru: { title: string; excerpt: string; content: string }
    en: { title: string; excerpt: string; content: string }
  }
}
