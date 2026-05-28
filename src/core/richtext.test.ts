import { richtextToHtml, parseRichtext } from './richtext';

describe('richtextToHtml', () => {
  test('экранирует HTML', () => {
    expect(richtextToHtml('<b>test</b>')).toBe('&lt;b&gt;test&lt;/b&gt;');
  });

  test('**bold** → <strong>', () => {
    expect(richtextToHtml('Текст **жирный** конец')).toContain('<strong>жирный</strong>');
  });

  test('_italic_ → <em>', () => {
    expect(richtextToHtml('Текст _курсив_ конец')).toContain('<em>курсив</em>');
  });

  test('`code` → <code>', () => {
    expect(richtextToHtml('Функция `decode()` работает')).toContain('<code>decode()</code>');
  });

  test('[text](url) → <a>', () => {
    const r = richtextToHtml('[GitHub](https://github.com)');
    expect(r).toContain('href="https://github.com"');
    expect(r).toContain('rel="noopener noreferrer"');
  });

  test('XSS в URL → #', () => {
    const r = richtextToHtml('[click](javascript:alert(1))');
    expect(r).not.toContain('javascript:');
    expect(r).toContain('href="#"');
  });

  test('\\n → <br>', () => {
    expect(richtextToHtml('строка1\nстрока2')).toContain('<br>');
  });

  test('пустая строка', () => {
    expect(richtextToHtml('')).toBe('');
  });
});

describe('parseRichtext', () => {
  test('plain text → один текстовый узел', () => {
    const nodes = parseRichtext('hello world');
    expect(nodes).toHaveLength(1);
    expect(nodes[0]).toBe('hello world');
  });

  test('пустая строка → пустой массив', () => {
    expect(parseRichtext('')).toHaveLength(0);
  });

  test('bold → ReactElement', () => {
    const nodes = parseRichtext('до **жирный** после');
    expect(nodes.length).toBeGreaterThan(1);
    // Второй элемент должен быть ReactElement с типом 'strong'
    const boldNode = nodes.find((n: any) => n?.type === 'strong');
    expect(boldNode).toBeTruthy();
  });
});
