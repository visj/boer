import type { Catalog, Config } from '@boer/core';

export declare function print(cat: Catalog<any>): {
    stats: Record<string, number>;
    config: Config;
};

export declare function dump(cat: Catalog<any>): Uint8Array;

export declare function load(bin: Uint8Array, cfg?: Config): Catalog<any>;
