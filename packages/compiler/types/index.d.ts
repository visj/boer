import type { Catalog, Type } from '@boer/core';
import type { FlatAst } from '@boer/schema';

export interface SchemaResource<T = any, R extends symbol = any> {
    uri: string;
    id: string | null;
    anchor: string | null;
    schema: Type<T, R>;
    name: string | null;
}

export declare function compile<R extends symbol>(
    catalog: Catalog<R>,
    ast: FlatAst
): SchemaResource<any, R>[];
