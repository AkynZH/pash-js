/**
 * pash-js — TypeScript/React SDK for PASH
 * Protocol for Agentic Semantic Hypermedia
 *
 * @example
 * import { PashClient, coreRegistry, PashRenderer } from 'pash-js';
 *
 * const pash = new PashClient({ registry: coreRegistry });
 * const systemPrompt = pash.getSystemPrompt();
 *
 * // In React:
 * <PashRenderer stream={aiResponse} client={pash} />
 */

// ─── Core Client ─────────────────────────────────────────────────────────────
export { PashClient } from './client/PashClient.js';

// ─── Registry ────────────────────────────────────────────────────────────────
export { coreRegistry, CORE_COMPONENT_COUNT } from './registry/core.js';
export { CORE_SCHEMAS } from './registry/schemas.js';

// ─── React Components ────────────────────────────────────────────────────────
export { PashRenderer } from './components/PashRenderer.js';
export { PashStream }   from './components/PashStream.js';

// ─── React Hooks ─────────────────────────────────────────────────────────────
export { useDecodeStream, usePashStream, usePashClient } from './hooks/usePash.js';

// ─── Richtext ────────────────────────────────────────────────────────────────
export { parseRichtext, richtextToHtml } from './core/richtext.js';

// ─── Types (re-export all) ────────────────────────────────────────────────────
export type {
  // Schema
  FieldDef,
  FieldType,
  FieldFormat,
  ComponentSchema,
  // Components
  PASHComponent,
  UnknownComponent,
  AnyComponent,
  FieldValue,
  DecodeResult,
  // Registry
  ComponentDefinition,
  ComponentRegistry,
  RenderFn,
  RenderContext,
  // Client
  PashClientOptions,
  GetSystemPromptOptions,
  LocaleCode,
  PromptMode,
  PromptLang,
  // Props
  PashRendererProps,
  PashStreamProps,
} from './core/types.js';

// ─── Version ─────────────────────────────────────────────────────────────────
export const VERSION = '1.0.0';
