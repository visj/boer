import type { Catalog, Config, Complex } from '@uvd/core';

export declare function catalog<R extends symbol>(cfg?: Config): Catalog<R>;

export declare const BARE_ARRAY: Complex<any[], any>;
export declare const BARE_OBJECT: Complex<Record<string, any>, any>;
export declare const BARE_RECORD: Complex<Record<string, any>, any>;
