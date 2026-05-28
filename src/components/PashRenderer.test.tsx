import { PashClient } from '../client/PashClient';
import { coreRegistry } from '../registry/core';

// Минимальная настройка для @testing-library/react
// jest.config в package.json: testEnvironment: jsdom
// Если @testing-library/react не установлен — тесты используют createElement напрямую

const pash = new PashClient({ registry: coreRegistry });

describe('PashRenderer', () => {
  test('null stream → null', () => {
    const result = pash.parse(null as any);
    expect(result).toHaveLength(0);
  });

  test('пустой stream → null', () => {
    const result = pash.parse('');
    expect(result).toHaveLength(0);
  });

  test('один компонент → массив из одного элемента', () => {
    const result = pash.parse('1|Смартфон X1|AMOLED|69990|Купить');
    expect(result).toHaveLength(1);
    expect(result[0]).not.toBeNull();
  });

  test('несколько компонентов', () => {
    const result = pash.parse('1|X1|Y|100|Z\n2|info|OK\n29|tip|Совет');
    expect(result).toHaveLength(3);
  });

  test('неизвестный компонент → null в массиве', () => {
    const result = pash.parse('99|неизвестный');
    expect(result).toHaveLength(1);
    expect(result[0]).toBeNull();
  });

  test('onError вызывается если рендер бросает', () => {
    const errors: Error[] = [];
    const badRegistry = {
      ...coreRegistry,
      1: {
        ...coreRegistry[1],
        render: () => { throw new Error('test error'); },
      },
    };
    const badClient = new PashClient({
      registry: badRegistry,
      onError: (err) => errors.push(err),
    });

    expect(() => badClient.parse('1|X|Y|100|Z')).not.toThrow();
    expect(errors).toHaveLength(1);
    expect(errors[0].message).toBe('test error');
  });
});
