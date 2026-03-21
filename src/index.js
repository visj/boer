import {
    PRIMITIVE, NULL, UNDEFINED, BOOLEAN,
    NUMBER, STRING, DATE, URI, BIGINT,
    ANY, NEVER, TRUE, FALSE, ARRAY, OBJECT,
    STRICT_REJECT, STRICT_DELETE, STRICT_PROTO
} from './const.js';
import {
    catalog
} from "./catalog.js";

/** @type {uvd.cat.Catalog<uvd.UVD>} */
const uvd = catalog();

export const t = uvd.t;
export const v = uvd.v;
export const is = uvd.is;
export const guard = uvd.guard;
export const conform = uvd.conform;
export const validate = uvd.validate;
export const diagnose = uvd.diagnose;

export {
    PRIMITIVE, NULL, UNDEFINED, BOOLEAN,
    NUMBER, STRING, DATE, URI, BIGINT,
    ANY, NEVER, TRUE, FALSE, ARRAY, OBJECT,
    STRICT_REJECT, STRICT_DELETE, STRICT_PROTO
}