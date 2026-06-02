import { PashClient } from './PashClient';
import { coreRegistry } from '../registry/core';

describe('PashClient — constructor', () => {
  test('создаётся с coreRegistry', () => {
    expect(() => new PashClient({ registry: coreRegistry })).not.toThrow();
  });

  test('без registry бросает ошибку', () => {
    expect(() => new PashClient({ registry: undefined as any })).toThrow();
  });

  test('locale по умолчанию ru-RU', () => {
    const c = new PashClient({ registry: coreRegistry });
    expect(c.locale).toBe('ru-RU');
  });

  test('locale можно переопределить', () => {
    const c = new PashClient({ registry: coreRegistry, locale: 'en-US' });
    expect(c.locale).toBe('en-US');
  });
});

describe('PashClient — getComponents', () => {
  test('возвращает 24 компонента из coreRegistry', () => {
    const c    = new PashClient({ registry: coreRegistry });
    const list = c.getComponents();
    expect(list.length).toBe(24);
  });

  test('все компоненты имеют id и name', () => {
    const c = new PashClient({ registry: coreRegistry });
    c.getComponents().forEach(({ id, name }) => {
      expect(typeof id).toBe('number');
      expect(typeof name).toBe('string');
      expect(name.length).toBeGreaterThan(0);
    });
  });
});

describe('PashClient — getSchema', () => {
  const c = new PashClient({ registry: coreRegistry });

  test('ID 1 → ProductCard', () => {
    expect(c.getSchema(1)?.name).toBe('ProductCard');
  });

  test('ID 20 → Heading', () => {
    expect(c.getSchema(20)?.name).toBe('Heading');
  });

  test('несуществующий ID → null', () => {
    expect(c.getSchema(999)).toBeNull();
  });
});

describe('PashClient — decode', () => {
  const c = new PashClient({ registry: coreRegistry });

  test('декодирует ProductCard', () => {
    const r = c.decode('1|Смартфон X1|AMOLED|69990|Купить');
    expect(r.components).toHaveLength(1);
    expect(r.components[0].type).toBe('ProductCard');
  });

  test('декодирует версию', () => {
    const r = c.decode('v:1\n1|X|Y|100|Z');
    expect(r.version).toBe('1');
  });

  test('несколько компонентов', () => {
    const r = c.decode('1|X|Y|100|Z\n2|info|OK\n20|1|Заголовок');
    expect(r.components).toHaveLength(3);
  });

  test('пустая строка → пустой результат', () => {
    expect(c.decode('').components).toHaveLength(0);
    expect(c.decode(null as any).components).toHaveLength(0);
  });

  test('неизвестный компонент → type: unknown', () => {
    const r = c.decode('99|данные');
    expect(r.components[0].type).toBe('unknown');
  });

  test('price форматируется по локали ru-RU', () => {
    const r = c.decode('1|X|Y|69990|Z');
    expect((r.components[0] as any).fields.price).toContain('₽');
  });

  test('price форматируется по локали en-US', () => {
    const en = new PashClient({ registry: coreRegistry, locale: 'en-US' });
    const r  = en.decode('1|X|Y|1299|Z');
    expect((r.components[0] as any).fields.price).toContain('$');
  });
});

describe('PashClient — renderComponent', () => {
  const c = new PashClient({ registry: coreRegistry });

  test('ProductCard → не null', () => {
    const decoded = c.decode('1|Смартфон X1|AMOLED|69990|Купить');
    const el      = c.renderComponent(decoded.components[0]);
    expect(el).not.toBeNull();
  });

  test('unknown → null (тихий fallback)', () => {
    expect(c.renderComponent({ type: 'unknown', id: 99, raw: '' })).toBeNull();
  });

  test('null → null', () => {
    expect(c.renderComponent(null as any)).toBeNull();
  });
});

describe('PashClient — getSystemPrompt', () => {
  const c = new PashClient({ registry: coreRegistry });

  // NOTE: getSystemPrompt requires @pash/prompt installed as a peer dependency.
  // These tests verify the error path when @pash/prompt is missing.

  test('бросает информативную ошибку когда @pash/prompt не установлен', () => {
    expect(() => c.getSystemPrompt()).toThrow(
      /@pash\/prompt is not installed/
    );
  });

  test('ошибка содержит инструкцию по установке', () => {
    expect(() => c.getSystemPrompt()).toThrow(
      /npm install @pash\/prompt/
    );
  });

  test('ошибка упоминает LLM-agnostic архитектуру', () => {
    expect(() => c.getSystemPrompt()).toThrow(
      /LLM-agnostic/
    );
  });

  /*
   * NOTE: The following tests require @pash/prompt to be installed:
   *   npm install @pash/prompt
   *
   * test('возвращает строку', () => {
   *   expect(typeof c.getSystemPrompt()).toBe('string');
   * });
   *
   * test('содержит ProductCard', () => {
   *   expect(c.getSystemPrompt()).toContain('ProductCard');
   * });
   *
   * test('lang: en', () => {
   *   expect(c.getSystemPrompt({ lang: 'en' })).toContain('You are a data');
   * });
   *
   * test('mode: events содержит COMP_START', () => {
   *   expect(c.getSystemPrompt({ mode: 'events' })).toContain('COMP_START');
   * });
   */
});

describe('PashClient — extend', () => {
  const c = new PashClient({ registry: coreRegistry });

  test('возвращает новый экземпляр', () => {
    const c2 = c.extend({
      50: {
        schema: {
          v: 1, name: 'TestWidget',
          fields: [{ id: 0, type: 'string', label: 'text', required: true }],
        },
        render: (f) => `<span>${f.text}</span>` as any,
      },
    });
    expect(c2).not.toBe(c);
    expect(c2.getSchema(50)?.name).toBe('TestWidget');
    // Оригинальный не тронут
    expect(c.getSchema(50)).toBeNull();
  });

  test('расширенный клиент сохраняет оригинальные компоненты', () => {
    const c2 = c.extend({
      50: {
        schema: { v: 1, name: 'X', fields: [] },
        render: () => null as any,
      },
    });
    expect(c2.getSchema(1)?.name).toBe('ProductCard');
  });
});

describe('PashClient — parse (decode + render)', () => {
  const c = new PashClient({ registry: coreRegistry });

  test('возвращает массив ReactElement', () => {
    const els = c.parse('1|Смартфон X1|AMOLED|69990|Купить');
    expect(Array.isArray(els)).toBe(true);
    expect(els.length).toBe(1);
    expect(els[0]).not.toBeNull();
  });

  test('пустой поток → пустой массив', () => {
    expect(c.parse('')).toHaveLength(0);
  });
});
