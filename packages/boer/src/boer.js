import {
    VALUE, NULL, UNDEFINED, BOOLEAN,
    NUMBER, STRING,
    ANY, NEVER,
    BARE_ARRAY as ARRAY,
    BARE_OBJECT as OBJECT,
} from '@boer/core';
import {
    catalog,
} from '@boer/validate';
import { allocators } from '@boer/builder';
import { createDiagnose } from '@boer/diagnose';

/** @type {boer.Catalog<boer.boer>} */
const boer = catalog();

const {
    object, array, union,
    string, number, boolean,
    refine, tuple, record,
    or, exclusive, intersect, not, when,
    optional, nullable, literal,
} = allocators(boer);

export const validate = boer.validate;
export const diagnose = createDiagnose(boer);

export {
    object, array, union,
    string, number, boolean,
    refine, tuple, record,
    or, exclusive, intersect, not, when,
    optional, nullable, literal,
}

export {
    VALUE, NULL, UNDEFINED, BOOLEAN,
    NUMBER, STRING,
    ANY, NEVER,
    ARRAY, OBJECT,
}
