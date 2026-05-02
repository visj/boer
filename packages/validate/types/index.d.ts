import type { Catalog, Config, Complex } from '@luvd/core';

export declare function catalog<R extends symbol>(cfg?: Config): Catalog<R>;