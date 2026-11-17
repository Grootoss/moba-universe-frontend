# Moba Universe - Frontend

Клиентская часть [mobauniverse.com](https://mobauniverse.com). SPA после выделения из монолита; API - [moba-universe-backend](https://github.com/Grootoss/moba-universe-backend).

## О проекте

Одностраничное приложение с двумя языками (RU/EN): раздел гайдов (`/evergreen`), публичные профили игроков, каталог пользователей, регистрация и личный кабинет, админка для статей и модерации профилей. Юридические страницы - privacy и terms с disclaimer о fan-site статусе.

Интерфейс ориентирован на MOBA-сообщество: профили с играми и рангами, редакционные гайды без привязки брендинга к конкретной игре в UI и SEO.

## Технологии

- **React 19** + **TypeScript**
- **Vite** - сборка и dev-server с proxy на API
- **React Router 7** - маршруты `/ru` и `/en`, legacy-редиректы без языка в URL
- **i18next** - локализация интерфейса и legal-текстов
- **Playwright** - build-time prerender публичных страниц (title, meta, OG, JSON-LD)
- **Nginx** - production-раздача статики и прокси `/api`, `/sitemap.xml`, `/robots.txt`

## Архитектура и подходы

- **Lang-first routing** - все публичные URL с префиксом `/ru` или `/en`; canonical и hreflang через `useSeoRoute`
- **SEO** - `usePageTitle` и JSON-LD на страницах; prerender снимает HTML для краулеров; сигнал `__PRERENDER_READY__` для стабильного snapshot
- **Тема и язык** - localStorage, без лишних запросов к серверу
- **Cookie consent** - аналитика (Яндекс.Метрика) только после согласия
- **Admin** - отдельный layout, guard по роли (`admin` / `moderator` / `user`)
- **Стили** - CSS-переменные, light/dark theme, mobile menu

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

## Превью гайдов

Полный кадр лежит в `public/images/имя.png`. В админке в поле обложки указывается `/images/имя.png`.

`npm run build` (скрипт `promo:covers`) дорисовывает только отсутствующие файлы:

| Куда | Размер | Где видно |
|------|--------|-----------|
| `public/images/thumbs/имя.jpg` | ширина 320 | список на компьютере |
| `public/images/promo/mobile/имя.jpg` | 640×360, обрезка по центру | телефон |
| `public/images/promo/tablet/имя.jpg` | 1024×576, обрезка по центру | планшет |

Своё превью списка — отдельный файл в `public/images/thumbs/` и путь во втором поле админки. Уже существующие jpg сборка не перезаписывает. После новых файлов нужен редеплой фронтенда: картинки отдаёт nginx из образа, не API.

## Сертификат

Порт 80 занят nginx этого сайта, поэтому certbot в режиме standalone не продлевается. Продление идёт через webroot: nginx уже отдаёт `/.well-known/acme-challenge/` из `/var/www/certbot`.

На VPS один раз, от root:

```bash
sh deploy/renew-cert.sh --install-cron
```

Контейнер фронтенда должен монтировать `/etc/letsencrypt` и `/var/www/certbot`. Скрипт проверяет, что пробный файл с диска виден по HTTP, переключает сохранённый способ продления на webroot и ставит ежедневный cron. Certbot сам выпускает новый сертификат примерно за 30 дней до конца срока. После замены файла nginx перечитывает сертификат (скрипт `docker/50-reload-certs.sh`).
