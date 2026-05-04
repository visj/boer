import { describe, test, expect } from 'bun:test';
import {
    UNDEFINED, NULL, BOOLEAN, NUMBER, STRING, ANY
} from '@boer/core';
import { catalog } from '@boer/validate';
import { allocators } from '@boer/builder';
import { createDiagnose } from '@boer/diagnose';
import { compile } from '@boer/compiler';
import { CompoundSchema } from '@boer/schema';
import fs from 'fs';
import path from 'path';

const cat = catalog();
const {
    object, array, union, string, number, boolean,
    refine, tuple, record, or, exclusive, intersect, not, when,
    optional, nullable,
} = allocators(cat);
const diagnose = createDiagnose(cat);
const { validate } = cat;

// ========== Primitives ==========

describe('diagnose: primitives', () => {
    test('no errors for matching type', () => {
        expect(diagnose('hello', STRING)).toEqual([]);
        expect(diagnose(42, NUMBER)).toEqual([]);
        expect(diagnose(true, BOOLEAN)).toEqual([]);
    });

    test('error for mismatched type', () => {
        let errs = diagnose(42, STRING);
        expect(errs.length).toBe(1);
        expect(errs[0].path).toBe('');
        expect(errs[0].message).toContain('string');
    });

    test('error for null on non-nullable', () => {
        let errs = diagnose(null, STRING);
        expect(errs.length).toBe(1);
        expect(errs[0].message).toContain('null');
    });

    test('error for undefined on non-optional', () => {
        let errs = diagnose(undefined, STRING);
        expect(errs.length).toBe(1);
        expect(errs[0].message).toContain('undefined');
    });

    test('no error for null on nullable', () => {
        expect(diagnose(null, STRING | NULL)).toEqual([]);
    });

    test('no error for undefined on optional', () => {
        expect(diagnose(undefined, STRING | UNDEFINED)).toEqual([]);
    });
});

describe('diagnose: type unions', () => {
    test('no error when value matches any type in union', () => {
        expect(diagnose('hello', STRING | NUMBER)).toEqual([]);
        expect(diagnose(42, STRING | NUMBER)).toEqual([]);
    });

    test('error mentions expected types', () => {
        let errs = diagnose(true, STRING | NUMBER);
        expect(errs.length).toBe(1);
        expect(errs[0].message).toContain('string');
    });

    test('error for wrong type in triple union', () => {
        let errs = diagnose([], STRING | NUMBER | BOOLEAN);
        expect(errs.length).toBe(1);
    });
});

// ========== Objects ==========

describe('diagnose: objects', () => {
    test('no errors for valid object', () => {
        let schema = object({ name: STRING, age: NUMBER });
        expect(diagnose({ name: 'Alice', age: 30 }, schema)).toEqual([]);
    });

    test('error with field path for wrong type', () => {
        let schema = object({ name: STRING, age: NUMBER });
        let errs = diagnose({ name: 'Alice', age: '30' }, schema);
        expect(errs.length).toBe(1);
        expect(errs[0].path).toBe('age');
    });

    test('multiple field errors', () => {
        let schema = object({ a: STRING, b: NUMBER, c: BOOLEAN });
        let errs = diagnose({ a: 42, b: 'wrong', c: 'wrong' }, schema);
        expect(errs.length).toBe(3);
        expect(errs.map(e => e.path).sort()).toEqual(['a', 'b', 'c']);
    });

    test('error for null field without NULL', () => {
        let schema = object({ name: STRING });
        let errs = diagnose({ name: null }, schema);
        expect(errs.length).toBe(1);
        expect(errs[0].path).toBe('name');
    });

    test('error for missing field without UNDEFINED', () => {
        let schema = object({ name: STRING, age: NUMBER });
        let errs = diagnose({ name: 'Alice' }, schema);
        expect(errs.length).toBe(1);
        expect(errs[0].path).toBe('age');
    });

    test('no error for null field with NULL', () => {
        let schema = object({ name: STRING | NULL });
        expect(diagnose({ name: null }, schema)).toEqual([]);
    });

    test('no error for missing field with UNDEFINED', () => {
        let schema = object({ name: STRING | UNDEFINED });
        expect(diagnose({}, schema)).toEqual([]);
    });

    test('error for non-object', () => {
        let schema = object({ a: STRING });
        let errs = diagnose('string', schema);
        expect(errs.length).toBe(1);
        expect(errs[0].message).toContain('object');
    });

    test('error for array instead of object', () => {
        let schema = object({ a: STRING });
        let errs = diagnose([], schema);
        expect(errs.length).toBe(1);
        expect(errs[0].message).toContain('object');
    });

    test('nested object errors have dot paths', () => {
        let inner = object({ city: STRING });
        let addr = object({ name: STRING, address: inner });
        let schema = object({ user: addr });
        let errs = diagnose({ user: { name: 'Alice', address: { city: 42 } } }, schema);
        expect(errs.length).toBe(1);
        expect(errs[0].path).toBe('user.address.city');
    });

    test('deeply nested missing field', () => {
        let c = object({ c: NUMBER });
        let b = object({ b: c });
        let schema = object({ a: b });
        let errs = diagnose({ a: { b: {} } }, schema);
        expect(errs.length).toBe(1);
        expect(errs[0].path).toBe('a.b.c');
    });
});

