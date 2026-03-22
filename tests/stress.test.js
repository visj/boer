import { describe, test, expect } from 'bun:test';
import {
    BOOLEAN, NUMBER, STRING, DATE,
    STRICT_DELETE
} from 'uvd';
import { catalog, allocators } from 'uvd/core';

const cat = catalog();
const { object, array, union } = allocators(cat);
const { validate, conform } = cat;

describe('stress: SLAB growth beyond initial 4096', () => {
    test('register 300 objects with 8 fields each (4800 slab entries)', () => {
        let schemas = [];
        for (let i = 0; i < 300; i++) {
            let def = {};
            for (let j = 0; j < 8; j++) {
                def['slab_field_' + i + '_' + j] = NUMBER;
            }
            schemas.push(object(def));
        }

        // Validate the first, middle, and last schema
        let first = schemas[0];
        let mid = schemas[150];
        let last = schemas[299];

        let makeObj = (i) => {
            let obj = {};
            for (let j = 0; j < 8; j++) {
                obj['slab_field_' + i + '_' + j] = j * 10;
            }
            return obj;
        };

        expect(validate(makeObj(0), first)).toBe(true);
        expect(validate(makeObj(150), mid)).toBe(true);
        expect(validate(makeObj(299), last)).toBe(true);

        // Wrong type should still fail
        let bad = makeObj(0);
        bad['slab_field_0_3'] = 'not-a-number';
        expect(validate(bad, first)).toBe(false);
    });

    test('single object with 100 fields', () => {
        let def = {};
        let obj = {};
        for (let i = 0; i < 100; i++) {
            def['big_field_' + i] = (i % 2 === 0) ? NUMBER : STRING;
            obj['big_field_' + i] = (i % 2 === 0) ? i : 'val_' + i;
        }
        let schema = object(def);
        expect(validate(obj, schema)).toBe(true);

        // Flip one type
        obj['big_field_50'] = 'should-be-number';
        expect(validate(obj, schema)).toBe(false);
    });
});

describe('stress: OBJECTS registry growth beyond 256', () => {
    test('register 500 objects and validate all of them', () => {
        let schemas = [];
        for (let i = 0; i < 500; i++) {
            schemas.push(object({ ['obj_reg_' + i]: NUMBER }));
        }

        // Validate first, middle, last
        expect(validate({ obj_reg_0: 42 }, schemas[0])).toBe(true);
        expect(validate({ obj_reg_250: 42 }, schemas[250])).toBe(true);
        expect(validate({ obj_reg_499: 42 }, schemas[499])).toBe(true);

        // Wrong type
        expect(validate({ obj_reg_499: 'wrong' }, schemas[499])).toBe(false);
    });
});

describe('stress: ARRAYS registry growth beyond 128', () => {
    test('register 200 array types and validate', () => {
        let arrTypes = [];
        for (let i = 0; i < 200; i++) {
            let elemType = (i % 3 === 0) ? NUMBER : (i % 3 === 1) ? STRING : BOOLEAN;
            arrTypes.push(array(elemType));
        }

        expect(validate([1, 2, 3], arrTypes[0])).toBe(true);
        expect(validate(['a', 'b'], arrTypes[1])).toBe(true);
        expect(validate([true, false], arrTypes[2])).toBe(true);

        expect(validate([1, 2], arrTypes[198])).toBe(true);    // 198 % 3 === 0 -> NUMBER
        expect(validate(['x'], arrTypes[199])).toBe(true);      // 199 % 3 === 1 -> STRING

        expect(validate(['wrong'], arrTypes[0])).toBe(false);
        expect(validate([42], arrTypes[1])).toBe(false);
    });
});


