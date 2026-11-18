# Лабораторная работа 5. Frontend на метафреймворке (Next.js)

Frontend из лабораторной 4 (React + Vite) перенесён на **Next.js 16 (App Router)**.
Бизнес-логика, авторизация и БД остаются в Java-backend (`backend/`, из лабораторных 3-4).

## Запуск

```bash
cp .env.example .env   # заполнить DB_PASSWORD, JWT_SECRET (base64, >=32 байт), ADMIN_*
docker compose up --build
```

- приложение: http://localhost:8081
- swagger backend: http://localhost:8080/swagger-ui.html

Остановка: `docker compose down` (с удалением БД: `docker compose down -v`).

Локальная разработка фронтенда (backend на `localhost:8080`):

```bash
cd frontend
npm install
npm run dev          # http://localhost:3000
npm run lint         # oxlint
npm run format       # prettier
```

## Как устроено

```
браузер --> Next.js (сервер) --> Java REST API --> PostgreSQL
            SSR, proxy, server actions, кеш
```

Браузер с Java напрямую не общается. Сервер Next хранит пару JWT в HttpOnly-cookie
`lab5_access` / `lab5_refresh` и сам подставляет `Authorization: Bearer ...` в запросы к API.

| Требование                         | Где                                                                                                                |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| SSR                                | все страницы - серверные компоненты (`src/app/**/page.jsx`)                                                        |
| Динамические маршруты              | `src/app/students/[id]/page.jsx`, `src/app/students/[id]/edit/page.jsx`                                            |
| Middleware / защита                | `src/proxy.js` (в Next 16 `middleware.js` переименован в `proxy.js`)                                               |
| Обновление access-токена           | `src/proxy.js` (до рендера), `actAuthorized` в `src/lib/session.js` (в server actions)                             |
| Loading                            | `<Suspense>` со скелетом таблицы (streaming), `profile/loading.jsx`, спиннеры в формах                             |
| Error                              | `src/app/error.jsx` (кнопка "Повторить")                                                                           |
| 404                                | `src/app/not-found.jsx`, `src/app/students/[id]/not-found.jsx` + `notFound()`                                      |
| Кеширование                        | `src/lib/students.js`: `fetch(..., { cache: 'force-cache', next: { tags, revalidate } })`                          |
| Сброс кеша после изменений         | `src/lib/actions/students.js`: `updateTag('students')`, `updateTag('student-<id>')`                                |
| Роли                               | кнопки скрыты для USER, `/students/new` и `/edit` - "нет прав", server actions проверяют роль; окончательно - Java |
| Поиск/фильтры/сортировка/пагинация | параметры в URL (`/students?group=A1234&page=2`), `src/lib/query.js`                                               |
| Docker                             | `frontend/Dockerfile` (multi-stage, `output: 'standalone'`), `docker-compose.yml`                                  |

## Переменные окружения

| Переменная            | Назначение                                                   |
| --------------------- | ------------------------------------------------------------ |
| `DB_PASSWORD`         | пароль PostgreSQL                                            |
| `JWT_SECRET`          | секрет подписи JWT (base64, не меньше 32 байт)               |
| `ADMIN_*`             | администратор, создаваемый при старте backend                |
| `COOKIE_SECURE`       | `true`, если сайт открыт по https                            |
| `STUDENTS_REVALIDATE` | сколько секунд кешировать данные студентов (по умолчанию 30) |