// ========== Arrays ==========

describe('diagnose: arrays', () => {
    test('no errors for valid array', () => {
        expect(diagnose([1, 2, 3], array(NUMBER))).toEqual([]);
    });

    test('error for non-array', () => {
        let errs = diagnose('not-array', array(NUMBER));
        expect(errs.length).toBe(1);
        expect(errs[0].message).toContain('array');
    });

    test('error for null array without NULL', () => {
        let errs = diagnose(null, array(NUMBER));
        expect(errs.length).toBe(1);
        expect(errs[0].message).toContain('null');
    });

    test('element error has bracket path', () => {
        let errs = diagnose([1, 'two', 3], array(NUMBER));
        expect(errs.length).toBe(1);
        expect(errs[0].path).toBe('[1]');
    });

    test('multiple element errors', () => {
        let errs = diagnose([1, 'two', true], array(NUMBER));
        expect(errs.length).toBe(2);
        expect(errs[0].path).toBe('[1]');
        expect(errs[1].path).toBe('[2]');
    });

    test('null element error when element not nullable', () => {
        let errs = diagnose([1, null, 3], array(NUMBER));
        expect(errs.length).toBe(1);
        expect(errs[0].path).toBe('[1]');
    });

    test('no error for null element when nullable', () => {
        expect(diagnose([1, null, 3], array(NUMBER | NULL))).toEqual([]);
    });

    test('nested array errors have nested paths', () => {
        let errs = diagnose([[1, 2], [3, 'four']], array(array(NUMBER)));
        expect(errs.length).toBe(1);
        expect(errs[0].path).toBe('[1][1]');
    });

    test('array of objects errors have combined paths', () => {
        let Item = object({ name: STRING, val: NUMBER });
        let errs = diagnose([
            { name: 'ok', val: 1 },
            { name: 'bad', val: 'wrong' }
        ], array(Item));
        expect(errs.length).toBe(1);
        expect(errs[0].path).toBe('[1].val');
    });
});

// ========== Unions ==========

