import {
    VALUE, NULL, UNDEFINED, BOOLEAN,
    NUMBER, STRING,
    ANY, NEVER
} from '@uvd/core';
import {
    catalog,
    BARE_ARRAY as ARRAY,
    BARE_OBJECT as OBJECT,
} from '@uvd/validate';
import { allocators } from '@uvd/builder';
import { createConform } from '@uvd/conform';
import { createDiagnose } from '@uvd/diagnose';

/** @type {uvd.Catalog<uvd.UVD>} */
const uvd = catalog();

const {
    object, array, union,
    string, number, boolean,
    refine, tuple, record,
    or, exclusive, intersect, not, when,
    optional, nullable,
} = allocators(uvd);

export const validate = uvd.validate;
export const conform = createConform(uvd);
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