describe('stress: key dictionary growth past 255 (U8 → U16 discriminator upgrade)', () => {
    test('register objects with >255 unique key names, then use discriminated unions', () => {
        let bigDef = {};
        for (let i = 0; i < 270; i++) {
            bigDef['dictkey_' + i] = NUMBER;
        }
        let bigSchema = object(bigDef);

        let D = union('disc_type', {
            alpha: object({ disc_type: STRING, alpha_val: NUMBER }),
            beta: object({ disc_type: STRING, beta_val: STRING })
        });

        expect(validate({ disc_type: 'alpha', alpha_val: 42 }, D)).toBe(true);
        expect(validate({ disc_type: 'beta', beta_val: 'hello' }, D)).toBe(true);
        expect(validate({ disc_type: 'gamma' }, D)).toBe(false);

        let bigObj = {};
        for (let i = 0; i < 270; i++) {
            bigObj['dictkey_' + i] = i;
        }
        expect(validate(bigObj, bigSchema)).toBe(true);
    });
});

describe('stress: discriminated union registry growth beyond 64', () => {
    test('register 100 discriminated unions and validate', () => {
        let discs = [];
        for (let i = 0; i < 100; i++) {
            let typeA = object({ du_kind: STRING, du_val_a_: NUMBER });
            let typeB = object({ du_kind: STRING, du_val_b_: STRING });
            discs.push(union(
                'du_kind',
                { ['opt_a_' + i]: typeA, ['opt_b_' + i]: typeB }
            ));
        }

        expect(validate({ du_kind: 'opt_a_0', du_val_a_: 42 }, discs[0])).toBe(true);
        expect(validate({ du_kind: 'opt_b_0', du_val_b_: 'hi' }, discs[0])).toBe(true);

        expect(validate({ du_kind: 'opt_a_99', du_val_a_: 99 }, discs[99])).toBe(true);
        expect(validate({ du_kind: 'opt_b_99', du_val_b_: 'end' }, discs[99])).toBe(true);

        expect(validate({ du_kind: 'opt_a_0' }, discs[99])).toBe(false);
        expect(validate({ du_kind: 'unknown' }, discs[50])).toBe(false);
    });
});

describe('stress: deeply nested inline objects', () => {
    test('10 levels of inline nesting', () => {
        // Build from inside out: { l9: { l8: { ... { l0: NUMBER } } } }
        let def = { l0: NUMBER };
        for (let i = 1; i <= 9; i++) {
            def = { ['l' + i]: def };
        }
        let schema = object(def);

        let obj = { l9: { l8: { l7: { l6: { l5: { l4: { l3: { l2: { l1: { l0: 42 } } } } } } } } } };
        expect(validate(obj, schema)).toBe(true);

        let bad = { l9: { l8: { l7: { l6: { l5: { l4: { l3: { l2: { l1: { l0: 'wrong' } } } } } } } } } };
        expect(validate(bad, schema)).toBe(false);

        let nullMid = { l9: { l8: { l7: null } } };
        expect(validate(nullMid, schema)).toBe(false);
    });

    test('wide + deep: 5 levels, 5 fields each', () => {
        let leaf = {};
        for (let i = 0; i < 5; i++) leaf['wd_leaf_' + i] = NUMBER;

        let level3 = {};
        for (let i = 0; i < 5; i++) level3['wd_l3_' + i] = leaf;

        let level2 = {};
        for (let i = 0; i < 5; i++) level2['wd_l2_' + i] = level3;

        let level1 = {};
        for (let i = 0; i < 5; i++) level1['wd_l1_' + i] = level2;

        let root = {};
        for (let i = 0; i < 5; i++) root['wd_root_' + i] = level1;

        // This registers 5^4 = 625 leaf objects + intermediates
        let schema = object(root);

        // Build a matching data object
        function buildData() {
            let obj = {};
            for (let r = 0; r < 5; r++) {
                obj['wd_root_' + r] = {};
                for (let a = 0; a < 5; a++) {
                    obj['wd_root_' + r]['wd_l1_' + a] = {};
                    for (let b = 0; b < 5; b++) {
                        obj['wd_root_' + r]['wd_l1_' + a]['wd_l2_' + b] = {};
                        for (let c = 0; c < 5; c++) {
                            obj['wd_root_' + r]['wd_l1_' + a]['wd_l2_' + b]['wd_l3_' + c] = {};
                            for (let d = 0; d < 5; d++) {
                                obj['wd_root_' + r]['wd_l1_' + a]['wd_l2_' + b]['wd_l3_' + c]['wd_leaf_' + d] = 99;
                            }
                        }
                    }
                }
            }
            return obj;
        }

        let data = buildData();
        expect(validate(data, schema)).toBe(true);

        // Corrupt one deep field
        data['wd_root_3']['wd_l1_2']['wd_l2_1']['wd_l3_4']['wd_leaf_0'] = 'wrong';
        expect(validate(data, schema)).toBe(false);
    });
});