describe('diagnose: discriminated unions', () => {
    let ShapeUnion = union('type', {
        circle: object({ type: STRING, radius: NUMBER }),
        rect: object({ type: STRING, w: NUMBER, h: NUMBER })
    });

    test('no errors for valid variant', () => {
        expect(diagnose({ type: 'circle', radius: 5 }, ShapeUnion)).toEqual([]);
    });

    test('error for missing discriminator', () => {
        let errs = diagnose({ radius: 5 }, ShapeUnion);
        expect(errs.length).toBe(1);
        expect(errs[0].message).toContain('discriminator');
    });

    test('error for unknown discriminator value', () => {
        let errs = diagnose({ type: 'triangle' }, ShapeUnion);
        expect(errs.length).toBe(1);
        expect(errs[0].message).toContain('triangle');
    });

    test('error for non-object union input', () => {
        let errs = diagnose('circle', ShapeUnion);
        expect(errs.length).toBe(1);
        expect(errs[0].message).toContain('object');
    });

    test('error for wrong field type inside matched variant', () => {
        let errs = diagnose({ type: 'circle', radius: 'five' }, ShapeUnion);
        expect(errs.length).toBe(1);
        expect(errs[0].path).toBe('radius');
    });

    test('null union error when not nullable', () => {
        let errs = diagnose(null, ShapeUnion);
        expect(errs.length).toBe(1);
        expect(errs[0].message).toContain('null');
    });

    test('array of unions explains each bad element', () => {
        let errs = diagnose([
            { type: 'circle', radius: 5 },
            { type: 'circle', radius: 'wrong' },
            { type: 'unknown' }
        ], array(ShapeUnion));
        expect(errs.length).toBe(2);
        expect(errs[0].path).toBe('[1].radius');
        expect(errs[1].path).toContain('[2]');
    });
});

// ========== Complex nested ==========

describe('diagnose: complex nested scenarios', () => {
    test('deeply nested object in array in object', () => {
        let Schema = object({
            users: array(object({
                name: STRING,
                tags: array(STRING)
            }))
        });
        let errs = diagnose({
            users: [
                { name: 'Alice', tags: ['a', 'b'] },
                { name: 'Bob', tags: ['c', 42] }
            ]
        }, Schema);
        expect(errs.length).toBe(1);
        expect(errs[0].path).toBe('users[1].tags[1]');
    });

    test('nullable array of nullable union objects', () => {
        let MsgUnion = union('kind', {
            text: object({ kind: STRING, body: STRING }),
            img: object({ kind: STRING, src: STRING })
        });
        let Schema = object({
            messages: array(MsgUnion | NULL) | NULL
        });
        expect(diagnose({ messages: null }, Schema)).toEqual([]);
        expect(diagnose({ messages: [null, { kind: 'text', body: 'hi' }] }, Schema)).toEqual([]);
        let errs = diagnose({ messages: [{ kind: 'text', body: 42 }] }, Schema);
        expect(errs.length).toBe(1);
        expect(errs[0].path).toBe('messages[0].body');
    });

    test('error count accumulates across multiple fields and elements', () => {
        let Schema = object({
            a: STRING,
            b: NUMBER,
            c: array(BOOLEAN)
        });
        let errs = diagnose({ a: 42, b: 'wrong', c: [true, 'x', 'y'] }, Schema);
        expect(errs.length).toBe(4);
    });
});

// ========== Validators ==========

describe('diagnose: string validators', () => {
    test('minLength error', () => {
        let s = string({ minLength: 3 });
        let errs = diagnose('ab', s);
        expect(errs.length).toBe(1);
        expect(errs[0].message).toContain('min');
    });

    test('maxLength error', () => {
        let s = string({ maxLength: 5 });
        let errs = diagnose('toolong', s);
        expect(errs.length).toBe(1);
        expect(errs[0].message).toContain('max');
    });

    test('pattern error', () => {
        let s = string({ pattern: '^[a-z]+$' });
        let errs = diagnose('ABC', s);
        expect(errs.length).toBe(1);
        expect(errs[0].message).toContain('pattern');
    });

    test('no error for valid string', () => {
        let s = string({ minLength: 1, maxLength: 10 });
        expect(diagnose('hello', s)).toEqual([]);
    });
});

describe('diagnose: number validators', () => {
    test('minimum error', () => {
        let n = number({ minimum: 10 });
        let errs = diagnose(5, n);
        expect(errs.length).toBe(1);
        expect(errs[0].message).toContain('min');
    });

    test('maximum error', () => {
        let n = number({ maximum: 100 });
        let errs = diagnose(200, n);
        expect(errs.length).toBe(1);
        expect(errs[0].message).toContain('max');
    });

    test('multipleOf error', () => {
        let n = number({ multipleOf: 5 });
        let errs = diagnose(7, n);
        expect(errs.length).toBe(1);
        expect(errs[0].message).toContain('multiple');
    });

    test('no error for valid number', () => {
        let n = number({ minimum: 0, maximum: 100 });
        expect(diagnose(50, n)).toEqual([]);
    });
});

