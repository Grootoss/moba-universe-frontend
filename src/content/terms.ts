export interface TermsSection {
  title: string
  paragraphs?: string[]
  list?: string[]
}

export interface TermsDoc {
  title: string
  updatedLabel: string
  intro: string
  sections: TermsSection[]
  note: string
}

export const termsDocs: Record<'ru' | 'en', TermsDoc> = {
  ru: {
    title: 'Условия использования',
    updatedLabel: 'Дата обновления: 22.08.2026',
    intro:
      'Moba Universe — неофициальный fan-made сайт об MOBA-играх: главная страница, гайды и личные страницы пользователей. Мы не связаны с Moonton Technology Co., Ltd. и не одобрены ею. Материалы носят образовательный и информационный характер для игроков.',
    sections: [
      {
        title: 'Неофициальный статус',
        paragraphs: [
          'Сайт Moba Universe создан энтузиастами и не является официальным ресурсом какой-либо игры или издателя.',
          'Мы не представляем Moonton Technology Co., Ltd., не поддерживаемся ею и не действуем от её имени.',
          'Mobile Legends: Bang Bang, MLBB и связанные названия — товарные знаки Moonton. Все права на игры принадлежат их правообладателям.',
        ],
      },
      {
        title: 'Образовательный характер контента',
        paragraphs: [
          'Гайды, статьи и советы на Сайте предназначены для самообучения и развития навыков в MOBA.',
          'Контент не гарантирует конкретный результат в игре и не заменяет официальные материалы разработчиков.',
          'Мы стремимся публиковать точную и полезную информацию, но не несём ответственности за устаревшие данные после обновлений игр.',
        ],
      },
      {
        title: 'Профили игроков',
        paragraphs: [
          'Публичные профили создаются пользователями и проходят модерацию перед публикацией.',
          'Ранги и игры в профиле указываются пользователем добровольно. Сайт не проверяет игровые аккаунты и не связан с игровыми серверами.',
          'Не публикуйте чужие контакты и не используйте Сайт для спама, мошенничества или нарушения закона.',
        ],
      },
      {
        title: 'Ограничение ответственности',
        paragraphs: [
          'Сайт предоставляется «как есть». Мы не несём ответственности за решения, принятые на основе материалов Сайта.',
          'Использование Сайта не создаёт отношений с правообладателями игр, упомянутых в профилях или материалах.',
        ],
        list: [
          'Не используйте Сайт для нарушения правил игр или законодательства',
          'Не выдавайте себя за официального представителя Moonton или других издателей',
          'Не копируйте контент Сайта без указания источника, где это применимо',
        ],
      },
      {
        title: 'Контакты и изменения',
        paragraphs: [
          'По вопросам, связанным с Сайтом: the.grootoss@gmail.com',
          'Мы можем обновлять эти условия. Актуальная версия всегда доступна на странице /terms.',
          'Подробнее об обработке данных — в Политике конфиденциальности (/privacy).',
        ],
      },
    ],
    note: 'Используя Moba Universe, вы подтверждаете, что понимаете неофициальный fan-made характер проекта.',
  },
  en: {
    title: 'Terms of Use',
    updatedLabel: 'Last updated: 22 Aug 2026',
    intro:
      'Moba Universe is an unofficial fan-made website about MOBA games: a homepage, guides, and personal player pages. We are not affiliated with or endorsed by Moonton Technology Co., Ltd. Materials are for educational and informational purposes for players.',
    sections: [
      {
        title: 'Unofficial status',
        paragraphs: [
          'Moba Universe is created by enthusiasts and is not an official resource of any game or publisher.',
          'We do not represent Moonton Technology Co., Ltd., are not supported by them, and do not act on their behalf.',
          'Mobile Legends: Bang Bang, MLBB, and related names are trademarks of Moonton. All game rights belong to their respective owners.',
        ],
      },
      {
        title: 'Educational content',
        paragraphs: [
          'Guides, articles, and tips on the Site are intended for self-learning and skill development in MOBA games.',
          'Content does not guarantee specific in-game results and does not replace official developer materials.',
          'We aim to publish accurate, useful information but are not liable for outdated data after game updates.',
        ],
      },
      {
        title: 'Player profiles',
        paragraphs: [
          'Public profiles are created by users and reviewed before publication.',
          'Ranks and games in profiles are self-reported. The Site does not verify game accounts and is not connected to game servers.',
          'Do not publish someone else’s contacts or use the Site for spam, fraud, or illegal activity.',
        ],
      },
      {
        title: 'Limitation of liability',
        paragraphs: [
          'The Site is provided “as is”. We are not responsible for decisions made based on Site materials.',
          'Using the Site does not create any relationship with copyright holders of games mentioned in profiles or content.',
        ],
        list: [
          'Do not use the Site to violate game rules or applicable law',
          'Do not impersonate official Moonton or other publisher representatives',
          'Do not copy Site content without attribution where applicable',
        ],
      },
      {
        title: 'Contact and changes',
        paragraphs: [
          'For Site-related questions: the.grootoss@gmail.com',
          'We may update these terms. The current version is always available at /terms.',
          'For data processing details, see the Privacy Policy (/privacy).',
        ],
      },
    ],
    note: 'By using Moba Universe, you acknowledge the unofficial fan-made nature of the project.',
  },
}
