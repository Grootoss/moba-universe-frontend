# Moba Universe — Frontend

Клиентская часть [mobauniverse.com](https://mobauniverse.com). SPA после выделения из монолита; API — [moba-universe-backend](https://github.com/Grootoss/moba-universe-backend).

## О проекте

Одностраничное приложение с двумя языками (RU/EN): раздел гайдов (`/evergreen`), публичные профили игроков, каталог пользователей, регистрация и личный кабинет, админка для статей и модерации профилей. Юридические страницы — privacy и terms с disclaimer о fan-site статусе.

Интерфейс ориентирован на MOBA-сообщество: профили с играми и рангами, редакционные гайды без привязки брендинга к конкретной игре в UI и SEO.

## Технологии

- **React 19** + **TypeScript**
- **Vite** — сборка и dev-server с proxy на API
- **React Router 7** — маршруты `/ru` и `/en`, legacy-редиректы без языка в URL
- **i18next** — локализация интерфейса и legal-текстов
- **Playwright** — build-time prerender публичных страниц (title, meta, OG, JSON-LD)
- **Nginx** — production-раздача статики и прокси `/api`, `/sitemap.xml`, `/robots.txt`

## Архитектура и подходы

- **Lang-first routing** — все публичные URL с префиксом `/ru` или `/en`; canonical и hreflang через `useSeoRoute`
- **SEO** — `usePageTitle` и JSON-LD на страницах; prerender снимает HTML для краулеров; сигнал `__PRERENDER_READY__` для стабильного snapshot
- **Тема и язык** — localStorage, без лишних запросов к серверу
- **Cookie consent** — аналитика (Яндекс.Метрика) только после согласия
- **Admin** — отдельный layout, guard по роли (`admin` / `moderator` / `user`)
- **Стили** — CSS-переменные, light/dark theme, mobile menu

## Основные разделы

| Раздел | Путь |
|--------|------|
| Гайды | `/ru/evergreen`, `/en/evergreen` |
| Статья | `/…/evergreen/{slug}` |
| Профиль | `/…/user/{id}` |
| Пользователи | `/…/users` |
| Кабинет | `/…/profile` |
| Админка | `/admin` |
| Legal | `/…/privacy`, `/…/terms` |

## Сборка

Production-сборка включает TypeScript-check, Vite bundle и prerender по данным API (статьи, пользователи). Docker-образ на базе Nginx отдаёт prerendered HTML и SPA fallback.
