import { createElement, Fragment, type ReactElement } from 'react';
import type { PashRendererProps } from '../core/types.js';
import { useDecodeStream } from '../hooks/usePash.js';

/**
 * PashRenderer — рендерит статичный PASH-поток.
 *
 * Используй для отрисовки полного ответа ИИ после его получения.
 * Для стриминга используй <PashStream>.
 *
 * @example
 * const pash = new PashClient({ registry: coreRegistry });
 *
 * function App() {
 *   return (
 *     <div className="chat-window">
 *       <PashRenderer stream={aiResponse} client={pash} />
 *     </div>
 *   );
 * }
 */
export function PashRenderer({
  stream,
  client,
  className,
  onComponent,
}: PashRendererProps): ReactElement | null {
  const decoded = useDecodeStream(stream, client);

  if (!decoded.components.length) return null;

  const elements = decoded.components.map((comp, i) => {
    onComponent?.(comp);
    const rendered = client.renderComponent(comp);
    if (rendered === null || rendered === undefined) return null;
    return createElement(Fragment, { key: `${comp.type}-${i}` }, rendered);
  }).filter(Boolean);

  if (!elements.length) return null;

  return createElement(
    'div',
    { className: className ?? 'pash-renderer flex flex-col gap-3' },
    ...elements,
  );
}
