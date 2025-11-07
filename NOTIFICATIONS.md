# Система уведомлений в реальном времени

## Архитектура

### 1. Event Broadcaster (`/lib/event-broadcaster.ts`)
In-memory broadcaster для передачи событий от webhook к SSE endpoint.

### 2. SSE Endpoint (`/api/events/route.ts`)
Server-Sent Events endpoint для трансляции событий клиентам в реальном времени.

### 3. Обработчики событий
- `/services/lottery-events.ts` - обрабатывает события лотереи
- `/services/referral-events.ts` - обрабатывает реферальные события

Каждый handler вызывает `eventBroadcaster.broadcast()` после логирования.

### 4. Клиентский компонент (`/components/EventNotifications.tsx`)
- Подключается к SSE stream (`/api/events`)
- Получает события в реальном времени
- Показывает toast уведомления с помощью `sonner`

### 5. UI (`/components/ui/sonner.tsx`)
Toaster компонент на базе библиотеки `sonner`.

## События лотереи

- **NewRoundInitialized** - Новый раунд запущен
- **TicketPurchased** - Билет куплен
- **RandomnessRequested** - Запрос случайности
- **RandomnessSettled** - Случайность получена
- **RoundFinished** - Раунд завершен
- **RoundCanceled** - Раунд отменен

## События watcher

- **ProfitUpdated** - Реферальная прибыль обновлена
- **ProfitWithdrawn** - Прибыль выведена
- **ReferrerForUser** - Новая реферальная связь

## Как это работает

1. Helius отправляет webhook на `/api/webhook/helius`
2. Webhook handler обрабатывает транзакцию и вызывает соответствующий event handler
3. Event handler логирует событие и вызывает `eventBroadcaster.broadcast()`
4. Broadcaster отправляет событие всем подписанным SSE клиентам через `/api/events`
5. `EventNotifications` компонент получает событие и показывает toast с кнопкой для просмотра транзакции в explorer

## Интеграция

Компоненты автоматически подключены в `app/layout.tsx`:
- `<EventNotifications />` - подписывается на события
- `<Toaster />` - отображает toast уведомления

