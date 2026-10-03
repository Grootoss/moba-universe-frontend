export interface PrivacySection {
  title: string
  paragraphs?: string[]
  list?: string[]
  link?: { href: string; label: string }
  showCookieButton?: boolean
}

export interface PrivacyDoc {
  title: string
  updatedLabel: string
  intro: string
  sections: PrivacySection[]
  note: string
}

export const privacyDocs: Record<'ru' | 'en', PrivacyDoc> = {
  ru: {
    title: 'Политика конфиденциальности',
    updatedLabel: 'Дата обновления: 22.08.2026',
    intro:
      'Настоящая Политика определяет порядок обработки и защиты персональных данных пользователей сайта Moba Universe (далее — «Сайт») — неофициального fan-made ресурса с главной страницей, гайдами по MOBA-играм, каталогом пользователей и личными страницами игроков, а также сервисом регистрации, авторизации и личного кабинета. Политика составлена с учётом требований Федерального закона РФ от 27.07.2006 № 152-ФЗ «О персональных данных», иных применимых норм РФ и, где применимо, правил прозрачности использования cookies и положений GDPR для посетителей из ЕС/ЕЭЗ.',
    sections: [
      {
        title: 'Оператор персональных данных',
        paragraphs: [
          'Оператором Сайта и лицом, ответственным за организацию обработки персональных данных, является владелец проекта Moba Universe.',
          'По вопросам обработки данных, реализации прав субъекта персональных данных, уточнения или удаления учётной записи, а также отзыва согласия на аналитические cookies обращайтесь:',
        ],
        list: [
          'Проект: Moba Universe',
          'Email: the.grootoss@gmail.com',
          'Страница политики: /privacy',
          'Настройки cookies: доступны в подвале Сайта и на этой странице',
        ],
      },
      {
        title: 'Область применения',
        paragraphs: [
          'Политика применяется ко всем посетителям и зарегистрированным пользователям Сайта, которые просматривают материалы (гайды), регистрируются, входят в личный кабинет, заполняют и отправляют профиль на модерацию, просматривают превью своего профиля, используют публичные страницы профилей после публикации и элементы интерфейса (язык, тема оформления).',
          'Сайт не принимает платежи и не предназначен для заключения платных договоров с пользователем в электронной форме. Контент гайдов носит информационный характер и публикуется оператором (редакционный контент). Регистрация нужна для создания, модерации и (после одобрения) публикации публичного профиля игрока.',
        ],
      },
      {
        title: 'Какие данные обрабатываются',
        paragraphs: [
          'В зависимости от ваших действий и согласия могут обрабатываться следующие категории данных:',
        ],
        list: [
          'Данные учётной записи при регистрации и входе: адрес электронной почты (email), никнейм (логин), хэш пароля (сам пароль в открытом виде не хранится), роль учётной записи (пользователь / модератор / администратор)',
          'Данные профиля: никнейм для отображения и текст «о себе» (проходят модерацию перед публикацией и при повторном изменении после одобрения); выбранные MOBA-игры и ранги из справочника Сайта (сохраняются сразу и могут обновляться без отдельной модерации); статус модерации (черновик / на проверке / одобрен / отклонён); замечания модератора (при отклонении); признак публичности профиля',
          'Технические данные сессии авторизации: JWT access/refresh-токены на стороне клиента (браузер) и служебные сведения для проверки токена на сервере',
          'Технические данные визита: IP-адрес, тип и версия браузера (User-Agent), язык, приблизительные данные об устройстве и экране, дата и время визита, URL страниц, referrer — могут фиксироваться в журналах веб-сервера/хостинга при обращении к Сайту, а также собираться Яндекс.Метрикой при наличии согласия на аналитику',
          'Данные об использовании Сайта: просмотры страниц, клики, глубина просмотра, отказы (при включённой аналитике)',
          'Локальные настройки интерфейса: выбранный язык (lang) и тема (theme) в localStorage браузера',
          'Сведения о согласии: cookie_consent (accepted / rejected); при регистрации — факт согласия на обработку персональных данных',
          'Данные, которые может собирать Яндекс.Метрика при наличии согласия (в т.ч. с использованием вебвизора и карты кликов)',
        ],
      },
      {
        title: 'Регистрация, авторизация и профили',
        paragraphs: [
          'Для создания учётной записи вы указываете email, никнейм и пароль и подтверждаете согласие на обработку персональных данных. Email используется как идентификатор для входа и связи по вопросам аккаунта и модерации. Вход пользователей выполняется через страницу входа Сайта; служебный вход персонала (администратор / модератор) — через отдельную страницу администрирования.',
          'После регистрации вы попадаете в личный кабинет. Никнейм и текст «о себе» вы отправляете на проверку: пока заявка на проверке, эти поля доступны вам только для просмотра. До публикации вы можете открыть превью своей страницы профиля — оно доступно только вам как владельцу учётной записи (а также персоналу Сайта) и не является публичной страницей для других посетителей.',
          'Игры и ранги выбираются из списков Сайта и сохраняются сразу, без отдельной модерации; они могут отображаться на странице профиля вместе с одобренными данными. Каталог пользователей показывает опубликованные профили.',
          'Публикация профиля на Сайте (страница вида /user/{id}) для других посетителей возможна после модерации никнейма и текста «о себе»: администратор или модератор одобряет профиль. При отклонении вам может быть показано замечание; после правок никнейма/«о себе» вы можете снова отправить их на проверку. Повторное изменение никнейма или «о себе» после публикации снова снимает профиль с публичного показа до нового одобрения.',
          'Пароли хранятся только в виде криптографического хэша. Access- и refresh-токены используются для поддержания сессии; вы можете завершить сессию выходом из аккаунта и очисткой данных сайта в браузере.',
          'С одного IP-адреса можно зарегистрировать не больше одной учётной записи за календарные сутки (Europe/Moscow). Для этого при успешной регистрации сохраняется IP-адрес. Неудачные попытки входа (IP и email) хранятся 15 минут и нужны только чтобы ограничить подбор пароля.',
        ],
      },
      {
        title: 'Цели обработки',
        paragraphs: ['Данные обрабатываются в следующих целях:'],
        list: [
          'регистрация и аутентификация пользователей',
          'создание, редактирование, модерация никнейма и текста «о себе», сохранение игр и рангов, превью и отображение публичных профилей',
          'обеспечение работы интерфейса Сайта (язык, тема оформления)',
          'публикация редакционных материалов (гайдов) оператором Сайта',
          'связь с пользователем по вопросам аккаунта, модерации и прав субъекта данных',
          'соблюдение требований законодательства о персональных данных, cookies и аналитике',
          'анализ посещаемости и улучшение структуры, контента и удобства Сайта (только после согласия на Яндекс.Метрику)',
          'обеспечение безопасности Сайта (предотвращение злоупотреблений, защита учётных записей)',
        ],
      },
      {
        title: 'Правовые основания обработки',
        paragraphs: [
          'Обработка данных регистрации и профиля осуществляется на основании вашего согласия (в т.ч. чекбокс при регистрации) и/или необходимости исполнения запроса на предоставление функций личного кабинета и публичного профиля (ст. 6 152-ФЗ — согласие субъекта; иные основания — где применимы).',
          'Необходимые настройки интерфейса и сведения о выборе согласия/отказа на cookies обрабатываются для предоставления функций Сайта и исполнения обязанностей оператора по информированию пользователя.',
          'Аналитические данные через Яндекс.Метрику обрабатываются только на основании вашего явного согласия, выраженного нажатием кнопки «Принять» в баннере cookies.',
          'Вы вправе отозвать согласие на обработку данных, связанных с регистрацией/профилем, обратившись к оператору, и отозвать согласие на аналитику через настройки cookies. Отзыв не влияет на законность обработки, осуществлённой до отзыва. Отзыв согласия на обработку данных аккаунта может сделать невозможным дальнейшее использование личного кабинета.',
        ],
      },
      {
        title: 'Cookies и локальное хранилище',
        paragraphs: [
          'Сайт использует cookies и аналогичные технологии. Ниже — основные категории:',
        ],
        list: [
          'Необходимые / функциональные: сохранение языка и темы оформления; без них интерфейс не запоминает предпочтения. Не используются для рекламного профилирования',
          'Авторизация: токены сессии в localStorage браузера (access/refresh) для поддержания входа',
          'Предпочтения согласия: запись выбора «Принять» / «Отклонить» аналитику',
          'Аналитические (Яндекс.Метрика): включаются только после согласия; используются для статистики и улучшения Сайта',
        ],
      },
      {
        title: 'Яндекс.Метрика',
        paragraphs: [
          'После согласия на аналитические cookies Сайт загружает счётчик Яндекс.Метрики № 110819737. Могут быть включены: учёт посещений, карта кликов, вебвизор, параметры отказов и переходов.',
          'Обработка данных в сервисе Яндекс.Метрика также регулируется документами ООО «ЯНДЕКС». Рекомендуем ознакомиться с условиями сервиса:',
        ],
        link: {
          href: 'https://yandex.ru/legal/metrica_termsofuse/',
          label: 'Условия использования сервиса Яндекс.Метрика',
        },
        list: [
          'Без согласия скрипт Метрики не подключается',
          'При навигации по Сайту (SPA) после согласия фиксируются просмотры отдельных страниц',
          'Отзыв согласия прекращает дальнейший запуск Метрики на этом устройстве/браузере',
        ],
      },
      {
        title: 'Срок хранения',
        paragraphs: [
          'Данные учётной записи и профиля хранятся, пока аккаунт активен либо до удаления/блокирования по вашему запросу или по инициативе оператора при нарушении правил/закона, а также в сроки, необходимые для исполнения обязанностей оператора.',
          'Настройки языка, темы, согласия и токены сессии хранятся в вашем браузере до выхода, удаления вами (localStorage) или очистки данных сайта.',
          'Срок хранения данных в Яндекс.Метрике определяется настройками счётчика и политикой Яндекса.',
        ],
      },
      {
        title: 'Передача третьим лицам и трансграничная передача',
        paragraphs: [
          'При согласии на аналитику данные о посещениях могут обрабатываться ООО «ЯНДЕКС» (и связанными лицами согласно их документации) как оператором сервиса веб-аналитики.',
          'Хостинг, база данных и инфраструктура Сайта могут привлекаться как обработчики по поручению оператора в объёме, необходимом для работы Сайта.',
          'Мы не продаём персональные данные и не передаём их третьим лицам в маркетинговых целях вне указанной аналитики и исполнения закона (по запросу уполномоченных органов — при наличии оснований).',
          'Использование инфраструктуры за пределами РФ (при наличии) может повлечь трансграничную передачу. В таком случае оператор принимает меры, требуемые применимым законодательством, либо опирается на ваше согласие и/или иные законные основания.',
        ],
      },
      {
        title: 'Права пользователя (субъекта персональных данных)',
        paragraphs: [
          'В соответствии с 152-ФЗ вы вправе, в частности:',
        ],
        list: [
          'получить информацию, касающуюся обработки ваших персональных данных',
          'требовать уточнения, блокирования или уничтожения данных при наличии законных оснований',
          'отозвать согласие на обработку данных аккаунта/профиля и/или аналитики',
          'обжаловать действия оператора в Роскомнадзор или в суд',
          'ограничить cookies и хранилище через настройки браузера',
        ],
        showCookieButton: true,
      },
      {
        title: 'Защита данных',
        paragraphs: [
          'Оператор принимает организационные и технические меры, направленные на предотвращение несанкционированного доступа к данным: разграничение доступа по ролям, хранение паролей в виде хэша, использование защищённого соединения (HTTPS) на публичном сайте, ограничение прав администраторов/модераторов. HTML гайдов публикуется персоналом и отображается как доверенный редакционный контент.',
          'Полностью исключить риски в сети Интернет невозможно; рекомендуем использовать уникальный пароль, актуальный браузер и не передавать учётные данные третьим лицам.',
        ],
      },
      {
        title: 'Данные несовершеннолетних',
        paragraphs: [
          'Сайт может быть доступен пользователям младше 18 лет. При регистрации мы можем обрабатывать адрес электронной почты и иные указанные при регистрации/в профиле сведения, в том числе если субъект данных является несовершеннолетним.',
          'Регистрируясь, вы подтверждаете, что имеете право предоставлять указанные данные и, если это требуется применимым правом (в т.ч. для лиц, не достигших возраста самостоятельного согласия), получили согласие законного представителя (родителя/опекуна) на обработку персональных данных и использование Сайта.',
          'Оператор не намеренно запрашивает специальные категории данных о несовершеннолетних. Законный представитель вправе обратиться к оператору для уточнения, ограничения или удаления данных несовершеннолетнего, где это возможно по закону.',
          'Если вам стало известно о неправомерной регистрации или обработке данных ребёнка без необходимого согласия — сообщите оператору на email, указанный выше.',
        ],
      },
      {
        title: 'Посетители из ЕС / GDPR',
        paragraphs: [
          'Сайт в первую очередь ориентирован на пользователей из Российской Федерации и стран СНГ. При этом Сайт может быть доступен посетителям из Европейского союза (ЕС) и Европейской экономической зоны (ЕЭЗ).',
          'Если к вам применяется Общий регламент по защите данных (GDPR), дополнительно действует следующее:',
        ],
        list: [
          'Категории данных: email, никнейм, хэш пароля, данные профиля, технические и аналитические данные — как описано выше',
          'Цели и основания: согласие (регистрация, аналитика); выполнение договора/запроса сервиса для работы кабинета и профиля; законный интерес/необходимость функции — для базовых настроек интерфейса, где применимо',
          'Возраст согласия: если вы не достигли возраста цифрового согласия в вашей стране (часто 13–16 лет), регистрация и предоставление данных должны осуществляться с участием/согласием законного представителя',
          'Яндекс.Метрика и аналитические cookies запускаются только после явного согласия («Принять»)',
          'При согласии на аналитику данные о посещении могут передаваться и обрабатываться ООО «ЯНДЕКС», в том числе с использованием инфраструктуры за пределами ЕС/ЕЭЗ',
          'Вы можете запросить доступ, уточнение, ограничение, удаление (где применимо), переносимость (где применимо) и отзыв согласия, обратившись на email оператора',
          'Вы вправе подать жалобу в надзорный орган по защите данных в стране вашего проживания, работы или предполагаемого нарушения',
        ],
      },
      {
        title: 'Изменение Политики',
        paragraphs: [
          'Оператор вправе обновлять Политику. Актуальная редакция всегда размещается по адресу /privacy. Дата обновления указывается в начале документа. При существенных изменениях, связанных с обработкой данных аккаунта или аналитикой, может потребоваться повторное согласие.',
        ],
      },
    ],
    note: 'Документ носит информационный характер для проекта Moba Universe. При необходимости уточните формулировки у юриста перед масштабированием сервиса.',
  },
  en: {
    title: 'Privacy Policy',
    updatedLabel: 'Last updated: 22.08.2026',
    intro:
      'This Privacy Policy explains how Moba Universe (the “Site”) — an unofficial fan-made resource with a homepage, MOBA guides, a user directory, public player pages, registration, authentication, and a personal cabinet — processes and protects personal data. It is prepared with regard to Russian Federal Law No. 152-FZ “On Personal Data”, other applicable Russian rules, cookie transparency practices, and, where applicable, the GDPR for visitors from the EU/EEA.',
    sections: [
      {
        title: 'Data controller',
        paragraphs: [
          'The Site is operated by the owner of the Moba Universe project, who organizes personal data processing for the Site.',
          'For data requests, account or profile issues, user rights, and withdrawal of analytics cookie consent, contact:',
        ],
        list: [
          'Project: Moba Universe',
          'Email: the.grootoss@gmail.com',
          'Policy page: /privacy',
          'Cookie settings: available in the Site footer and on this page',
        ],
      },
      {
        title: 'Scope',
        paragraphs: [
          'This Policy applies to visitors and registered users who view guides, register, sign in to the personal cabinet, fill in and submit a profile for moderation, open a preview of their own profile, use public profile pages after publication, and use interface preferences (language, theme).',
          'The Site does not process payments and provides informational guide content published by the operator (editorial content). Registration exists to create, moderate, and (after approval) publish a public player profile.',
        ],
      },
      {
        title: 'Data we process',
        paragraphs: ['Depending on your actions and consent, we may process:'],
        list: [
          'Account data on registration and login: email address, nickname (username), password hash (the password itself is not stored in plain text), account role (user / moderator / administrator)',
          'Profile data: display nickname and “about” text (moderated before publishing and again if changed after approval); selected MOBA games and ranks from the Site catalog (saved immediately and may update without a separate review); moderation status (draft / pending / approved / rejected); moderator notes (on rejection); public visibility flag',
          'Auth session data: JWT access/refresh tokens on the client (browser) and server-side token validation data',
          'Technical visit data: IP address, browser type/version (User-Agent), language, approximate device/screen data, visit date/time, page URLs, referrer — may appear in web server/hosting logs when you use the Site, and may be collected by Yandex Metrika if you consent to analytics',
          'Usage data: page views, clicks, engagement metrics (when analytics is enabled)',
          'Interface preferences: language (lang) and theme (theme) in browser localStorage',
          'Consent records: cookie_consent (accepted / rejected); on registration — your consent to personal data processing',
          'Data collected by Yandex Metrika if you consent (including webvisor and click map features where enabled)',
        ],
      },
      {
        title: 'Registration, authentication, and profiles',
        paragraphs: [
          'To create an account you provide an email, nickname, and password and confirm consent to personal data processing. Email is used as the login identifier and for account/moderation-related communication. Regular users sign in via the Site login page; staff (administrator / moderator) use a separate administration login page.',
          'After registration you open the personal cabinet. Nickname and “about” text are submitted for review; while under review those fields are view-only for you. Before publication you may open a preview of your profile page — available only to you as the account owner (and Site staff), not a public page for other visitors.',
          'Games and ranks are chosen from Site lists and saved immediately without a separate review; they may appear on the profile page together with approved text. The user directory shows published profiles.',
          'A profile becomes public for other visitors at /user/{id} after nickname/about moderation: an administrator or moderator approves it. If rejected, you may see a note; after editing nickname/about you may submit again. Changing nickname or about after publication removes the profile from public view until it is approved again.',
          'Passwords are stored only as cryptographic hashes. Access and refresh tokens maintain your session; you can end the session by logging out and clearing site data in the browser.',
          'One IP address can register at most one account per calendar day (Europe/Moscow). The IP is stored when registration succeeds. Failed sign-in attempts (IP and email) are kept for 15 minutes and used only to limit password guessing.',
        ],
      },
      {
        title: 'Purposes',
        paragraphs: ['Data is processed to:'],
        list: [
          'register and authenticate users',
          'create and edit profiles, moderate nickname/about, save games and ranks, preview and display public profiles',
          'provide Site interface features (language, theme)',
          'publish editorial materials (guides) by the Site operator',
          'communicate about the account, moderation, and data-subject rights',
          'comply with personal data, cookie, and analytics transparency duties',
          'analyze traffic and improve content/UX (only after Yandex Metrika consent)',
          'protect the Site (abuse prevention and account security)',
        ],
      },
      {
        title: 'Legal bases',
        paragraphs: [
          'Account and profile data are processed based on your consent (including the registration checkbox) and/or as needed to provide the profile cabinet and public profile features you request (under 152-FZ and, where applicable, GDPR Art. 6).',
          'Necessary interface preferences and your cookie Accept/Reject record are processed to operate the Site and inform users.',
          'Yandex Metrika analytics runs only with your explicit consent via the “Accept” button on the cookie banner.',
          'You may withdraw consent for account/profile processing by contacting the operator, and withdraw analytics consent via cookie settings. Withdrawal does not affect processing performed before withdrawal. Withdrawing account-related consent may make the personal cabinet unusable.',
        ],
      },
      {
        title: 'Cookies and local storage',
        paragraphs: ['We use cookies and similar technologies in these categories:'],
        list: [
          'Necessary / functional: language and theme — needed to remember preferences; not used for ad profiling',
          'Authentication: session tokens in browser localStorage (access/refresh) to keep you signed in',
          'Consent preference: stores Accept / Reject for analytics',
          'Analytical (Yandex Metrika): enabled only after consent, for statistics and Site improvement',
        ],
      },
      {
        title: 'Yandex Metrika',
        paragraphs: [
          'After analytics consent, the Site loads Yandex Metrika counter 110819737. Features may include visits, click map, webvisor, bounce and link tracking.',
          'Processing in Yandex Metrika is also governed by Yandex documents. Please review:',
        ],
        link: {
          href: 'https://yandex.ru/legal/metrica_termsofuse/',
          label: 'Yandex Metrika Terms of Use',
        },
        list: [
          'Without consent, the Metrika script is not loaded',
          'After consent, SPA navigations are tracked as separate page views',
          'Withdrawing consent stops further Metrika launches in that browser',
        ],
      },
      {
        title: 'Retention',
        paragraphs: [
          'Account and profile data are kept while the account is active, or until deletion/blocking upon your request or by the operator for violations of rules/law, and for periods required to meet legal duties.',
          'Language, theme, consent, and session tokens remain in your browser until logout, manual removal, or clearing site data.',
          'Retention in Yandex Metrika follows the counter settings and Yandex policy.',
        ],
      },
      {
        title: 'Third parties and cross-border transfers',
        paragraphs: [
          'With analytics consent, visit data may be processed by Yandex (and related parties per their documentation) as the analytics provider.',
          'Hosting, database, and Site infrastructure providers may process data as processors on the operator’s instructions as needed to run the Site.',
          'We do not sell personal data or share it with third parties for marketing outside the analytics described above, except where required by law.',
          'If infrastructure outside Russia/your country is used, cross-border transfers may occur subject to applicable law, consent, and/or other legal bases.',
        ],
      },
      {
        title: 'Your rights',
        paragraphs: ['Where applicable (including under 152-FZ), you may:'],
        list: [
          'request information about processing of your personal data',
          'request rectification, blocking, or deletion where legally grounded',
          'withdraw consent to account/profile processing and/or analytics',
          'lodge a complaint with Roskomnadzor or a court (for users in Russia)',
          'restrict cookies/storage via browser settings',
        ],
        showCookieButton: true,
      },
      {
        title: 'Security',
        paragraphs: [
          'The operator applies organizational and technical measures to reduce unauthorized access: access control by role, password hashing, HTTPS on the public Site, and limited admin/moderator privileges. Editorial guide HTML is published by staff and rendered as trusted content.',
          'Internet risks cannot be eliminated entirely; use a unique password, an up-to-date browser, and do not share credentials.',
        ],
      },
      {
        title: 'Children’s data / minors',
        paragraphs: [
          'The Site may be used by persons under 18. When you register, we may process an email address and other registration/profile details, including where the data subject is a minor.',
          'By registering, you confirm that you are allowed to provide the data and, where required by applicable law (including where you are below the age of independent consent), that a parent/guardian has consented to the processing and to use of the Site.',
          'The operator does not intentionally request special categories of data about minors. A legal guardian may contact the operator to rectify, restrict, or delete a minor’s data where legally possible.',
          'If you believe a child registered or data was processed without required consent, contact the operator at the email above.',
        ],
      },
      {
        title: 'EU visitors / GDPR',
        paragraphs: [
          'The Site is primarily intended for users in the Russian Federation and CIS countries. However, it may also be accessible to visitors from the European Union (EU) and the European Economic Area (EEA).',
          'If the GDPR applies to you, the following also applies:',
        ],
        list: [
          'Data categories: email, nickname, password hash, profile data, technical and analytics data — as described above',
          'Purposes and bases: consent (registration, analytics); performance of a requested service for the cabinet/profile; and, where applicable, necessity for basic interface preferences',
          'Age of consent: if you are below the digital age of consent in your country (often 13–16), registration and data submission should involve parent/guardian consent',
          'Yandex Metrika and analytical cookies run only after explicit consent (“Accept”)',
          'If you consent to analytics, visit data may be transferred to and processed by Yandex, including infrastructure outside the EU/EEA',
          'You may request access, rectification, restriction, erasure (where applicable), portability (where applicable), and withdrawal of consent by emailing the operator',
          'You may lodge a complaint with a data protection supervisory authority in your country of residence, work, or of the alleged infringement',
        ],
      },
      {
        title: 'Policy changes',
        paragraphs: [
          'The operator may update this Policy. The current version is always available at /privacy. The update date is shown at the top. Material changes to account processing or analytics may require renewed consent.',
        ],
      },
    ],
    note: 'This document is an informational template for the Moba Universe project. Have a lawyer review the wording before scaling the service.',
  },
}