// ========== Or / Exclusive / Intersect / Not ==========

describe('diagnose: or (anyOf)', () => {
    test('no error when any matches', () => {
        let schema = or(string(), number());
        expect(diagnose('hello', schema)).toEqual([]);
        expect(diagnose(42, schema)).toEqual([]);
    });

    test('error when none match', () => {
        let schema = or(string(), number());
        let errs = diagnose(true, schema);
        expect(errs.length).toBeGreaterThan(0);
    });
});

describe('diagnose: exclusive (oneOf)', () => {
    test('no error when exactly one matches', () => {
        let schema = exclusive(string(), number());
        expect(diagnose('hello', schema)).toEqual([]);
    });

    test('error when none match', () => {
        let schema = exclusive(string(), number());
        let errs = diagnose(true, schema);
        expect(errs.length).toBe(1);
    });

    test('error when multiple match', () => {
        let schema = exclusive(STRING, STRING | NUMBER);
        let errs = diagnose('hello', schema);
        expect(errs.length).toBe(1);
        expect(errs[0].message).toContain('2');
    });
});

describe('diagnose: intersect (allOf)', () => {
    test('no error when all match', () => {
        let schema = intersect(
            object({ a: STRING }),
            object({ b: NUMBER })
        );
        expect(diagnose({ a: 'hi', b: 42 }, schema)).toEqual([]);
    });

    test('error for failing branch', () => {
        let schema = intersect(
            object({ a: STRING }),
            object({ b: NUMBER })
        );
        let errs = diagnose({ a: 'hi', b: 'wrong' }, schema);
        expect(errs.length).toBeGreaterThan(0);
    });
});

describe('diagnose: not', () => {
    test('no error when value does NOT match', () => {
        let schema = not(STRING);
        expect(diagnose(42, schema)).toEqual([]);
    });

    test('error when value matches (should not)', () => {
        let schema = not(STRING);
        let errs = diagnose('hello', schema);
        expect(errs.length).toBe(1);
        expect(errs[0].message).toContain('NOT');
    });
});

// ========== Tuple ==========

describe('diagnose: tuple', () => {
    test('no error for valid tuple', () => {
        let schema = tuple(STRING, NUMBER);
        expect(diagnose(['hello', 42], schema)).toEqual([]);
    });

    test('error for wrong element type', () => {
        let schema = tuple(STRING, NUMBER);
        let errs = diagnose(['hello', 'wrong'], schema);
        expect(errs.length).toBe(1);
        expect(errs[0].path).toBe('[1]');
    });

    test('error for non-array', () => {
        let schema = tuple(STRING, NUMBER);
        let errs = diagnose('not-array', schema);
        expect(errs.length).toBe(1);
        expect(errs[0].message).toContain('array');
    });
});

// ========== Record ==========

describe('diagnose: record', () => {
    test('no error for valid record', () => {
        let schema = record(NUMBER);
        expect(diagnose({ a: 1, b: 2 }, schema)).toEqual([]);
    });

    test('error for wrong value type', () => {
        let schema = record(NUMBER);
        let errs = diagnose({ a: 1, b: 'wrong' }, schema);
        expect(errs.length).toBe(1);
        expect(errs[0].path).toBe('b');
    });

    test('error for non-object', () => {
        let schema = record(NUMBER);
        let errs = diagnose('string', schema);
        expect(errs.length).toBe(1);
        expect(errs[0].message).toContain('object');
    });
});

// ========== Refine ==========

describe('diagnose: refine', () => {
    test('no error when refinement passes', () => {
        let schema = refine(NUMBER, (v) => v > 0);
        expect(diagnose(5, schema)).toEqual([]);
    });

    test('error for inner type failure', () => {
        let schema = refine(NUMBER, (v) => v > 0);
        let errs = diagnose('not-num', schema);
        expect(errs.length).toBe(1);
    });

    test('error when refinement callback fails', () => {
        let schema = refine(NUMBER, (v) => v > 0);
        let errs = diagnose(-1, schema);
        expect(errs.length).toBe(1);
        expect(errs[0].message).toContain('refine');
    });
});

