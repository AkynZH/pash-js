import { createElement } from 'react';
import { coreRegistry, CORE_COMPONENT_COUNT } from './core';
import { PashClient } from '../client/PashClient';

const client = new PashClient({ registry: coreRegistry });

function render(id: number, fields: Record<string, any>): any {
  const def = coreRegistry[id];
  if (!def) throw new Error(`No component with ID ${id}`);
  const ctx = {
    renderChild: () => null,
    locale: 'ru-RU',
  };
  return def.render(fields, ctx);
}

describe('coreRegistry — count', () => {
  test('ровно 24 компонента', () => {
    expect(CORE_COMPONENT_COUNT).toBe(24);
    expect(Object.keys(coreRegistry).length).toBe(24);
  });

  test('все схемы имеют name и fields', () => {
    Object.entries(coreRegistry).forEach(([id, def]) => {
      expect(def.schema.name).toBeTruthy();
      expect(Array.isArray(def.schema.fields)).toBe(true);
    });
  });

  test('все компоненты имеют render-функцию', () => {
    Object.entries(coreRegistry).forEach(([id, def]) => {
      expect(typeof def.render).toBe('function');
    });
  });
});

describe('UI Components — render', () => {
  test('1 ProductCard — не бросает', () => {
    expect(() => render(1, { title: 'X1', desc: 'AMOLED', price: '69 990 ₽', cta: 'Купить' })).not.toThrow();
  });

  test('2 Notification info — не бросает', () => {
    expect(() => render(2, { level: 'info', message: 'Всё хорошо' })).not.toThrow();
  });

  test('2 Notification — невалидный level не бросает', () => {
    expect(() => render(2, { level: 'critical', message: 'Упс' })).not.toThrow();
  });

  test('3 List с items-массивом', () => {
    expect(() => render(3, { title: 'Хар-ки', items: ['AMOLED', '256GB'] })).not.toThrow();
  });

  test('4 Hero', () => {
    expect(() => render(4, { headline: 'Заголовок', sub: 'Подзаголовок', cta: 'Кнопка' })).not.toThrow();
  });

  test('5 Article с summary', () => {
    expect(() => render(5, { title: 'Статья', author: 'Автор', summary: 'Текст с **акцентом**' })).not.toThrow();
  });

  test('6 RichBlock', () => {
    expect(() => render(6, { content: 'Текст _курсив_' })).not.toThrow();
  });

  test('7 Badge все цвета', () => {
    ['gray','green','blue','yellow','red','purple'].forEach(color => {
      expect(() => render(7, { text: 'Label', color })).not.toThrow();
    });
  });

  test('8 UserCard с аватаром и без', () => {
    expect(() => render(8, { name: 'Иван', role: 'Dev', email: 'i@example.com' })).not.toThrow();
    expect(() => render(8, { name: 'Иван', avatar: 'https://example.com/img.jpg' })).not.toThrow();
  });

  test('9 Rating', () => {
    expect(() => render(9, { score: '4.5', max: '5', label: 'Отлично' })).not.toThrow();
  });

  test('10 PriceTag с оригинальной ценой и бейджем', () => {
    expect(() => render(10, { price: '69 990 ₽', original: '89 990 ₽', badge: '−22%' })).not.toThrow();
  });

  test('11 SearchResult', () => {
    expect(() => render(11, { title: 'Результат', url: 'https://example.com', snippet: 'Описание...' })).not.toThrow();
  });
});

describe('Doc Components — render', () => {
  test('20 Heading уровни 1-6', () => {
    [1,2,3,4,5,6].forEach(lvl => {
      expect(() => render(20, { level: String(lvl), text: 'Заголовок' })).not.toThrow();
    });
  });

  test('21 Paragraph richtext', () => {
    expect(() => render(21, { text: 'Текст с **акцентом** и `кодом`' })).not.toThrow();
  });

  test('22 Code с lang', () => {
    expect(() => render(22, { lang: 'python', body: 'print("hello")' })).not.toThrow();
  });

  test('22 Code без lang', () => {
    expect(() => render(22, { body: 'const x = 1;' })).not.toThrow();
  });

  test('23 Blockquote с автором и без', () => {
    expect(() => render(23, { author: 'Автор', text: 'Цитата' })).not.toThrow();
    expect(() => render(23, { text: 'Цитата без автора' })).not.toThrow();
  });

  test('24 Image с подписью', () => {
    expect(() => render(24, { url: 'img.jpg', alt: 'Alt', caption: 'Подпись' })).not.toThrow();
  });

  test('25 Divider', () => {
    expect(() => render(25, {})).not.toThrow();
  });

  test('26 Table', () => {
    expect(() => render(26, { headers: ['A','B','C'], rows: '1,2,3;4,5,6' })).not.toThrow();
  });

  test('27 OrderedList', () => {
    expect(() => render(27, { title: 'Шаги', items: ['Шаг 1','Шаг 2','Шаг 3'] })).not.toThrow();
  });

  test('28 BulletList', () => {
    expect(() => render(28, { items: ['A','B','C'] })).not.toThrow();
  });

  test('29 Note все уровни', () => {
    ['info','tip','warn','danger'].forEach(lvl => {
      expect(() => render(29, { level: lvl, text: 'Текст' })).not.toThrow();
    });
  });

  test('30 Spoiler', () => {
    expect(() => render(30, { title: 'Показать', body: 'Содержимое с _курсивом_' })).not.toThrow();
  });

  test('31 Math block и inline', () => {
    expect(() => render(31, { display: 'block',  formula: 'E = mc^2' })).not.toThrow();
    expect(() => render(31, { display: 'inline', formula: 'x^2' })).not.toThrow();
  });

  test('32 Embed youtube', () => {
    expect(() => render(32, { type: 'youtube', url: 'https://youtu.be/dQw4w9WgXcQ', title: 'Video' })).not.toThrow();
  });

  test('32 Embed неизвестный тип — не бросает', () => {
    expect(() => render(32, { type: 'unknown_site', url: 'https://example.com' })).not.toThrow();
  });
});

describe('Full pipeline: decode → render', () => {
  test('поток из 5 компонентов рендерится без ошибок', () => {
    const stream = [
      '4|Флагман|Best 2025|Купить',
      '1|Смартфон X1|AMOLED|69990|Купить',
      '2|warn|Последний',
      '20|2|Характеристики',
      '21|Текст с **акцентом**',
    ].join('\n');

    const decoded = client.decode(stream);
    expect(decoded.components).toHaveLength(5);
    decoded.components.forEach(comp => {
      expect(() => client.renderComponent(comp)).not.toThrow();
    });
  });

  test('пустые поля не вызывают ошибки рендера', () => {
    const decoded = client.decode('1|||0|');
    expect(() => client.renderComponent(decoded.components[0])).not.toThrow();
  });
});
