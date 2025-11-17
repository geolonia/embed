/**
 * This class is a copy of maplibre-gl-js's util DOM class and rewrite it to JavaScript.
 * https://github.com/maplibre/maplibre-gl-js/blob/main/src/util/dom.ts
 * */
export declare class DOM {
    #private;
    static testProp(props: any): any;
    static create(tagName: any, className?: any, container?: any): any;
    static createNS(namespaceURI: any, tagName: any): HTMLElement;
    static disableDrag(): void;
    static enableDrag(): void;
    static setTransform(el: any, value: any): void;
    static addEventListener(target: any, type: any, callback: any, options: any): void;
    static removeEventListener(target: any, type: any, callback: any, options: any): void;
    static suppressClick(): void;
    static mousePos(el: any, e: any): any;
    static touchPos(el: any, touches: any): any[];
    static mouseButton(e: any): any;
    static remove(node: any): void;
}
/**
 * This function is a copy of maplibre-gl-js's util function and rewrite it to JavaScript.
 * https://github.com/maplibre/maplibre-gl-js/blob/main/src/util/util.ts#L223-L228
 * */
export declare function bindAll(fns: any, context: any): void;
