import type { ComponentSchema } from '../core/types.js';

/**
 * Схемы всех 24 core-компонентов.
 * ID 1–11: UI-компоненты
 * ID 20–32: PASH-Doc блоки
 */
export const CORE_SCHEMAS: Record<number, ComponentSchema> = {
  // ── UI Components ──────────────────────────────────────────────────────────

  1: {
    v: 1, name: 'ProductCard',
    fields: [
      { id: 0, type: 'string',   label: 'title',   required: true },
      { id: 1, type: 'string',   label: 'desc' },
      { id: 2, type: 'number',   label: 'price',   format: 'currency' },
      { id: 3, type: 'string',   label: 'cta' },
    ],
  },

  2: {
    v: 1, name: 'Notification',
    fields: [
      { id: 0, type: 'enum',   label: 'level',
        values: ['info', 'warn', 'error'], required: true },
      { id: 1, type: 'string', label: 'message', required: true },
    ],
  },

  3: {
    v: 1, name: 'List',
    fields: [
      { id: 0, type: 'string', label: 'title' },
      { id: 1, type: 'list',   label: 'items', required: true },
    ],
  },

  4: {
    v: 1, name: 'Hero',
    fields: [
      { id: 0, type: 'string', label: 'headline', required: true },
      { id: 1, type: 'string', label: 'sub' },
      { id: 2, type: 'string', label: 'cta' },
    ],
  },

  5: {
    v: 1, name: 'Article',
    fields: [
      { id: 0, type: 'string',   label: 'title',   required: true },
      { id: 1, type: 'string',   label: 'author' },
      { id: 2, type: 'number',   label: 'date',    format: 'date' },
      { id: 3, type: 'richtext', label: 'summary' },
    ],
  },

  6: {
    v: 1, name: 'RichBlock',
    fields: [
      { id: 0, type: 'richtext', label: 'content', required: true },
    ],
  },

  7: {
    v: 1, name: 'Badge',
    fields: [
      { id: 0, type: 'string', label: 'text',  required: true },
      { id: 1, type: 'enum',   label: 'color',
        values: ['gray', 'green', 'blue', 'yellow', 'red', 'purple'] },
    ],
  },

  8: {
    v: 1, name: 'UserCard',
    fields: [
      { id: 0, type: 'string', label: 'name',   required: true },
      { id: 1, type: 'string', label: 'role' },
      { id: 2, type: 'string', label: 'email' },
      { id: 3, type: 'string', label: 'avatar' },
    ],
  },

  9: {
    v: 1, name: 'Rating',
    fields: [
      { id: 0, type: 'string', label: 'score',  required: true },
      { id: 1, type: 'string', label: 'max' },
      { id: 2, type: 'string', label: 'label' },
    ],
  },

  10: {
    v: 1, name: 'PriceTag',
    fields: [
      { id: 0, type: 'number', label: 'price',    format: 'currency', required: true },
      { id: 1, type: 'number', label: 'original', format: 'currency' },
      { id: 2, type: 'string', label: 'badge' },
    ],
  },

  11: {
    v: 1, name: 'SearchResult',
    fields: [
      { id: 0, type: 'string',   label: 'title',   required: true },
      { id: 1, type: 'string',   label: 'url',     required: true },
      { id: 2, type: 'richtext', label: 'snippet' },
    ],
  },

  // ── PASH-Doc Blocks ────────────────────────────────────────────────────────

  20: {
    v: 1, name: 'Heading',
    fields: [
      { id: 0, type: 'enum',   label: 'level',
        values: ['1','2','3','4','5','6'], required: true },
      { id: 1, type: 'string', label: 'text', required: true },
    ],
  },

  21: {
    v: 1, name: 'Paragraph',
    fields: [
      { id: 0, type: 'richtext', label: 'text', required: true },
    ],
  },

  22: {
    v: 1, name: 'Code',
    fields: [
      { id: 0, type: 'string', label: 'lang' },
      { id: 1, type: 'string', label: 'body', required: true },
    ],
  },

  23: {
    v: 1, name: 'Blockquote',
    fields: [
      { id: 0, type: 'string',   label: 'author' },
      { id: 1, type: 'richtext', label: 'text', required: true },
    ],
  },

  24: {
    v: 1, name: 'Image',
    fields: [
      { id: 0, type: 'string', label: 'url',     required: true },
      { id: 1, type: 'string', label: 'alt' },
      { id: 2, type: 'string', label: 'caption' },
    ],
  },

  25: { v: 1, name: 'Divider', fields: [] },

  26: {
    v: 1, name: 'Table',
    fields: [
      { id: 0, type: 'list',   label: 'headers', required: true },
      { id: 1, type: 'string', label: 'rows',    required: true },
    ],
  },

  27: {
    v: 1, name: 'OrderedList',
    fields: [
      { id: 0, type: 'string', label: 'title' },
      { id: 1, type: 'list',   label: 'items', required: true },
    ],
  },

  28: {
    v: 1, name: 'BulletList',
    fields: [
      { id: 0, type: 'string', label: 'title' },
      { id: 1, type: 'list',   label: 'items', required: true },
    ],
  },

  29: {
    v: 1, name: 'Note',
    fields: [
      { id: 0, type: 'enum',     label: 'level',
        values: ['info','tip','warn','danger'], required: true },
      { id: 1, type: 'richtext', label: 'text', required: true },
    ],
  },

  30: {
    v: 1, name: 'Spoiler',
    fields: [
      { id: 0, type: 'string',   label: 'title', required: true },
      { id: 1, type: 'richtext', label: 'body',  required: true },
    ],
  },

  31: {
    v: 1, name: 'Math',
    fields: [
      { id: 0, type: 'enum',   label: 'display',
        values: ['block','inline'], required: true },
      { id: 1, type: 'string', label: 'formula', required: true },
    ],
  },

  32: {
    v: 1, name: 'Embed',
    fields: [
      { id: 0, type: 'enum',   label: 'type',
        values: ['youtube','codepen','codesandbox','twitter'], required: true },
      { id: 1, type: 'string', label: 'url',   required: true },
      { id: 2, type: 'string', label: 'title' },
    ],
  },
};