// ========== Cross-validation: validate vs diagnose agreement ==========

describe('diagnose: validate/diagnose agreement', () => {
    /**
     * For every test case: when validate returns true, diagnose must return [].
     * When validate returns false, diagnose must return at least one error.
     */
    function checkAgreement(data, schema) {
        let valid = validate(data, schema);
        let errs = diagnose(data, schema);
        if (valid) {
            expect(errs).toEqual([]);
        } else {
            expect(errs.length).toBeGreaterThan(0);
        }
    }

    let personSchema = object({
        name: string({ minLength: 1, maxLength: 100 }),
        age: number({ minimum: 0, maximum: 200 }),
    });

    let itemSchema = object({
        id: NUMBER,
        tags: array(STRING),
    });

    let listSchema = array(itemSchema);

    test('valid object', () => checkAgreement({ name: 'Alice', age: 30 }, personSchema));
    test('empty name', () => checkAgreement({ name: '', age: 30 }, personSchema));
    test('negative age', () => checkAgreement({ name: 'Bob', age: -1 }, personSchema));
    test('missing field', () => checkAgreement({ name: 'Bob' }, personSchema));
    test('extra undefined field', () => checkAgreement({ name: 'Bob', age: undefined }, personSchema));
    test('null field', () => checkAgreement({ name: null, age: 30 }, personSchema));
    test('wrong type for field', () => checkAgreement({ name: 42, age: 30 }, personSchema));
    test('not an object', () => checkAgreement('not-object', personSchema));
    test('null', () => checkAgreement(null, personSchema));
    test('undefined', () => checkAgreement(undefined, personSchema));
    test('array instead of object', () => checkAgreement([], personSchema));

    test('valid array of objects', () => checkAgreement([{ id: 1, tags: ['a'] }], listSchema));
    test('invalid array element', () => checkAgreement([{ id: 1, tags: ['a'] }, { id: 'wrong', tags: [] }], listSchema));
    test('nested array error', () => checkAgreement([{ id: 1, tags: [42] }], listSchema));
    test('empty array', () => checkAgreement([], listSchema));

    test('primitives: string', () => checkAgreement('hello', STRING));
    test('primitives: number', () => checkAgreement(42, NUMBER));
    test('primitives: boolean', () => checkAgreement(true, BOOLEAN));
    test('primitives: wrong type', () => checkAgreement(42, STRING));
    test('primitives: null non-nullable', () => checkAgreement(null, STRING));
    test('primitives: null nullable', () => checkAgreement(null, STRING | NULL));
    test('primitives: undefined optional', () => checkAgreement(undefined, STRING | UNDEFINED));

    test('any accepts everything', () => {
        checkAgreement('hello', ANY);
        checkAgreement(42, ANY);
        checkAgreement(null, ANY);
        checkAgreement(undefined, ANY);
        checkAgreement({}, ANY);
        checkAgreement([], ANY);
    });
});

// ========== JSON Schema suite: validate/diagnose agreement ==========