describe('stress: combined registries at scale', () => {
    test('mixed schema soup: 200 objects, 100 arrays, 50 discriminated unions', () => {
        let objectSchemas = [];
        for (let i = 0; i < 200; i++) {
            objectSchemas.push(object({
                ['mixed_obj_a_' + i]: NUMBER,
                ['mixed_obj_b_' + i]: STRING
            }));
        }

        let arraySchemas = [];
        for (let i = 0; i < 100; i++) {
            arraySchemas.push(array(objectSchemas[i * 2]));
        }

        let discSchemas = [];
        for (let i = 0; i < 50; i++) {
            discSchemas.push(union('mixed_obj_a_' + i, {
                ['mix_x_' + i]: objectSchemas[i],
                ['mix_y_' + i]: objectSchemas[i + 100]
            }));
        }

        // Validate a late object
        let idx = 199;
        expect(validate({ ['mixed_obj_a_' + idx]: 42, ['mixed_obj_b_' + idx]: 'hi' }, objectSchemas[idx])).toBe(true);
        expect(validate({ ['mixed_obj_a_' + idx]: 42, ['mixed_obj_b_' + idx]: 42 }, objectSchemas[idx])).toBe(false);

        // Validate a late array
        let arrIdx = 99;
        let objIdx = arrIdx * 2; // 198
        expect(validate([
            { ['mixed_obj_a_' + objIdx]: 1, ['mixed_obj_b_' + objIdx]: 'x' }
        ], arraySchemas[arrIdx])).toBe(true);
    });
});

describe('stress: parse and strict on large objects', () => {
    test('parse 50-field object with Dates', () => {
        let def = {};
        let obj = {};
        for (let i = 0; i < 50; i++) {
            if (i % 3 === 0) {
                def['pf_' + i] = DATE;
                obj['pf_' + i] = '2024-01-' + String(i % 28 + 1).padStart(2, '0');
            } else if (i % 3 === 1) {
                def['pf_' + i] = NUMBER;
                obj['pf_' + i] = i;
            } else {
                def['pf_' + i] = STRING;
                obj['pf_' + i] = 'val_' + i;
            }
        }
        let schema = object(def);
        expect(conform(obj, schema)).toBe(true);
        expect(obj['pf_0']).toBeInstanceOf(Date);
        expect(obj['pf_3']).toBeInstanceOf(Date);
        expect(typeof obj['pf_1']).toBe('number');
        expect(typeof obj['pf_2']).toBe('string');
    });

    test('strict strip on 30-field object with 20 extras', () => {
        let def = {};
        let obj = {};
        for (let i = 0; i < 30; i++) {
            def['keep_' + i] = NUMBER;
            obj['keep_' + i] = i;
        }
        for (let i = 0; i < 20; i++) {
            obj['remove_' + i] = 'junk';
        }
        let schema = object(def);
        expect(Object.keys(obj).length).toBe(50);
        expect(validate(obj, schema, STRICT_DELETE)).toBe(true);
        expect(Object.keys(obj).length).toBe(30);
        for (let i = 0; i < 30; i++) {
            expect(obj['keep_' + i]).toBe(i);
        }
        for (let i = 0; i < 20; i++) {
            expect('remove_' + i in obj).toBe(false);
        }
    });
});