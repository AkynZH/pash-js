import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import type { AnyComponent, DecodeResult } from '../core/types.js';
import type { PashClient } from '../client/PashClient.js';

// ─── useDecodeStream ──────────────────────────────────────────────────────────

/**
 * Декодирует статичный PASH-поток.
 *
 * @example
 * const { components, version } = useDecodeStream(aiResponse, pash);
 */
export function useDecodeStream(
  stream: string | null | undefined,
  client: PashClient,
): DecodeResult {
  return useMemo(() => {
    if (!stream) return { version: null, components: [] };
    return client.decode(stream);
  }, [stream, client]);
}

// ─── usePashStream ────────────────────────────────────────────────────────────

export interface UsePashStreamResult {
  /** Компоненты полученные из стрима до сих пор */
  components: AnyComponent[];
  /** true пока поток не завершён */
  streaming: boolean;
  /** Версия из заголовка v:N */
  version: string | null;
  /** Ошибка если поток упал */
  error: Error | null;
  /** Сбросить состояние */
  reset: () => void;
}

/**
 * Читает ReadableStream или AsyncIterable от ИИ,
 * декодирует компоненты по мере поступления.
 *
 * @example
 * const response = await fetch('/api/ai');
 * const { components, streaming } = usePashStream(response.body, pash);
 */
export function usePashStream(
  readable: ReadableStream<Uint8Array | string> | AsyncIterable<string> | null | undefined,
  client: PashClient,
  onComponent?: (c: AnyComponent) => void,
): UsePashStreamResult {
  const [components, setComponents] = useState<AnyComponent[]>([]);
  const [streaming, setStreaming]   = useState(false);
  const [version, setVersion]       = useState<string | null>(null);
  const [error, setError]           = useState<Error | null>(null);

  const decoderRef   = useRef<any>(null);
  const abortRef     = useRef<AbortController | null>(null);

  const reset = useCallback(() => {
    setComponents([]);
    setStreaming(false);
    setVersion(null);
    setError(null);
  }, []);

  useEffect(() => {
    if (!readable) return;

    // Ленивый импорт pash-sdk чтобы не тянуть в SSR
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { StreamingDecoder } = require('pash-sdk');

    const abort = new AbortController();
    abortRef.current = abort;

    // Строим схемы из нашего реестра
    const schemas: Record<number, any> = {};
    const reg = (client as any)._registry;
    if (reg) {
      for (const [id, def] of Object.entries(reg)) {
        schemas[Number(id)] = (def as any).schema;
      }
    }

    const decoder = new StreamingDecoder(
      (component: AnyComponent, ver: string | null) => {
        if (abort.signal.aborted) return;
        if (ver !== null) setVersion(ver);
        setComponents(prev => [...prev, component]);
        onComponent?.(component);
      },
      { registry: Object.keys(schemas).length ? schemas : undefined }
    );

    decoderRef.current = decoder;
    setStreaming(true);
    setComponents([]);
    setError(null);

    async function pump() {
      try {
        const utf8 = new TextDecoder();

        if (Symbol.asyncIterator in (readable as any)) {
          // AsyncIterable<string>
          for await (const chunk of readable as AsyncIterable<string>) {
            if (abort.signal.aborted) break;
            decoder.push(chunk);
          }
        } else {
          // ReadableStream
          const reader = (readable as ReadableStream).getReader();
          while (true) {
            const { done, value } = await reader.read();
            if (done || abort.signal.aborted) break;
            const text = typeof value === 'string' ? value : utf8.decode(value, { stream: true });
            decoder.push(text);
          }
        }

        decoder.flush();
      } catch (err) {
        if (!abort.signal.aborted) {
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      } finally {
        if (!abort.signal.aborted) setStreaming(false);
      }
    }

    pump();

    return () => {
      abort.abort();
      setStreaming(false);
    };
  }, [readable]); // eslint-disable-line react-hooks/exhaustive-deps

  return { components, streaming, version, error, reset };
}

// ─── usePashClient ────────────────────────────────────────────────────────────

/**
 * Мемоизирует PashClient.
 * Пересоздаёт только если изменились options.
 *
 * @example
 * const pash = usePashClient({ registry: coreRegistry, locale: 'en-US' });
 */
export function usePashClient(
  options: ConstructorParameters<typeof (require('../client/PashClient.js') as any).PashClient>[0],
) {
  return useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { PashClient } = require('../client/PashClient.js');
    return new PashClient(options) as InstanceType<typeof import('../client/PashClient.js').PashClient>;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options.registry, options.locale]);
}
