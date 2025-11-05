# Webhook Listener Setup для Helius

## Описание

Webhook listener для приема и обработки событий из программ Solana Lottery и Watcher Referral через Helius API.

## Настройка переменных окружения

Добавьте в `frontend/.env.local`:

```env
# Helius API Configuration
HELIUS_API_KEY=your_helius_api_key_here

# Webhook Security (опционально)
# Если установлен, Helius должен отправлять этот заголовок в Authorization
HELIUS_WEBHOOK_AUTH=your_secret_token_here

# Program IDs (автоматически из IDL)
LOTTERY_PROGRAM_ID=AHw5KYiCeU2Bj2KvQR6YcCAcQcqusp58mz3MRyiT61M9
WATCHER_PROGRAM_ID=j9RyfMTz4dc9twnFCUZLJzMmhacUqTFHQkCXr7uDpQf
```

## Генерация типов

Типы событий автоматически генерируются из Anchor IDL файлов:

```bash
npx tsx scripts/generate-event-types.ts
```

Это создаст/обновит файл `frontend/src/types/webhook-events.ts` с типами для всех событий.

## Настройка Webhook в Helius

1. Получите API ключ на https://helius.dev
2. Создайте webhook через Helius Dashboard или API:

```typescript
import { Helius } from 'helius-sdk';

const helius = new Helius('YOUR_API_KEY');

await helius.createWebhook({
  webhookURL: 'https://your-domain.com/api/webhook/helius',
  accountAddresses: [
    'AHw5KYiCeU2Bj2KvQR6YcCAcQcqusp58mz3MRyiT61M9', // Lottery Program
    'j9RyfMTz4dc9twnFCUZLJzMmhacUqTFHQkCXr7uDpQf',  // Watcher Program
  ],
  transactionTypes: ['ANY'],
  webhookType: 'enhanced',
  authHeader: process.env.HELIUS_WEBHOOK_AUTH, // опционально
});
```

## Отслеживаемые события

### Solana Lottery (6 событий):
- `NewRoundInitialized` - инициализация нового раунда
- `TicketPurchased` - покупка билетов
- `RandomnessRequested` - запрос случайности для VRF
- `RandomnessSettled` - получение случайности и определение победителей
- `RoundFinished` - завершение раунда с выплатами
- `RoundCanceled` - отмена раунда

### Watcher Referral (7 событий):
- `ProfitUpdated` - обновление прибыли реферера
- `ProfitWithdrawn` - вывод прибыли реферером
- `ReferrerForUser` - привязка реферера к пользователю
- `ReferrerProfitView` - просмотр прибыли
- `ReferrerSettingsView` - просмотр настроек
- `RegistrationStatsView` - статистика регистраций
- `RoundTotalProfitView` - общая прибыль за раунд

## API Endpoint

Webhook endpoint: `POST /api/webhook/helius`

Helius будет отправлять POST запросы на этот endpoint при возникновении событий.

## Логирование

Все события логируются в консоль в JSON формате:
```
[TIMESTAMP] [PROGRAM] [EVENT_NAME] { ...event data... }
```

## Локальное тестирование

Для локального тестирования можно использовать ngrok или аналогичный сервис:

```bash
ngrok http 3000
```

Затем укажите полученный URL в настройках webhook в Helius.
