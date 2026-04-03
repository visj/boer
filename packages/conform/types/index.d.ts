import type { Catalog, Type } from '@uvd/core';

export declare function createConform<R extends symbol>(
    cat: Catalog<R>
): <T>(data: any, typedef: Type<T, R>, preserve?: boolean) => data is T;
