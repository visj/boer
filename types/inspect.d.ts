import { Heap } from "./catalog.js"

declare module "./catalog.js" {

    export interface Dictionary {
        readonly KEY_DICT: Map<string,number>;
        readonly KEY_INDEX: Map<number,string>;
    }
    export interface Catalog<R> {
        readonly __heap: {
            readonly HEAP: Heap;
            readonly VOL_HEAP: Heap;
            readonly DICT: Dictionary;
        }
    }
}

export {}