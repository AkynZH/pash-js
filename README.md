# pash-js

[![npm](https://img.shields.io/npm/v/@akynzhe/pash-js)](https://www.npmjs.com/package/@akynzhe/pash-js)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**TypeScript/React SDK для PASH** — Protocol for Agentic Semantic Hypermedia.

Supercharge your AI UI: вместо HTML-мусора от LLM — чистые компоненты из коробки.

---

## Быстрый старт

```bash
npm install @akynzhe/pash-js
```

```tsx
import { PashClient, coreRegistry, PashRenderer } from '@akynzhe/pash-js';

// 1. Создаём клиент с ядром из 24 компонентов (Tailwind-styled)
const pash = new PashClient({ registry: coreRegistry });

// 2. Системный промпт — синхронизирован с реестром автоматически
const systemPrompt = pash.getSystemPrompt();

// 3. Рендерим ответ ИИ
function App() {
  const [aiResponse, setAiResponse] = useState('');

  return (
    <div className="chat-window">
      <PashRenderer stream={aiResponse} client={pash} />
    </div>
  );
}
```

---

## Стриминг (компоненты появляются по мере генерации)

```tsx
import { PashClient, coreRegistry, PashStream } from '@akynzhe/pash-js';

const pash = new PashClient({ registry: coreRegistry });

function ChatWindow() {
  const [stream, setStream] = useState<ReadableStream | null>(null);

  async function ask(query: string) {
    const response = await fetch('/api/ai', {
      method: 'POST',
      body: JSON.stringify({ query }),
    });
    setStream(response.body);
  }

  return (
    <>
      <button onClick={() => ask('Покажи мне карточку товара')}>
        Спросить
      </button>

      {/* Компоненты рендерятся сразу, не дожидаясь конца ответа */}
      <PashStream
        readable={stream}
        client={pash}
        onComplete={(components) => console.log('Done:', components.length)}
      />
    </>
  );
}
```

---

## OpenAI / Anthropic интеграция

```tsx
import OpenAI from 'openai';
import { PashClient, coreRegistry, PashStream } from '@akynzhe/pash-js';

const openai = new OpenAI();
const pash   = new PashClient({ registry: coreRegistry });

async function* streamPash(query: string): AsyncIterable<string> {
  const stream = openai.chat.completions.stream({
    model:    'gpt-4o',
    messages: [
      { role: 'system', content: pash.getSystemPrompt() },
      { role: 'user',   content: query },
    ],
    stream: true,
  });

  for await (const chunk of stream) {
    yield chunk.choices[0]?.delta?.content ?? '';
  }
}

function ProductSearch({ query }: { query: string }) {
  const [aiStream, setAiStream] = useState<AsyncIterable<string> | null>(null);

  useEffect(() => {
    setAiStream(streamPash(query));
  }, [query]);

  return <PashStream readable={aiStream} client={pash} />;
}
```

---

## Core Registry — 24 компонента

### UI (ID 1–11)

| ID | Компонент    | Поля                                    |
|----|-------------|------------------------------------------|
| 1  | ProductCard | title\* \| desc \| price \| cta         |
| 2  | Notification| level\*(info\|warn\|error) \| message\* |
| 3  | List        | title \| items\*                         |
| 4  | Hero        | headline\* \| sub \| cta               |
| 5  | Article     | title\* \| author \| date \| summary    |
| 6  | RichBlock   | content\*[richtext]                      |
| 7  | Badge       | text\* \| color                          |
| 8  | UserCard    | name\* \| role \| email \| avatar        |
| 9  | Rating      | score\* \| max \| label                  |
| 10 | PriceTag    | price\* \| original \| badge             |
| 11 | SearchResult| title\* \| url\* \| snippet[richtext]    |

### PASH-Doc (ID 20–32)

| ID | Блок        | ID | Блок         |
|----|-------------|-----|-------------|
| 20 | Heading     | 27  | OrderedList  |
| 21 | Paragraph   | 28  | BulletList   |
| 22 | Code        | 29  | Note         |
| 23 | Blockquote  | 30  | Spoiler      |
| 24 | Image       | 31  | Math         |
| 25 | Divider     | 32  | Embed        |
| 26 | Table       |     |              |

Все компоненты стилизованы **Tailwind CSS** и поддерживают **dark mode**.

---

## Добавить свой компонент

```tsx
import { PashClient, coreRegistry, type ComponentRegistry } from '@akynzhe/pash-js';
import { createElement } from 'react';

const myRegistry: ComponentRegistry = {
  40: {
    schema: {
      v: 1,
      name: 'UserCard',
      fields: [
        { id: 0, type: 'string', label: 'name',  required: true },
        { id: 1, type: 'string', label: 'email'                 },
        { id: 2, type: 'string', label: 'role'                  },
      ],
    },
    render: (f) => createElement(
      'div',
      { className: 'flex items-center gap-3 p-3 rounded-xl border' },
      createElement('div', { className: 'font-semibold' }, f.name),
      createElement('div', { className: 'text-sm text-gray-500' }, f.email),
    ),
  },
};

// Не мутируем coreRegistry — extend() возвращает новый экземпляр
const pash = new PashClient({ registry: coreRegistry }).extend(myRegistry);

// ИИ теперь может генерировать: 40|Иван Петров|ivan@example.com|Разработчик
```

---

## Локализация

```tsx
// ru-RU (по умолчанию): 69990 → "69 990 ₽"
const pash = new PashClient({ registry: coreRegistry, locale: 'ru-RU' });

// en-US: 69990 → "$69,990"
const pash = new PashClient({ registry: coreRegistry, locale: 'en-US' });

// de-DE: 69990 → "69.990 €"
const pash = new PashClient({ registry: coreRegistry, locale: 'de-DE' });
```

---

## React Hooks

```tsx
import { usePashStream, useDecodeStream, usePashClient } from '@akynzhe/pash-js';

// Мемоизированный клиент
const pash = usePashClient({ registry: coreRegistry });

// Статичный декод
const { components, version } = useDecodeStream(aiResponse, pash);

// Стриминг с колбэками
const { components, streaming, error } = usePashStream(
  response.body,
  pash,
  (component) => console.log('Получен:', component.type),
);
```

---

## Системный промпт

```tsx
const pash = new PashClient({ registry: coreRegistry });

// RU / mode: pash (по умолчанию)
pash.getSystemPrompt();

// EN / mode: events
pash.getSystemPrompt({ lang: 'en', mode: 'events' });

// RU / PASH+ID (максимальное сжатие)
pash.getSystemPrompt({ lang: 'ru', mode: 'pash+id' });
```

Промпт **автоматически синхронизирован** с реестром.  
Добавил компонент через `extend()` — промпт обновится при следующем вызове.

---

## Требования

- React 18+
- Tailwind CSS (для стилей coreRegistry)
- TypeScript 5+ (опционально)

## License

MIT © [Сергей Павленко](https://github.com/AkynZH)
