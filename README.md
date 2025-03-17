# API-сервис для отслеживания ошибок 404

Этот сервис предназначен для сбора и хранения информации о посещениях несуществующих страниц на сайте Canfly.

## Установка

```bash
cd api-service
npm install
```

## Настройка

1. Создайте файл `.env.local` в корневой директории проекта со следующим содержимым:

```
DATABASE_URL=postgresql://username:password@host:port/database
```

2. Убедитесь, что база данных PostgreSQL доступна и работает.

## Запуск

### Режим разработки

```bash
npm run dev
```

### Продакшен

```bash
npm start
```

## API Endpoints

### POST /api/track-error

Сохраняет информацию о посещении ошибочной страницы.

**Тело запроса:**

```json
{
  "path": "/несуществующая-страница",
  "userAgent": "Mozilla/5.0 ...",
  "referer": "https://example.com"
}
```

**Ответ:**

```json
{
  "success": true
}
```

### GET /api/errors

Возвращает список всех посещений ошибочных страниц.

**Ответ:**

```json
[
  {
    "id": 1,
    "path": "/несуществующая-страница",
    "timestamp": "2023-05-01T12:00:00Z",
    "ip": "127.0.0.1",
    "user_agent": "Mozilla/5.0 ...",
    "referer": "https://example.com",
    "country": "Russia",
    "city": "Moscow"
  }
]
```

## Развертывание

Сервис можно развернуть на любой платформе, поддерживающей Node.js, например:

- Render
- Heroku
- Vercel
- DigitalOcean

## Интеграция с фронтендом

Фронтенд отправляет данные о посещениях ошибочных страниц на эндпоинт `/api/track-error` и получает список всех посещений через `/api/errors`. 