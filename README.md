## Solana Lottery — Фронтенд (Next.js)

Клиентское приложение для взаимодействия с программами лотереи на Solana: показ состояния лотереи и партнёрского `Watcher`, покупка билетов, отображение транзакций и ссылок в Explorer. Интерфейс на shadcn/ui, кошельки через `@solana/wallet-adapter`.

### Быстрый старт

```bash
yarn install
yarn dev
# откройте http://localhost:3000
```

Переменные окружения (необязательно):
- `NEXT_PUBLIC_CLUSTER` — `devnet` (по умолчанию) | `testnet` | `mainnet`. Влияет на ссылки Explorer и соединение.

### Интеграция с Anchor/IDL
- Адреса программ берутся из поля `address` внутри IDL.
- IDL: `src/idl/solana_lottery.json`, `src/idl/watcher_referral.json`.
- Хук `src/lib/anchor.ts` создаёт `AnchorProvider` и `Program` для лотереи и watcher, используя активный кошелёк.

### Реферальная логика
- Покупка билетов работает без регистрации: если нет реферала — прокидываем `SystemProgram` в соответствующие аккаунты и CPI в watcher пропускается.

### Полезные команды
- `yarn dev` — локальная разработка
- `yarn build && yarn start` — продакшен-сборка

### Требования
- Node.js 18+
- Установленный Solana-кошелёк (например, Phantom)

### Структура
- `src/app` — маршруты и страницы
- `src/components/ui` — UI-компоненты (shadcn/ui)
- `src/lib/anchor.ts` — провайдер Anchor и инициализация программ
- `src/idl/*` — IDL и типы программ
