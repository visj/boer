import {
    VALUE, NULL, UNDEFINED, BOOLEAN,
    NUMBER, STRING,
    ANY, NEVER,
    BARE_ARRAY as ARRAY,
    BARE_OBJECT as OBJECT,
} from '@luvd/core';
import {
    catalog,
} from '@luvd/validate';
import { allocators } from '@luvd/builder';
import { createDiagnose } from '@luvd/diagnose';

/** @type {import('@luvd/core').Catalog<import('uvd').UVD>} */
const uvd = catalog();

const {
    object, array, union,
    string, number, boolean,
    refine, tuple, record,
    or, exclusive, intersect, not, when,
    optional, nullable,
} = allocators(uvd);

export const validate = uvd.validate;
export const diagnose = createDiagnose(uvd);

export {
    object, array, union,
    string, number, boolean,
    refine, tuple, record,
    or, exclusive, intersect, not, when,
    optional, nullable,
}

export {
    VALUE, NULL, UNDEFINED, BOOLEAN,
    NUMBER, STRING,
    ANY, NEVER,
    ARRAY, OBJECT,
}