describe('diagnose: JSON Schema suite agreement', () => {
    const __dirname = import.meta.dir;
    const SUITE_DIR = path.resolve(__dirname, '../../schema/tests/suite/tests');
    const SPECS_DIR = path.resolve(__dirname, '../../schema/tests/specs');
    const REMOTE_DIR = path.resolve(__dirname, '../../schema/tests/suite/remotes');

    const SUPPORTED_DRAFTS = ['draft-04', 'draft-06', 'draft-07', 'draft2019-09', 'draft2020-12'];

    function getTestFolder(draft) {
        switch (draft) {
            case 'draft2020-12': return 'draft2020-12';
            case 'draft2019-09': return 'draft2019-09';
            case 'draft-07': return 'draft7';
            case 'draft-06': return 'draft6';
            case 'draft-04': return 'draft4';
        }
        throw new Error('Not implemented');
    }

    function readDirRecursive(rootDir) {
        let files = [];
        function readDir(dirName) {
            let content = fs.readdirSync(dirName);
            for (let file of content) {
                let abspath = path.join(dirName, file);
                let stats = fs.statSync(abspath);
                if (stats.isDirectory()) {
                    readDir(abspath);
                } else if (file.endsWith('.json')) {
                    let str = fs.readFileSync(abspath, 'utf8');
                    let relativePath = path.relative(rootDir, abspath);
                    files.push({ path: relativePath, schema: JSON.parse(str) });
                }
            }
        }
        readDir(rootDir);
        return files;
    }

    let remoteFiles = readDirRecursive(REMOTE_DIR);

    for (let draft of SUPPORTED_DRAFTS) {
        let draftFolder = getTestFolder(draft);
        let suiteDir = path.join(SUITE_DIR, draftFolder);
        if (!fs.existsSync(suiteDir)) {
            continue;
        }

        let allFiles = fs.readdirSync(suiteDir).filter(f => f.endsWith('.json'));
        let specDir = path.join(SPECS_DIR, draft);
        let rootMetaSchema = JSON.parse(fs.readFileSync(path.join(specDir, 'schema.json'), 'utf8'));
        let rootMetaUri = rootMetaSchema.$id || rootMetaSchema.id || `https://json-schema.org/${draft}/schema`;

        let vocabSchemas = [];
        if (Array.isArray(rootMetaSchema.allOf)) {
            for (let branch of rootMetaSchema.allOf) {
                if (branch.$ref && branch.$ref.startsWith('meta/')) {
                    let vocabFileName = branch.$ref.replace('meta/', '') + '.json';
                    let vocabPath = path.join(specDir, 'meta', vocabFileName);
                    if (fs.existsSync(vocabPath)) {
                        let vocabSchema = JSON.parse(fs.readFileSync(vocabPath, 'utf8'));
                        let vocabUri = vocabSchema.$id || vocabSchema.id;
                        if (vocabUri) {
                            vocabSchemas.push({ schema: vocabSchema, uri: vocabUri });
                        }
                    }
                }
            }
        }

        /** Use a dedicated catalog for diagnose suite tests */
        let suiteCat = catalog();
        let suiteDiagnose = createDiagnose(suiteCat);

        describe(`Diagnose agreement: ${draft}`, () => {
            for (let file of allFiles) {
                let filePath = path.join(suiteDir, file);
                let testGroups = JSON.parse(fs.readFileSync(filePath, 'utf8'));

                for (let group of testGroups) {
                    let compiledRoot;
                    let compileError = null;

                    try {
                        let compound = new CompoundSchema(draft);
                        compound.add(structuredClone(rootMetaSchema), rootMetaUri);
                        for (let vocab of vocabSchemas) {
                            compound.add(structuredClone(vocab.schema), vocab.uri);
                        }
                        for (let remoteFile of remoteFiles) {
                            let uriPath = remoteFile.path.split(path.sep).join('/');
                            let uri = `http://localhost:1234/${uriPath}`;
                            compound.add(structuredClone(remoteFile.schema), uri);
                        }
                        let ref = compound.add(group.schema);
                        let ast = compound.bundle(ref);
                        let compiled = compile(suiteCat, ast);
                        compiledRoot = compiled[0].schema;
                    } catch (err) {
                        compileError = err;
                    }

                    describe(`${file} — ${group.description}`, () => {
                        for (let tc of group.tests) {
                            test(tc.description, () => {
                                if (compileError) {
                                    throw new Error(
                                        `Parser/Compiler failed: ${compileError.message}\n` +
                                        `Schema: ${JSON.stringify(group.schema)}`
                                    );
                                }
                                let valid = suiteCat.validate(tc.data, compiledRoot);
                                let errs = suiteDiagnose(tc.data, compiledRoot);

                                /**
                                 * Core invariant: validate and diagnose must agree.
                                 * If validate says valid, diagnose must return no errors.
                                 * If validate says invalid, diagnose must return at least one error.
                                 */
                                if (valid) {
                                    expect(errs).toEqual([]);
                                } else {
                                    expect(errs.length).toBeGreaterThan(0);
                                }
                            });
                        }
                    });
                }
            }
        });
    }
});
