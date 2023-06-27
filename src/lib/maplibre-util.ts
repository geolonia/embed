import Point from '@mapbox/point-geometry';

/**
 * This class is a copy of maplibre-gl-js's util DOM class and rewrite it to JavaScript.
 * https://github.com/maplibre/maplibre-gl-js/blob/main/src/util/dom.ts
 * */
export class DOM {
  static #docStyle = typeof window !== 'undefined' && window.document && window.document.documentElement.style;

  static #userSelect;

  static #selectProp = DOM.testProp(['userSelect', 'MozUserSelect', 'WebkitUserSelect', 'msUserSelect']);

  static #transformProp = DOM.testProp(['transform', 'WebkitTransform']);

  static testProp(props) {
    if (!DOM['#docStyle']) return props[0];
    for (let i = 0; i < props.length; i++) {
      if (props[i] in DOM['#docStyle']) {
        return props[i];
      }
    }
    return props[0];
  }

  static create(tagName, className?, container?) {
    const el = window.document.createElement(tagName);
    if (className !== undefined) el.className = className;
    if (container) container.appendChild(el);
    return el;
  }

  static createNS(namespaceURI, tagName) {
    const el = window.document.createElementNS(namespaceURI, tagName);
    return el;
  }

  static disableDrag() {
    if (DOM['#docStyle'] && DOM['#selectProp']) {
      DOM['#userSelect'] = DOM['#docStyle'][DOM['#selectProp']];
      DOM['#docStyle'][DOM['#selectProp']] = 'none';
    }
  }

  static enableDrag() {
    if (DOM['#docStyle'] && DOM['#selectProp']) {
      DOM['#docStyle'][DOM['#selectProp']] = DOM['#userSelect'];
    }
  }

  static setTransform(el, value) {
    el.style[DOM['#transformProp']] = value;
  }

  static addEventListener(target, type, callback, options) {
    if ('passive' in options) {
      target.addEventListener(type, callback, options);
    } else {
      target.addEventListener(type, callback, options.capture);
    }
  }

  static removeEventListener(target, type, callback, options) {
    if ('passive' in options) {
      target.removeEventListener(type, callback, options);
    } else {
      target.removeEventListener(type, callback, options.capture);
    }
  }

  // Suppress the next click, but only if it's immediate.
  static #suppressClickInternal(e) {
    e.preventDefault();
    e.stopPropagation();
    window.removeEventListener('click', DOM['#transformProp'], true);
  }

  static suppressClick() {
    window.addEventListener('click', DOM['#transformProp'], true);
    window.setTimeout(() => {
      window.removeEventListener('click', DOM['#transformProp'], true);
    }, 0);
  }

  static mousePos(el, e) {
    const rect = el.getBoundingClientRect();
    return new Point(
      e.clientX - rect.left - el.clientLeft,
      e.clientY - rect.top - el.clientTop,
    );
  }

  static touchPos(el, touches) {
    const rect = el.getBoundingClientRect();
    const points = [];
    for (let i = 0; i < touches.length; i++) {
      points.push(new Point(
        touches[i].clientX - rect.left - el.clientLeft,
        touches[i].clientY - rect.top - el.clientTop,
      ));
    }
    return points;
  }

  static mouseButton(e) {
    return e.button;
  }

  static remove(node) {
    if (node.parentNode) {
      node.parentNode.removeChild(node);
    }
  }
}

/**
 * This function is a copy of maplibre-gl-js's util function and rewrite it to JavaScript.
 * https://github.com/maplibre/maplibre-gl-js/blob/main/src/util/util.ts#L223-L228
 * */
export function bindAll(fns, context) {
  fns.forEach((fn) => {
    if (!context[fn]) { return; }
    context[fn] = context[fn].bind(context);
  });
}
