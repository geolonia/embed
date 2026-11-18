/**
 * アトリビューション HTML の無害化。
 * maplibre-gl 5.24.1 の DOM.sanitize (許可リスト方式) と同じ方針で、
 * CustomAttributionControl が使う。
 * https://github.com/maplibre/maplibre-gl-js/blob/v5.24.1/src/util/dom.ts
 *
 * 文字列ではなく DocumentFragment を返す。シリアライズして再パースすると、
 * 入れ子の組み立て次第で無害化済みの木が別の木に変わるため。
 */

const HTML_NAMESPACE = 'http://www.w3.org/1999/xhtml';

const ALLOWED_TAGS = new Set([
  'a',
  'abbr',
  'b',
  'bdi',
  'bdo',
  'br',
  'cite',
  'code',
  'del',
  'div',
  'em',
  'i',
  'img',
  'ins',
  'kbd',
  'li',
  'mark',
  'ol',
  'p',
  'q',
  's',
  'samp',
  'small',
  'span',
  'strong',
  'sub',
  'sup',
  'time',
  'u',
  'ul',
  'var',
  'wbr',
]);

const ALLOWED_ATTRIBUTES = new Set([
  'alt',
  'class',
  'datetime',
  'dir',
  'height',
  'href',
  'hreflang',
  'lang',
  'referrerpolicy',
  'rel',
  'role',
  'src',
  'target',
  'title',
  'translate',
  'type',
  'width',
]);

const URL_ATTRIBUTES = new Set(['href', 'src']);
const ALLOWED_PROTOCOLS = new Set(['http:', 'https:', 'mailto:']);

// 相対 URL もプロトコルを読むために何かに解決する。結果のプロトコルだけを使い、
// ベースは出力に残らない。
const RELATIVE_URL_BASE = 'https://geolonia.invalid/';

type ElementInternals = {
  getAttribute: Element['getAttribute'];
  getAttributeNames: Element['getAttributeNames'];
  querySelectorAll: Element['querySelectorAll'];
  remove: Element['remove'];
  removeAttribute: Element['removeAttribute'];
  localName: () => string;
  namespaceURI: () => string | null;
};

let elementInternals: ElementInternals | undefined;

/**
 * 無害化に使う Element のメンバーは、対象の要素ではなくプロトタイプから読む。
 * `children` `remove` `localName` などの名前を持つフォーム部品は、
 * 自身の form 要素の同名プロパティを隠してしまい、入力側が無害化の見る木を選べてしまう。
 * モジュール読み込み時に DOM が無い環境 (SSR) もあるので、初回利用時に読む。
 */
const getElementInternals = (): ElementInternals => {
  if (!elementInternals) {
    const getter = (name: string) =>
      (
        Object.getOwnPropertyDescriptor(Element.prototype, name) as {
          get: () => unknown;
        }
      ).get;
    elementInternals = {
      getAttribute: Element.prototype.getAttribute,
      getAttributeNames: Element.prototype.getAttributeNames,
      querySelectorAll: Element.prototype.querySelectorAll,
      remove: Element.prototype.remove,
      removeAttribute: Element.prototype.removeAttribute,
      localName: getter('localName') as () => string,
      namespaceURI: getter('namespaceURI') as () => string | null,
    };
  }
  return elementInternals;
};

/**
 * `<img name="body">` などの名前付き要素が `doc.body` を隠す実装があるため、
 * body も Document.prototype の getter から読む。
 */
const getDocumentBody = (doc: Document): HTMLElement => {
  const get = (
    Object.getOwnPropertyDescriptor(Document.prototype, 'body') as {
      get: () => HTMLElement;
    }
  ).get;
  return get.call(doc);
};

const isAllowedElement = (element: Element): boolean => {
  const { namespaceURI, localName } = getElementInternals();
  return (
    namespaceURI.call(element) === HTML_NAMESPACE &&
    ALLOWED_TAGS.has(localName.call(element))
  );
};

const isAllowedAttribute = (name: string, value: string): boolean => {
  if (!ALLOWED_ATTRIBUTES.has(name) && !name.startsWith('aria-')) return false;
  if (!URL_ATTRIBUTES.has(name)) return true;
  try {
    return ALLOWED_PROTOCOLS.has(new URL(value, RELATIVE_URL_BASE).protocol);
  } catch {
    return false;
  }
};

const removeDisallowedAttributes = (element: Element): void => {
  const { getAttributeNames, getAttribute, removeAttribute } =
    getElementInternals();
  // getAttributeNames は静的な配列を返すので、削除しながら回しても飛ばさない。
  for (const name of getAttributeNames.call(element)) {
    if (isAllowedAttribute(name, getAttribute.call(element, name) ?? '')) {
      continue;
    }
    removeAttribute.call(element, name);
  }
};

export const sanitizeAttribution = (html: string): DocumentFragment => {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const body = getDocumentBody(doc);
  const { querySelectorAll, remove } = getElementInternals();
  for (const element of Array.from(
    querySelectorAll.call(body, '*') as NodeListOf<Element>,
  )) {
    if (isAllowedElement(element)) {
      removeDisallowedAttributes(element);
    } else {
      remove.call(element);
    }
  }
  const fragment = document.createDocumentFragment();
  fragment.append(...Array.from(body.childNodes));
  return fragment;
};

/**
 * アトリビューションごとに無害化し、中身が空になったものを除いて ` | ` で区切って並べる。
 * 1 つも残らなければ空の DocumentFragment を返す。
 */
export const buildAttributionFragment = (
  attributions: string[],
): DocumentFragment => {
  const fragment = document.createDocumentFragment();
  let isFirst = true;
  for (const attribution of attributions) {
    const sanitized = sanitizeAttribution(attribution);
    if (!sanitized.hasChildNodes()) continue;
    if (!isFirst) fragment.append(' | ');
    fragment.append(sanitized);
    isFirst = false;
  }
  return fragment;
};
