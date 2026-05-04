import type { Catalog, Type, PathError } from '@boer/core';

export declare function createDiagnose<R extends symbol>(
    cat: Catalog<R>
): (data: any, typedef: Type<any, R>) => PathError[];
