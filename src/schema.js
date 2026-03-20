/// <reference path="../global.d.ts" />
import { resolve } from "uri-js";
import { STRING, NUMBER, INTEGER, BOOLEAN, NULLABLE } from "./catalog.js";

// AST kind constants
const K_OBJECT = 1;
const K_ARRAY = 2;
const K_REFINE = 4;
const K_OR = 7;
const K_EXCLUSIVE = 8;
const K_INTERSECT = 9;
const K_NOT = 10;
const K_CONDITIONAL = 11;
const K_REF = 12;

/**
 * Returns the number of Unicode code points in a string.
 * JSON Schema counts code points, not UTF-16 code units.
 * @param {string} str
 * @returns {number}
 */
function codePointLength(str) {
    let len = 0;
    for (let i = 0; i < str.length; i++) {
        let code = str.charCodeAt(i);
        if (code >= 0xD800 && code <= 0xDBFF) {
            i++; // skip low surrogate
        }
        len++;
    }
    return len;
}

/**
 * Builds a self-referential "any" type that matches all JSON values.
 * Uses K_OR([primitives | null, empty object, array of self]).
 * Created once per parseJsonSchema call via ctx.anyIdx.
 * @param {{ defs: Array, names: string[], anyIdx: number }} ctx
 * @returns {uvd.ast.AstRef}
 */
function buildAnyType(ctx) {
    if (ctx.anyIdx >= 0) return { k: K_REF, r: ctx.anyIdx };
    let idx = ctx.defs.length;
    ctx.anyIdx = idx;
    ctx.names.push('$any');
    ctx.defs.push(null); // placeholder for forward declaration
    ctx.defs[idx] = { k: K_OR, i: [
        STRING | NUMBER | BOOLEAN | NULLABLE,
        { k: K_OBJECT, p: {} },
        { k: K_ARRAY, i: { k: K_REF, r: idx } },
    ]};
    return { k: K_REF, r: idx };
}

/**
 * Maps a single JSON Schema type string to an AST node.
 * @param {string} type
 * @param {{ defs: Array, names: string[], anyIdx: number }} ctx
 * @returns {number | uvd.ast.AstNode}
 */
function mapSingleType(type, ctx) {
    switch (type) {
        case 'string':  return STRING;
        case 'number':  return NUMBER;
        case 'integer': return INTEGER;
        case 'boolean': return BOOLEAN;
        case 'null':    return NULLABLE;
        case 'object':  return { k: K_OBJECT, p: {} };
        case 'array':   return { k: K_ARRAY, i: buildAnyType(ctx) };
    }
    throw new Error('Unknown JSON Schema type: ' + type);
}

/**
 * Maps the `type` keyword value (string or array) to an AST node.
 * @param {string | string[]} type
 * @param {{ defs: Array, names: string[], anyIdx: number }} ctx
 * @returns {number | uvd.ast.AstNode}
 */
function mapType(type, ctx) {
    if (typeof type === 'string') {
        return mapSingleType(type, ctx);
    }
    // Array of types → K_OR
    if (type.length === 1) {
        return mapSingleType(type[0], ctx);
    }
    let variants = new Array(type.length);
    for (let i = 0; i < type.length; i++) {
        variants[i] = mapSingleType(type[i], ctx);
    }
    return { k: K_OR, i: variants };
}

/**
 * Collects validator callbacks from a JSON Schema object.
 * Each callback returns true if valid, implementing the "ignores non-matching types" semantics.
 * @param {object} schema
 * @returns {Array<(data: any) => boolean>}
 */
function collectValidators(schema) {
    let checks = [];

    // String validators
    if ('minLength' in schema) {
        let n = schema.minLength;
        checks.push(/** @param {*} d */ (d) => typeof d !== 'string' || codePointLength(d) >= n);
    }
    if ('maxLength' in schema) {
        let n = schema.maxLength;
        checks.push(/** @param {*} d */ (d) => typeof d !== 'string' || codePointLength(d) <= n);
    }
    if ('pattern' in schema) {
        let re = new RegExp(schema.pattern);
        checks.push(/** @param {*} d */ (d) => typeof d !== 'string' || re.test(d));
    }

    // Number validators
    if ('minimum' in schema) {
        let n = schema.minimum;
        checks.push(/** @param {*} d */ (d) => typeof d !== 'number' || d >= n);
    }
    if ('maximum' in schema) {
        let n = schema.maximum;
        checks.push(/** @param {*} d */ (d) => typeof d !== 'number' || d <= n);
    }
    if ('exclusiveMinimum' in schema) {
        let n = schema.exclusiveMinimum;
        checks.push(/** @param {*} d */ (d) => typeof d !== 'number' || d > n);
    }
    if ('exclusiveMaximum' in schema) {
        let n = schema.exclusiveMaximum;
        checks.push(/** @param {*} d */ (d) => typeof d !== 'number' || d < n);
    }
    if ('multipleOf' in schema) {
        let n = schema.multipleOf;
        checks.push(/** @param {*} d */ (d) => typeof d !== 'number' || d % n === 0);
    }

    // Array validators (skeleton)
    if ('minItems' in schema) {
        let n = schema.minItems;
        checks.push(/** @param {*} d */ (d) => !Array.isArray(d) || d.length >= n);
    }
    if ('maxItems' in schema) {
        let n = schema.maxItems;
        checks.push(/** @param {*} d */ (d) => !Array.isArray(d) || d.length <= n);
    }
    if ('uniqueItems' in schema && schema.uniqueItems) {
        checks.push(/** @param {*} d */ (d) => {
            if (!Array.isArray(d)) return true;
            let seen = new Set();
            for (let i = 0; i < d.length; i++) {
                let key = typeof d[i] === 'object' ? JSON.stringify(d[i]) : d[i];
                if (seen.has(key)) return false;
                seen.add(key);
            }
            return true;
        });
    }

    // Object validators (skeleton)
    if ('minProperties' in schema) {
        let n = schema.minProperties;
        checks.push(/** @param {*} d */ (d) => typeof d !== 'object' || d === null || Array.isArray(d) || Object.keys(d).length >= n);
    }
    if ('maxProperties' in schema) {
        let n = schema.maxProperties;
        checks.push(/** @param {*} d */ (d) => typeof d !== 'object' || d === null || Array.isArray(d) || Object.keys(d).length <= n);
    }

    // Enum (skeleton)
    if ('enum' in schema) {
        let values = schema.enum;
        checks.push(/** @param {*} d */ (d) => {
            for (let i = 0; i < values.length; i++) {
                if (d === values[i]) return true;
                if (typeof d === 'object' && d !== null && JSON.stringify(d) === JSON.stringify(values[i])) return true;
            }
            return false;
        });
    }

    // Const (skeleton)
    if ('const' in schema) {
        let val = schema.const;
        checks.push(/** @param {*} d */ (d) => {
            if (d === val) return true;
            if (typeof d === 'object' && d !== null) return JSON.stringify(d) === JSON.stringify(val);
            return false;
        });
    }

    return checks;
}

