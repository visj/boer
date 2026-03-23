import {
    VALUE, NULL, UNDEFINED, BOOLEAN,
    NUMBER, STRING, DATE, URI, BIGINT,
    ANY, NEVER, TRUE, FALSE
} from './internal/const.js';
import {
    catalog
} from "./internal/catalog.js";
import { allocators, $allocators } from './internal/allocate.js';
import { createConform } from './internal/transform.js';
import { createDiagnose } from './internal/error.js';

/** @type {uvd.Catalog<uvd.UVD>} */
const uvd = catalog();

/** Pre-allocated bare complex types from the default catalog */
const ARRAY = uvd.__heap.BARE_ARRAY;
const OBJECT = uvd.__heap.BARE_OBJECT;

const {
    object, array, union,
    string, number, boolean, bigint, date, uri,
    refine, tuple, record,
    or, exclusive, intersect, not, when,
    optional, nullable,
} = allocators(uvd);

const {
    $object, $array, $union,
    $string, $number, $boolean, $bigint, $date, $uri,
    $refine, $tuple, $record,
    $or, $exclusive, $intersect, $not, $when,
} = $allocators(uvd);

export const conform = createConform(uvd);
export const validate = uvd.validate;
export const diagnose = createDiagnose(uvd);

export {
    object, array, union,
    string, number, boolean, bigint, date, uri,
    refine, tuple, record,
    or, exclusive, intersect, not, when,
    optional, nullable,
}

export {
    $object, $array, $union,
    $string, $number, $boolean, $bigint, $date, $uri,
    $refine, $tuple, $record,
    $or, $exclusive, $intersect, $not, $when,
}

export {
    VALUE, NULL, UNDEFINED, BOOLEAN,
    NUMBER, STRING, DATE, URI, BIGINT,
    ANY, NEVER, TRUE, FALSE,
    ARRAY, OBJECT,
}
