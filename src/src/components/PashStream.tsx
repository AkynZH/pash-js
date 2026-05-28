import { createElement, Fragment, type ReactElement } from 'react';
import type { PashStreamProps } from '../core/types.js';
import { usePashStream } from '../hooks/usePash.js';

/**
 * PashStream — рендерит PASH-поток в реальном времени.
 *
 * Компоненты появляются на экране по мере их генерации ИИ.
 * Принимает ReadableStream (fetch) или AsyncIterable (SSE).
 *
 * @example
 * async function ask(query: string) {
 *   const response = await fetch('/api/ai', {
 *     method: 'POST',
 *     body: JSON.stringify({ query }),
 *   });
 *   return response.body; // ReadableStream
 * }
 *
 * function ChatWindow() {
 *   const [stream, setStream] = useState<ReadableStream | null>(null);
 *   const pash = new PashClient({ registry: coreRegistry });
 *
 *   return (
 *     <>
 *       <button onClick={() => ask('Покажи товары').then(setStream)}>
 *         Спросить
 *       </button>
 *       <PashStream readable={stream} client={pash} />
 *     </>
 *   );
 * }
 */
export function PashStream({
  readable,
  client,
  className,
  onComponent,
  onComplete,
}: PashStreamProps): ReactElement | null {
  const { components, streaming, error } = usePashStream(
    readable,
    client,
    onComponent,
  );

  // Коллбэк onComplete при завершении потока
  const prevStreamingRef = { current: false };
  if (prevStreamingRef.current && !streaming && components.length) {
    onComplete?.(components);
  }
  prevStreamingRef.current = streaming;

  if (!components.length && !streaming) return null;

  return createElement(
    'div',
    { className: className ?? 'pash-stream flex flex-col gap-3' },

    // Отрендеренные компоненты
    ...components.map((comp, i) => {
      const rendered = client.renderComponent(comp);
      if (rendered === null || rendered === undefined) return null;
      return createElement(Fragment, { key: `${comp.type}-${i}` }, rendered);
    }).filter(Boolean),

    // Индикатор стриминга
    streaming && createElement(
      'div',
      { className: 'flex items-center gap-1.5 py-1', key: '__streaming' },
      createElement('span', { className: 'w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]' }),
      createElement('span', { className: 'w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]' }),
      createElement('span', { className: 'w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce' }),
    ),

    // Ошибка
    error && createElement(
      'div',
      { className: 'text-xs text-red-500 dark:text-red-400 px-1', key: '__error' },
      `Stream error: ${error.message}`,
    ),
  );
}
