import type { ReactElement } from 'react';

// ─── Field Schema ─────────────────────────────────────────────────────────────

export type FieldType   = 'string' | 'number' | 'list' | 'enum' | 'richtext' | 'component';
export type FieldFormat = 'currency' | 'date' | 'percent';

export interface FieldDef {
  id:       number;
  type:     FieldType;
  label:    string;
  required?: boolean;
  format?:  FieldFormat;
  values?:  string[];
}

export interface ComponentSchema {
  v:      number;
  name:   string;
  fields: FieldDef[];
}

// ─── Parsed Components ────────────────────────────────────────────────────────

export type FieldValue =
  | string
  | number
  | string[]
  | PASHComponent
  | UnknownComponent;

export interface PASHComponent {
  type:   string;
  id:     number;
  fields: Record<string, FieldValue>;
}

export interface UnknownComponent {
  type: 'unknown';
  id:   number;
  raw:  string;
}

export type AnyComponent = PASHComponent | UnknownComponent;

export interface DecodeResult {
  version:    string | null;
  components: AnyComponent[];
}

// ─── Registry ─────────────────────────────────────────────────────────────────

/**
 * RenderFn — функция рендера компонента.
 * Принимает типизированные поля и возвращает ReactElement или HTML-строку.
 */
export type RenderFn<T extends Record<string, any> = Record<string, any>> =
  (fields: T, ctx: RenderContext) => ReactElement | string | null;

export interface RenderContext {
  /** Рекурсивно рендерит вложенный компонент */
  renderChild: (component: AnyComponent) => ReactElement | string | null;
  /** Текущая локаль */
  locale: string;
}

export interface ComponentDefinition<
  T extends Record<string, any> = Record<string, any>
> {
  schema: ComponentSchema;
  render: RenderFn<T>;
}

export type ComponentRegistry = Record<number, ComponentDefinition>;

// ─── Client Options ───────────────────────────────────────────────────────────

export type LocaleCode = 'ru-RU' | 'en-US' | 'de-DE' | (string & {});
export type PromptMode = 'pash' | 'pash+id' | 'events';
export type PromptLang = 'ru' | 'en';

export interface PashClientOptions {
  /** Реестр компонентов. Используй coreRegistry или свой. */
  registry: ComponentRegistry;
  /** Локаль для форматирования чисел и дат. По умолчанию 'ru-RU'. */
  locale?: LocaleCode;
  /** Коллбэк при ошибке рендера компонента */
  onError?: (error: Error, component: AnyComponent) => void;
}

export interface GetSystemPromptOptions {
  lang?: PromptLang;
  mode?: PromptMode;
}

// ─── Renderer Props ───────────────────────────────────────────────────────────

export interface PashRendererProps {
  /** Полная PASH-строка от ИИ */
  stream: string | null | undefined;
  /** Экземпляр PashClient */
  client: PashClient;
  /** CSS-класс обёртки */
  className?: string;
  /** Коллбэк на каждый распарсенный компонент */
  onComponent?: (component: AnyComponent) => void;
}

export interface PashStreamProps {
  /** ReadableStream или AsyncIterable<string> от fetch/SSE */
  readable: ReadableStream<Uint8Array> | ReadableStream<string> | AsyncIterable<string>;
  /** Экземпляр PashClient */
  client: PashClient;
  /** CSS-класс обёртки */
  className?: string;
  /** Коллбэк когда компонент полностью получен */
  onComponent?: (component: AnyComponent) => void;
  /** Коллбэк когда поток завершён */
  onComplete?: (components: AnyComponent[]) => void;
}

// Forward declaration for circular reference in RenderContext
export interface PashClient {
  decode(stream: string): DecodeResult;
  renderComponent(component: AnyComponent): ReactElement | string | null;
  getSystemPrompt(options?: GetSystemPromptOptions): string;
}
