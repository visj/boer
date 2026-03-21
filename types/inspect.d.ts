import { Heap } from "./catalog.js"

declare module "./catalog.js" {

    export interface Dictionary {
        readonly KEY_DICT: Map<string, number>;
        readonly KEY_INDEX: Map<number, string>;
    }
    export interface Catalog<R> {
        readonly __heap: {
            readonly HEAP: Heap;
            readonly SCR_HEAP: Heap;
            readonly DICT: Dictionary;
            readonly CALLBACKS: Array<(...args: any[]) => any>;
            readonly REGEX_CACHE: RegExp[];
            readonly S_CALLBACKS: Array<(...args: any[]) => any>;
            readonly S_REGEX_CACHE: RegExp[];

            /** Allocates a specific kind on the heap. */
            readonly allocKind: (
                header: number,
                registryIndex: number,
                scratch: boolean,
                slots: number
            ) => number;

            /** Allocates a validator with associated payloads. */
            readonly allocValidator: (
                vHeader: number,
                payloads: number[],
                scratch: boolean
            ) => number;

            /** Allocate entries on the SLAB and register in a typed registry (TUPLES or MATCHES). */
            readonly allocOnSlab: (
                types: number[],
                scratch: boolean,
                kind: 'tuple' | 'match'
            ) => number;

            /** Performs a dictionary lookup for a given key string. */
            readonly lookup: (key: string) => number;

            /** Writes pre-resolved [keyId, typedef, ...] pairs to SLAB, registers in OBJECTS. */
            readonly registerObject: (
                resolved: number[],
                count: number,
                scratch: boolean
            ) => number;

            /** Registers an element type in ARRAYS. */
            readonly registerArray: (
                elemType: number,
                scratch: boolean
            ) => number;

            /** Writes variant pairs to SLAB, registers in UNIONS. */
            readonly registerUnion: (
                resolved: number[],
                count: number,
                discKeyId: number,
                scratch: boolean
            ) => number;
        }
    }
}

export { }