/**
 * Walks a JSON Schema and produces an AST node.
 * @param {object | boolean} schema
 * @param {{ defs: Array, names: string[], anyIdx: number, refMap: Record<string, number> }} ctx
 * @returns {number | uvd.ast.AstNode}
 */
function walkSchema(schema, ctx) {
    // Boolean schemas
    if (schema === true) return buildAnyType(ctx);
    if (schema === false) return { k: K_NOT, i: buildAnyType(ctx) };

    // $ref (skeleton for future)
    if (schema.$ref) {
        let ref = schema.$ref;
        if (ref.startsWith('#/$defs/')) {
            let name = ref.slice(8);
            let idx = ctx.refMap['#/$defs/' + name];
            if (idx !== void 0) return { k: K_REF, r: idx };
        }
        throw new Error('Unresolved $ref: ' + ref);
    }

    // Composition keywords (skeleton)
    if ('allOf' in schema) {
        let items = schema.allOf;
        let nodes = new Array(items.length);
        for (let i = 0; i < items.length; i++) nodes[i] = walkSchema(items[i], ctx);
        return { k: K_INTERSECT, i: nodes };
    }
    if ('anyOf' in schema) {
        let items = schema.anyOf;
        let nodes = new Array(items.length);
        for (let i = 0; i < items.length; i++) nodes[i] = walkSchema(items[i], ctx);
        return { k: K_OR, i: nodes };
    }
    if ('oneOf' in schema) {
        let items = schema.oneOf;
        let nodes = new Array(items.length);
        for (let i = 0; i < items.length; i++) nodes[i] = walkSchema(items[i], ctx);
        return { k: K_EXCLUSIVE, i: nodes };
    }
    if ('not' in schema) {
        return { k: K_NOT, i: walkSchema(schema.not, ctx) };
    }
    if ('if' in schema) {
        return {
            k: K_CONDITIONAL,
            if: walkSchema(schema.if, ctx),
            then: schema.then ? walkSchema(schema.then, ctx) : void 0,
            else: schema.else ? walkSchema(schema.else, ctx) : void 0,
        };
    }

    let typeNode = null;
    if ('type' in schema) {
        typeNode = mapType(schema.type, ctx);
    }

    let checks = collectValidators(schema);

    // Pure type check, no validators
    if (checks.length === 0 && typeNode !== null) {
        return typeNode;
    }

    // Validators present → wrap in K_REFINE
    if (checks.length > 0) {
        let inner = typeNode !== null ? typeNode : buildAnyType(ctx);
        let fn = checks.length === 1 ? checks[0] :
            /** @param {*} d */ (d) => {
                for (let i = 0; i < checks.length; i++) {
                    if (!checks[i](d)) return false;
                }
                return true;
            };
        return { k: K_REFINE, i: inner, f: fn };
    }

    // Empty schema {} or schema with only meta keywords → matches everything
    return buildAnyType(ctx);
}

/**
 * Parses a JSON Schema object into an AstRoot suitable for compile().
 * @param {import('json-schema-typed').JSONSchema | boolean} schema
 * @returns {uvd.ast.AstRoot}
 */
export function parseJsonSchema(schema) {
    /** @type {Array<uvd.ast.AstNode>} */
    let defs = [];
    /** @type {Array<string>} */
    let names = [];
    let ctx = { defs, names, anyIdx: -1, refMap: {} };

    // Handle $defs
    if (typeof schema === 'object' && schema !== null && schema.$defs) {
        for (let name in schema.$defs) {
            let idx = defs.length;
            ctx.refMap['#/$defs/' + name] = idx;
            names.push(name);
            defs.push(null); // placeholder for forward declaration
        }
        for (let name in schema.$defs) {
            defs[ctx.refMap['#/$defs/' + name]] = walkSchema(schema.$defs[name], ctx);
        }
    }

    let root = walkSchema(schema, ctx);
    return { root, defs, names };
}
