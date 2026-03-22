import {
    VALUE, NULL, UNDEFINED, BOOLEAN,
    NUMBER, STRING, DATE, URI, BIGINT,
    ANY, NEVER, TRUE, FALSE, ARRAY, OBJECT,
    STRICT_REJECT, STRICT_DELETE, STRICT_PROTO
} from './internal/const.js';
import {
    catalog
} from "./internal/catalog.js";
import { allocators, $allocators } from './internal/allocate.js';

/** @type {uvd.Catalog<uvd.UVD>} */
const uvd = catalog();

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

export const is = uvd.is;
export const guard = uvd.guard;
export const conform = uvd.conform;
export const validate = uvd.validate;
export const diagnose = uvd.diagnose;

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
    ANY, NEVER, TRUE, FALSE, ARRAY, OBJECT,
    STRICT_REJECT, STRICT_DELETE, STRICT_PROTO
}
