import { createElement, Fragment, type ReactNode } from 'react';

/**
 * Парсит richtext-строку в массив ReactNode.
 * Используется для безопасного рендера richtext-полей в React.
 *
 * Поддерживаемый синтаксис:
 *   **bold**, _italic_, `code`, [text](url), \n → <br>
 */
export function parseRichtext(text: string): ReactNode[] {
  if (!text) return [];

  // Паттерны inline-разметки
  const patterns: Array<{ re: RegExp; render: (m: RegExpExecArray, key: number) => ReactNode }> = [
    {
      re: /\[([^\]]+)\]\(([^)]+)\)/,
      render: (m, k) => {
        const safe = /^(https?:|mailto:)/i.test(m[2].trim()) ? m[2] : '#';
        return createElement('a', { href: safe, rel: 'noopener noreferrer', key: k }, m[1]);
      },
    },
    {
      re: /\*\*([^*]+)\*\*/,
      render: (m, k) => createElement('strong', { key: k }, m[1]),
    },
    {
      re: /(?<!\w)_([^_]+)_(?!\w)/,
      render: (m, k) => createElement('em', { key: k }, m[1]),
    },
    {
      re: /`([^`]+)`/,
      render: (m, k) => createElement('code', { key: k }, m[1]),
    },
    {
      re: /\n/,
      render: (_, k) => createElement('br', { key: k }),
    },
  ];

  const nodes: ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    let earliest: { index: number; match: RegExpExecArray; idx: number } | null = null;

    for (let i = 0; i < patterns.length; i++) {
      const m = patterns[i].re.exec(remaining);
      if (m && (earliest === null || m.index < earliest.index)) {
        earliest = { index: m.index, match: m, idx: i };
      }
    }

    if (!earliest) {
      nodes.push(remaining);
      break;
    }

    // Текст до совпадения
    if (earliest.index > 0) {
      nodes.push(remaining.slice(0, earliest.index));
    }

    // Совпадение → ReactNode
    nodes.push(patterns[earliest.idx].render(earliest.match, key++));

    remaining = remaining.slice(earliest.index + earliest.match[0].length);
  }

  return nodes;
}

/**
 * Рендерит richtext-строку в HTML (для серверного рендера или innerHTML).
 * XSS-безопасный: экранирует HTML, unsafe URL → '#'.
 */
export function richtextToHtml(text: string): string {
  if (!text) return '';

  const esc = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  return esc(text)
    .replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      (_, label, url) => {
        const safe = /^(https?:|mailto:)/i.test(url.trim()) ? url : '#';
        return `<a href="${esc(safe)}" rel="noopener noreferrer">${esc(label)}</a>`;
      }
    )
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(?<!\w)_([^_]+)_(?!\w)/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\n/g, '<br>');
}
