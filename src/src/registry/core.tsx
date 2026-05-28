import { createElement, Fragment, type ReactElement } from 'react';
import type { ComponentRegistry, RenderContext } from '../core/types.js';
import { parseRichtext } from '../core/richtext.js';
import { CORE_SCHEMAS } from './schemas.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function RT({ text }: { text: string }): ReactElement {
  return createElement(Fragment, null, ...parseRichtext(text));
}

function esc(s: unknown): string {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function cx(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

// ─── UI Components ────────────────────────────────────────────────────────────

type F = Record<string, any>;

function ProductCard(f: F, _ctx: RenderContext): ReactElement {
  return createElement('div', { className: 'rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 max-w-xs shadow-sm' },
    createElement('h3', { className: 'font-semibold text-gray-900 dark:text-gray-100 text-sm mb-1' }, f.title),
    f.desc && createElement('p', { className: 'text-gray-500 dark:text-gray-400 text-xs mb-3' }, f.desc),
    f.price && createElement('p', { className: 'text-green-600 dark:text-green-400 font-bold text-lg mb-3' }, f.price),
    createElement('button', {
      className: 'bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-1.5 rounded-lg transition-colors',
    }, f.cta || 'Купить'),
  );
}

function Notification(f: F, _ctx: RenderContext): ReactElement {
  const allowed = ['info', 'warn', 'error'] as const;
  type Level = typeof allowed[number];
  const lvl: Level = allowed.includes(f.level) ? f.level : 'info';

  const styles: Record<Level, { wrap: string; dot: string; label: string }> = {
    info:  { wrap: 'bg-blue-50 dark:bg-blue-950 border-l-4 border-blue-500',   dot: 'text-blue-700 dark:text-blue-300', label: 'text-blue-800 dark:text-blue-200' },
    warn:  { wrap: 'bg-yellow-50 dark:bg-yellow-950 border-l-4 border-yellow-500', dot: 'text-yellow-700 dark:text-yellow-300', label: 'text-yellow-800 dark:text-yellow-200' },
    error: { wrap: 'bg-red-50 dark:bg-red-950 border-l-4 border-red-500',      dot: 'text-red-700 dark:text-red-300',    label: 'text-red-800 dark:text-red-200' },
  };
  const s = styles[lvl];

  return createElement('div', { className: `${s.wrap} rounded-r-lg px-4 py-3 flex gap-2 items-start` },
    createElement('span', { className: `${s.dot} font-bold text-xs uppercase tracking-wide mt-0.5 min-w-[36px]` }, lvl),
    createElement('span', { className: `${s.label} text-sm` }, f.message),
  );
}

function List(f: F, _ctx: RenderContext): ReactElement {
  const items: string[] = Array.isArray(f.items) ? f.items : [];
  return createElement('div', { className: 'rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 max-w-xs' },
    f.title && createElement('p', { className: 'text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2' }, f.title),
    createElement('ul', { className: 'space-y-1' },
      ...items.map((item, i) =>
        createElement('li', { key: i, className: 'text-sm text-gray-700 dark:text-gray-300 flex gap-2' },
          createElement('span', { className: 'text-gray-400' }, '–'),
          item,
        )
      )
    ),
  );
}

function Hero(f: F, _ctx: RenderContext): ReactElement {
  return createElement('div', { className: 'rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-8 text-center max-w-sm' },
    createElement('h1', { className: 'text-2xl font-bold mb-2' }, f.headline),
    f.sub && createElement('p', { className: 'text-blue-100 text-sm mb-6' }, f.sub),
    f.cta && createElement('button', {
      className: 'bg-white text-blue-700 font-semibold px-6 py-2 rounded-lg hover:bg-blue-50 transition-colors text-sm',
    }, f.cta),
  );
}

function Article(f: F, _ctx: RenderContext): ReactElement {
  return createElement('article', { className: 'rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5 max-w-lg' },
    createElement('h1', { className: 'text-lg font-bold text-gray-900 dark:text-gray-100 mb-1' }, f.title),
    createElement('div', { className: 'flex gap-3 text-xs text-gray-500 dark:text-gray-400 mb-3' },
      f.author && createElement('span', null, f.author),
      f.date   && createElement('span', null, f.date),
    ),
    f.summary && createElement('div', { className: 'text-sm text-gray-600 dark:text-gray-300 leading-relaxed' },
      createElement(RT, { text: f.summary }),
    ),
  );
}

function RichBlock(f: F, _ctx: RenderContext): ReactElement {
  return createElement('div', { className: 'text-sm text-gray-700 dark:text-gray-300 leading-relaxed' },
    createElement(RT, { text: f.content }),
  );
}

function Badge(f: F, _ctx: RenderContext): ReactElement {
  const colorMap: Record<string, string> = {
    gray:   'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    green:  'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    blue:   'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    yellow: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
    red:    'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
    purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
  };
  const cls = colorMap[f.color] ?? colorMap['gray'];
  return createElement('span', {
    className: `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cls}`,
  }, f.text);
}

function UserCard(f: F, _ctx: RenderContext): ReactElement {
  const initials = String(f.name || '?').split(' ').map((p: string) => p[0]).join('').toUpperCase().slice(0, 2);
  return createElement('div', { className: 'flex items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 max-w-xs' },
    createElement('div', {
      className: 'w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0',
    },
      f.avatar
        ? createElement('img', { src: f.avatar, alt: f.name, className: 'w-10 h-10 rounded-full object-cover' })
        : initials
    ),
    createElement('div', { className: 'min-w-0' },
      createElement('p', { className: 'font-semibold text-sm text-gray-900 dark:text-gray-100 truncate' }, f.name),
      f.role  && createElement('p', { className: 'text-xs text-gray-500 dark:text-gray-400 truncate' }, f.role),
      f.email && createElement('p', { className: 'text-xs text-blue-500 truncate' }, f.email),
    ),
  );
}

function Rating(f: F, _ctx: RenderContext): ReactElement {
  const score = parseFloat(f.score) || 0;
  const max   = parseFloat(f.max)   || 5;
  const pct   = Math.min(100, Math.round((score / max) * 100));

  return createElement('div', { className: 'flex items-center gap-2' },
    createElement('div', { className: 'flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden max-w-[120px]' },
      createElement('div', {
        className: 'h-full bg-yellow-400 rounded-full transition-all',
        style: { width: `${pct}%` },
      }),
    ),
    createElement('span', { className: 'text-sm font-semibold text-gray-700 dark:text-gray-300' }, `${f.score}${f.max ? `/${f.max}` : ''}`),
    f.label && createElement('span', { className: 'text-xs text-gray-500 dark:text-gray-400' }, f.label),
  );
}

function PriceTag(f: F, _ctx: RenderContext): ReactElement {
  return createElement('div', { className: 'flex items-baseline gap-2 flex-wrap' },
    createElement('span', { className: 'text-2xl font-bold text-gray-900 dark:text-gray-100' }, f.price),
    f.original && createElement('span', { className: 'text-sm text-gray-400 line-through' }, f.original),
    f.badge && createElement('span', {
      className: 'text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 px-2 py-0.5 rounded-full',
    }, f.badge),
  );
}

function SearchResult(f: F, _ctx: RenderContext): ReactElement {
  return createElement('div', { className: 'py-3 border-b border-gray-100 dark:border-gray-800 last:border-0' },
    createElement('a', {
      href: f.url || '#',
      className: 'text-blue-600 dark:text-blue-400 font-medium text-sm hover:underline block mb-0.5',
    }, f.title),
    f.url && createElement('p', {
      className: 'text-green-700 dark:text-green-500 text-xs mb-1 truncate',
    }, f.url),
    f.snippet && createElement('p', { className: 'text-gray-600 dark:text-gray-400 text-xs leading-relaxed' },
      createElement(RT, { text: f.snippet }),
    ),
  );
}

// ─── Doc Blocks ───────────────────────────────────────────────────────────────

function Heading(f: F, _ctx: RenderContext): ReactElement {
  const lvl = Math.min(Math.max(parseInt(f.level) || 2, 1), 6) as 1|2|3|4|5|6;
  const sizes: Record<1|2|3|4|5|6, string> = {
    1: 'text-3xl font-bold', 2: 'text-2xl font-bold',
    3: 'text-xl font-semibold', 4: 'text-lg font-semibold',
    5: 'text-base font-semibold', 6: 'text-sm font-semibold',
  };
  return createElement(`h${lvl}`, {
    className: `${sizes[lvl]} text-gray-900 dark:text-gray-100 mt-4 mb-2`,
  }, f.text);
}

function Paragraph(f: F, _ctx: RenderContext): ReactElement {
  return createElement('p', { className: 'text-sm text-gray-700 dark:text-gray-300 leading-relaxed my-1' },
    createElement(RT, { text: f.text }),
  );
}

function Code(f: F, _ctx: RenderContext): ReactElement {
  const body = String(f.body ?? '').replace(/\\n/g, '\n');
  return createElement('div', { className: 'my-2' },
    f.lang && createElement('div', {
      className: 'text-xs text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-t-lg font-mono border-b border-gray-200 dark:border-gray-700',
    }, f.lang),
    createElement('pre', {
      className: cx(
        'bg-gray-900 text-green-300 rounded-lg p-4 overflow-x-auto text-xs font-mono leading-relaxed',
        f.lang && 'rounded-tl-none'
      ),
    },
      createElement('code', null, body),
    ),
  );
}

function Blockquote(f: F, _ctx: RenderContext): ReactElement {
  return createElement('blockquote', {
    className: 'border-l-4 border-gray-300 dark:border-gray-600 pl-4 my-2',
  },
    createElement('p', { className: 'text-sm text-gray-600 dark:text-gray-400 italic' },
      createElement(RT, { text: f.text }),
    ),
    f.author && createElement('cite', {
      className: 'text-xs text-gray-500 dark:text-gray-500 not-italic mt-1 block',
    }, `— ${f.author}`),
  );
}

function Image(f: F, _ctx: RenderContext): ReactElement {
  return createElement('figure', { className: 'my-2' },
    createElement('img', {
      src: f.url, alt: f.alt || '',
      loading: 'lazy',
      className: 'rounded-lg max-w-full h-auto',
      onError: (e: any) => { e.target.style.display = 'none'; },
    }),
    f.caption && createElement('figcaption', {
      className: 'text-xs text-gray-500 dark:text-gray-400 text-center mt-1',
    }, f.caption),
  );
}

function Divider(_f: F, _ctx: RenderContext): ReactElement {
  return createElement('hr', { className: 'my-4 border-gray-200 dark:border-gray-700' });
}

function Table(f: F, _ctx: RenderContext): ReactElement {
  const headers: string[] = Array.isArray(f.headers) ? f.headers : [];
  const rows = String(f.rows ?? '').split(';').filter(Boolean).map((r: string) => r.split(','));
  return createElement('div', { className: 'overflow-x-auto my-2' },
    createElement('table', { className: 'min-w-full text-xs border-collapse' },
      createElement('thead',
        { className: 'bg-gray-50 dark:bg-gray-800' },
        createElement('tr', null,
          ...headers.map((h, i) => createElement('th', {
            key: i,
            className: 'px-3 py-2 text-left font-semibold text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700',
          }, h))
        )
      ),
      createElement('tbody', null,
        ...rows.map((row, ri) => createElement('tr', {
          key: ri,
          className: ri % 2 === 0 ? '' : 'bg-gray-50 dark:bg-gray-800/50',
        },
          ...row.map((cell, ci) => createElement('td', {
            key: ci,
            className: 'px-3 py-2 text-gray-700 dark:text-gray-300 border-b border-gray-100 dark:border-gray-800',
          }, cell.trim()))
        ))
      ),
    )
  );
}

function OrderedList(f: F, _ctx: RenderContext): ReactElement {
  const items: string[] = Array.isArray(f.items) ? f.items : [];
  return createElement('div', { className: 'my-1' },
    f.title && createElement('p', { className: 'text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1' }, f.title),
    createElement('ol', { className: 'list-decimal list-inside space-y-1' },
      ...items.map((item, i) => createElement('li', {
        key: i, className: 'text-sm text-gray-700 dark:text-gray-300',
      }, createElement(RT, { text: item })))
    ),
  );
}

function BulletList(f: F, _ctx: RenderContext): ReactElement {
  const items: string[] = Array.isArray(f.items) ? f.items : [];
  return createElement('div', { className: 'my-1' },
    f.title && createElement('p', { className: 'text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1' }, f.title),
    createElement('ul', { className: 'list-disc list-inside space-y-1' },
      ...items.map((item, i) => createElement('li', {
        key: i, className: 'text-sm text-gray-700 dark:text-gray-300',
      }, createElement(RT, { text: item })))
    ),
  );
}

function Note(f: F, _ctx: RenderContext): ReactElement {
  const allowed = ['info','tip','warn','danger'] as const;
  type Level = typeof allowed[number];
  const lvl: Level = allowed.includes(f.level) ? f.level : 'info';

  const styles: Record<Level, string> = {
    info:   'bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800',
    tip:    'bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800',
    warn:   'bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800',
    danger: 'bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800',
  };
  const labelStyles: Record<Level, string> = {
    info:   'text-blue-700 dark:text-blue-300',
    tip:    'text-green-700 dark:text-green-300',
    warn:   'text-yellow-700 dark:text-yellow-300',
    danger: 'text-red-700 dark:text-red-300',
  };

  return createElement('div', { className: `${styles[lvl]} rounded-lg p-3 my-1` },
    createElement('p', { className: `${labelStyles[lvl]} text-xs font-bold uppercase tracking-wide mb-1` }, lvl),
    createElement('div', { className: 'text-sm text-gray-700 dark:text-gray-300' },
      createElement(RT, { text: f.text }),
    ),
  );
}

function Spoiler(f: F, _ctx: RenderContext): ReactElement {
  return createElement('details', { className: 'my-1 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden' },
    createElement('summary', {
      className: 'px-4 py-2.5 cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 select-none',
    }, f.title),
    createElement('div', { className: 'px-4 py-3 text-sm text-gray-600 dark:text-gray-400' },
      createElement(RT, { text: f.body }),
    ),
  );
}

function MathBlock(f: F, _ctx: RenderContext): ReactElement {
  const isBlock = f.display === 'block';
  return createElement(isBlock ? 'div' : 'span', {
    className: cx(
      'font-mono text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950 rounded',
      isBlock ? 'block px-4 py-3 my-2 text-sm overflow-x-auto' : 'inline px-1.5 py-0.5 text-xs mx-0.5'
    ),
    'data-formula': f.formula,
  }, f.formula);
}

function Embed(f: F, _ctx: RenderContext): ReactElement {
  const title = f.title || f.type;

  const renderEmbed = (): ReactElement => {
    if (f.type === 'youtube') {
      const id = String(f.url ?? '').match(/(?:v=|youtu\.be\/)([A-Za-z0-9_-]{11})/)?.[1];
      if (id) {
        return createElement('iframe', {
          src: `https://www.youtube.com/embed/${id}`,
          title,
          allowFullScreen: true,
          loading: 'lazy',
          className: 'w-full rounded-b-lg',
          style: { height: '220px', border: 'none' },
        });
      }
    }
    return createElement('a', {
      href: f.url || '#',
      target: '_blank',
      rel: 'noopener noreferrer',
      className: 'text-blue-600 hover:underline text-sm',
    }, f.url || title);
  };

  return createElement('div', { className: 'rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden my-2' },
    createElement('div', {
      className: 'px-3 py-1.5 bg-gray-50 dark:bg-gray-800 text-xs text-gray-500 font-medium',
    }, title),
    renderEmbed(),
  );
}

// ─── Core Registry Assembly ───────────────────────────────────────────────────

export const coreRegistry: ComponentRegistry = {
  1:  { schema: CORE_SCHEMAS[1]!,  render: ProductCard  },
  2:  { schema: CORE_SCHEMAS[2]!,  render: Notification },
  3:  { schema: CORE_SCHEMAS[3]!,  render: List         },
  4:  { schema: CORE_SCHEMAS[4]!,  render: Hero         },
  5:  { schema: CORE_SCHEMAS[5]!,  render: Article      },
  6:  { schema: CORE_SCHEMAS[6]!,  render: RichBlock     },
  7:  { schema: CORE_SCHEMAS[7]!,  render: Badge        },
  8:  { schema: CORE_SCHEMAS[8]!,  render: UserCard     },
  9:  { schema: CORE_SCHEMAS[9]!,  render: Rating       },
  10: { schema: CORE_SCHEMAS[10]!, render: PriceTag     },
  11: { schema: CORE_SCHEMAS[11]!, render: SearchResult },
  20: { schema: CORE_SCHEMAS[20]!, render: Heading      },
  21: { schema: CORE_SCHEMAS[21]!, render: Paragraph    },
  22: { schema: CORE_SCHEMAS[22]!, render: Code         },
  23: { schema: CORE_SCHEMAS[23]!, render: Blockquote   },
  24: { schema: CORE_SCHEMAS[24]!, render: Image        },
  25: { schema: CORE_SCHEMAS[25]!, render: Divider      },
  26: { schema: CORE_SCHEMAS[26]!, render: Table        },
  27: { schema: CORE_SCHEMAS[27]!, render: OrderedList  },
  28: { schema: CORE_SCHEMAS[28]!, render: BulletList   },
  29: { schema: CORE_SCHEMAS[29]!, render: Note         },
  30: { schema: CORE_SCHEMAS[30]!, render: Spoiler      },
  31: { schema: CORE_SCHEMAS[31]!, render: MathBlock    },
  32: { schema: CORE_SCHEMAS[32]!, render: Embed        },
};

/** Количество компонентов в coreRegistry */
export const CORE_COMPONENT_COUNT = Object.keys(coreRegistry).length; // 24
