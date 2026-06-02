import { type ReactElement } from 'react';
import type {
  AnyComponent,
  ComponentRegistry,
  DecodeResult,
  GetSystemPromptOptions,
  LocaleCode,
  PashClientOptions,
  RenderContext,
} from '../core/types.js';

// Динамический импорт pash-sdk (CommonJS)
// eslint-disable-next-line @typescript-eslint/no-var-requires
const sdk = require('pash-sdk');

/**
 * PashClient — центральный класс PASH TypeScript SDK.
 *
 * @example
 * import { PashClient, coreRegistry } from 'pash-js';
 *
 * const pash = new PashClient({ registry: coreRegistry });
 * const systemPrompt = pash.getSystemPrompt();
 * const decoded = pash.decode('1|Смартфон X1|AMOLED|69990|Купить');
 */
export class PashClient {
  private readonly _registry: ComponentRegistry;
  private readonly _locale: LocaleCode;
  private readonly _onError: NonNullable<PashClientOptions['onError']>;

  constructor(options: PashClientOptions) {
    if (!options.registry) {
      throw new Error('PashClient: registry is required');
    }
    this._registry  = options.registry;
    this._locale    = options.locale ?? 'ru-RU';
    this._onError   = options.onError ?? ((err, comp) => {
      console.error(`[pash-js] render error for ${comp.type}:`, err);
    });

    // Синхронизируем локаль с pash-sdk
    try { sdk.setLocale(this._locale); } catch { /* unknown locale ok */ }
  }

  // ─── Schema Registry ────────────────────────────────────────────────────────

  /**
   * Возвращает схему компонента по ID.
   */
  getSchema(id: number) {
    return this._registry[id]?.schema ?? null;
  }

  /**
   * Все зарегистрированные компоненты.
   */
  getComponents(): Array<{ id: number; name: string }> {
    return Object.entries(this._registry).map(([id, def]) => ({
      id:   Number(id),
      name: def.schema.name,
    }));
  }

  /**
   * Создать расширенный клиент с дополнительными компонентами.
   * Не мутирует текущий экземпляр — возвращает новый.
   */
  extend(extra: ComponentRegistry): PashClient {
    return new PashClient({
      registry: { ...this._registry, ...extra },
      locale:   this._locale,
      onError:  this._onError,
    });
  }

  // ─── System Prompt ──────────────────────────────────────────────────────────

  /**
   * Возвращает системный промпт для LLM, построенный из текущего реестра.
   * Автоматически синхронизирован — добавил компонент, промпт обновился.
   */
  getSystemPrompt(options?: GetSystemPromptOptions): string {
    // @pash/prompt — отдельный пакет, pash-sdk не знает про LLM
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    let promptPkg: any;
    try {
      promptPkg = require('@pash/prompt');
    } catch {
      throw new Error(
        'pash-js: @pash/prompt is not installed.\n' +
        'Run: npm install @pash/prompt\n\n' +
        'pash-sdk is LLM-agnostic — prompt generation lives in @pash/prompt.'
      );
    }

    const schemas: Record<number, any> = {};
    for (const [id, def] of Object.entries(this._registry)) {
      schemas[Number(id)] = (def as any).schema;
    }

    const engine = new promptPkg.PromptEngine({ schemas });
    return engine.generate({
      lang: options?.lang ?? 'ru',
      mode: options?.mode ?? 'pash',
    });
  }

  // ─── Decode ─────────────────────────────────────────────────────────────────

  /**
   * Декодирует PASH-поток в массив компонентов.
   */
  decode(stream: string): DecodeResult {
    if (!stream || !stream.trim()) {
      return { version: null, components: [] };
    }

    // Используем схемы из нашего реестра
    const schemas: Record<number, any> = {};
    for (const [id, def] of Object.entries(this._registry)) {
      schemas[Number(id)] = def.schema;
    }

    return sdk.decodeStream(stream, schemas) as DecodeResult;
  }

  // ─── Render ─────────────────────────────────────────────────────────────────

  /**
   * Рендерит один компонент → ReactElement | string | null.
   */
  renderComponent(component: AnyComponent): ReactElement | string | null {
    if (!component) return null;

    if (component.type === 'unknown') {
      return null; // Тихий fallback — не крашим UI
    }

    const def = Object.values(this._registry).find(
      d => d.schema.name === component.type
    );

    if (!def) {
      console.warn(`[pash-js] No renderer for component "${component.type}" (ID: ${(component as any).id})`);
      return null;
    }

    const ctx: RenderContext = {
      renderChild: (child) => this.renderComponent(child),
      locale:      this._locale,
    };

    try {
      return def.render((component as any).fields ?? {}, ctx);
    } catch (err) {
      this._onError(err instanceof Error ? err : new Error(String(err)), component);
      return null;
    }
  }

  /**
   * Рендерит весь декодированный поток → массив ReactElement.
   */
  renderAll(decoded: DecodeResult): Array<ReactElement | string | null> {
    return decoded.components.map(c => this.renderComponent(c));
  }

  /**
   * Удобный метод: decode + render за один вызов.
   */
  parse(stream: string): Array<ReactElement | string | null> {
    return this.renderAll(this.decode(stream));
  }

  // ─── Locale ─────────────────────────────────────────────────────────────────

  get locale(): LocaleCode {
    return this._locale;
  }
}
