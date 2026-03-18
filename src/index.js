import {
    registry,
    PRIMITIVE, NULL, UNDEFINED, BOOLEAN,
    NUMBER, STRING, DATE, URI,
} from "./core";

const uvd = registry();

export const t = uvd.t;
export const v = uvd.v;
export const check = uvd.check;
export const guard = uvd.guard;
export const conform = uvd.conform;
export const validate = uvd.validate;
export const diagnose = uvd.diagnose;

export { PRIMITIVE, NULL, UNDEFINED, BOOLEAN, NUMBER, STRING, DATE, URI }