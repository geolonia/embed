import { describe, it, expect } from 'vitest';
import {
  sanitizeAttribution,
  buildAttributionFragment,
} from './sanitize-attribution';

const render = (html: string) => {
  const div = document.createElement('div');
  div.append(sanitizeAttribution(html));
  return div;
};

describe('sanitizeAttribution', () => {
  it('通常のアトリビューションのリンクを残す', () => {
    const div = render(
      '<a href="https://example.com/c" target="_blank" rel="noopener">© Example</a>',
    );
    const a = div.querySelector('a');
    expect(a?.getAttribute('href')).toBe('https://example.com/c');
    expect(a?.getAttribute('target')).toBe('_blank');
    expect(a?.textContent).toBe('© Example');
  });

  // GHSA-jrc7-96c5-q579: 連続する危険な属性の 2 つ目が残った
  it('連続する危険な属性をすべて消す', () => {
    const div = render(
      '<details open onload="1" ontoggle="alert(1)" onclick="alert(2)">x</details>',
    );
    expect(div.querySelector('details')).toBeNull();
    expect(div.innerHTML).not.toMatch(/on(load|toggle|click)/);
  });

  it('許可リストにない属性を連続していても全て消す', () => {
    const div = render(
      '<a href="https://example.com" onclick="1" onmouseover="2" style="x:y" id="a">t</a>',
    );
    const a = div.querySelector('a');
    expect(a?.getAttributeNames()).toEqual(['href']);
  });

  it.each([
    '<script>alert(1)</script>',
    '<iframe srcdoc="<script>alert(1)</script>"></iframe>',
    '<svg onload="alert(1)"></svg>',
    '<math><mi>x</mi></math>',
    '<style>a{}</style>',
    '<form><input name="remove"></form>',
  ])('許可リストにない要素を消す: %s', (html) => {
    const div = render(html);
    expect(
      div.querySelector('script,iframe,svg,math,style,form,input'),
    ).toBeNull();
  });

  it.each([
    'javascript:alert(1)',
    ' JaVaScRiPt:alert(1)',
    'java\tscript:alert(1)',
    'data:text/html,<script>alert(1)</script>',
  ])('href の危険なプロトコルを消す: %s', (href) => {
    const div = render(`<a href="${href}">t</a>`);
    expect(div.querySelector('a')?.hasAttribute('href')).toBe(false);
  });

  it('img の src は http(s) だけ許可する', () => {
    const ok = render('<img src="https://example.com/a.png" alt="a">');
    expect(ok.querySelector('img')?.getAttribute('src')).toBe(
      'https://example.com/a.png',
    );
    const ng = render('<img src="javascript:alert(1)" onerror="alert(1)">');
    expect(ng.querySelector('img')?.getAttributeNames()).toEqual([]);
  });

  it('許可されない要素は子ごと消し、前後の許可された内容は残す', () => {
    const div = render(
      '<a href="https://example.com">a</a><script>x</script>b',
    );
    expect(div.textContent).toBe('ab');
  });

  it('doc.body を名前付き要素で隠そうとしても無害化される', () => {
    const div = render(
      '<img name="body"><img name="body"><a href="https://a.example" onclick="1">A</a><script>x</script>',
    );
    expect(div.querySelector('script')).toBeNull();
    expect(div.querySelector('a')?.getAttributeNames()).toEqual(['href']);
  });

  it('未閉じの許可されない要素があっても空の文字列で壊れない', () => {
    expect(sanitizeAttribution('').hasChildNodes()).toBe(false);
    expect(() => sanitizeAttribution('<script>')).not.toThrow();
  });
});

describe('buildAttributionFragment', () => {
  const text = (list: string[]) => {
    const div = document.createElement('div');
    div.append(buildAttributionFragment(list));
    return div.textContent;
  };

  it('アトリビューションを " | " で区切って並べる', () => {
    expect(text(['<a href="https://a.example">A</a>', 'B'])).toBe('A | B');
  });

  it('無害化の結果が空になったものは区切りごと除く', () => {
    expect(text(['<script>x</script>', 'A', '<script>y</script>', 'B'])).toBe(
      'A | B',
    );
  });

  it('すべて空になれば何も残さない', () => {
    expect(
      buildAttributionFragment(['<script>x</script>']).hasChildNodes(),
    ).toBe(false);
    expect(buildAttributionFragment([]).hasChildNodes()).toBe(false);
  });

  it('あるアトリビューションの未閉じの許可外タグが他を消さない', () => {
    expect(text(['<script>', 'A'])).toBe('A');
  });
});
