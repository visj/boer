import {
    catalog,
    PRIMITIVE, NULL, UNDEFINED, BOOLEAN,
    NUMBER, STRING, DATE, URI,
} from "./catalog.js";

const uvd = catalog();

export const t = uvd.t;
export const v = uvd.v;
export const check = uvd.is;
export const guard = uvd.guard;
export const conform = uvd.conform;
export const validate = uvd.validate;
export const diagnose = uvd.diagnose;

export { PRIMITIVE, NULL, UNDEFINED, BOOLEAN, NUMBER, STRING, DATE, URI }