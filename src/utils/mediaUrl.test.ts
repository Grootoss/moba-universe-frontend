import { describe, expect, it } from 'vitest'
import { coverCandidateUrls, resolveListCoverUrl, resolvePromoCoverUrl } from './mediaUrl'

describe('resolveListCoverUrl', () => {
  it('keeps an explicit small thumb', () => {
    expect(resolveListCoverUrl('/images/article-9.png', '/images/thumbs/hilda-10.jpg')).toBe(
      '/images/thumbs/hilda-10.jpg',
    )
  })

  it('rewrites a full-size file stored as the thumb', () => {
    expect(resolveListCoverUrl('/images/article-13.png', '/images/article-13.png')).toBe(
      '/images/thumbs/article-13.jpg',
    )
  })

  it('derives a thumb when only the cover is set', () => {
    expect(resolveListCoverUrl('/images/roles-03.png', null)).toBe('/images/thumbs/roles-03.jpg')
  })

  it('keeps a remote thumb', () => {
    expect(resolveListCoverUrl(null, 'https://cdn.example/thumb.jpg')).toBe('https://cdn.example/thumb.jpg')
  })
})

describe('coverCandidateUrls', () => {
  it('tries the phone crop, then the small thumb, then the full cover', () => {
    expect(coverCandidateUrls('/images/article-13.png', '/images/article-13.png', 'mobile', 'list')).toEqual([
      '/images/promo/mobile/article-13.jpg',
      '/images/thumbs/article-13.jpg',
      '/images/article-13.png',
    ])
  })

  it('does not request a promo crop on desktop lists', () => {
    expect(coverCandidateUrls('/images/article-8.png', '/images/thumbs/party-09.jpg', 'desktop', 'list')).toEqual([
      '/images/thumbs/party-09.jpg',
      '/images/article-8.png',
    ])
  })

  it('uses the cover stem for tablet crops even when the list thumb has another name', () => {
    expect(resolvePromoCoverUrl('/images/article-9.png', 'tablet')).toBe('/images/promo/tablet/article-9.jpg')
    expect(coverCandidateUrls('/images/article-9.png', '/images/thumbs/hilda-10.jpg', 'tablet', 'hero')[0]).toBe(
      '/images/promo/tablet/article-9.jpg',
    )
  })
})
