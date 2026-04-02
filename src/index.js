import {
    VALUE, NULL, UNDEFINED, BOOLEAN,
    NUMBER, STRING,
    ANY, NEVER
} from './internal/const.js';
import {
    catalog,
    BARE_ARRAY as ARRAY,
    BARE_OBJECT as OBJECT,
} from "./internal/catalog.js";
import { allocators } from './internal/allocate.js';
import { createConform } from './internal/transform.js';
import { createDiagnose } from './internal/error.js';

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
