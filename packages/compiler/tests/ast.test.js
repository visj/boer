// import { describe, test, expect } from 'bun:test';
// import {
//     BOOLEAN, NUMBER, STRING, BIGINT, DATE, URI, VALUE,
//     NULL, UNDEFINED
// } from 'boer';
// import { catalog } from 'boer/core';
// import { compile } from '../src/internal/ast.js';
// import {
//     N_PRIM, N_OBJECT, N_ARRAY, N_REFINE, N_OR,
//     N_EXCLUSIVE, N_INTERSECT, N_NOT, N_CONDITIONAL, N_REF,
// } from '../src/internal/schema.js';

// const SENTINEL = 0xFFFFFFFF;

// /**
//  * Helper: builds a minimal FlatAst programmatically.
//  *
//  * Uses the same unified edge slab layout as parseJsonSchema():
//  *   Object edges:  [nameIdx, childId, flags] per property
//  *   List edges:    [childId] per branch
//  *   Cond edges:    [ifId, thenId, elseId]
//  */
// function flatAstBuilder() {
//     let astKinds    = new Uint8Array(64);
//     let astFlags    = new Uint32Array(64);
//     let astChild0   = new Uint32Array(64);
//     let astChild1   = new Uint32Array(64);
//     let astVHeaders = new Uint32Array(64);
//     let astVOffset  = new Uint32Array(64);
//     let vPayloads   = [];
//     let propNames   = [];
//     let edges       = [];
//     let callbacks   = [];
//     let nextId = 0;

//     function alloc() { return nextId++; }

//     function prim(bits) {
//         let id = alloc();
//         astKinds[id] = N_PRIM;
//         astFlags[id] = bits >>> 0;
//         return id;
//     }

//     function object(props, opts) {
//         let id = alloc();
//         let keys = Object.keys(props);
//         let requiredSet = opts && opts.required ? new Set(opts.required) : null;

//         let edgeBase = edges.length;
//         for (let i = 0; i < keys.length; i++) {
//             let nameIdx = propNames.length;
//             propNames.push(keys[i]);

//             edges.push(nameIdx);          // slot 0: name index
//             edges.push(props[keys[i]]);   // slot 1: child node id
//             edges.push(requiredSet ? (requiredSet.has(keys[i]) ? 0 : 1) : 0); // slot 2: flags
//         }

//         astKinds[id]  = N_OBJECT;
//         astChild0[id] = edgeBase;
//         astChild1[id] = keys.length;
//         return id;
//     }

//     function array(elemId) {
//         let id = alloc();
//         astKinds[id]  = N_ARRAY;
//         astChild0[id] = elemId;
//         return id;
//     }

//     function refine(innerId, fn) {
//         let id = alloc();
//         let cbIdx = callbacks.length;
//         callbacks.push(fn);
//         astKinds[id]  = N_REFINE;
//         astChild0[id] = innerId;
//         astChild1[id] = cbIdx;
//         return id;
//     }

//     function or(childIds) {
//         let id = alloc();
//         let edgeBase = edges.length;
//         for (let i = 0; i < childIds.length; i++) {
//             edges.push(childIds[i]);
//         }
//         astKinds[id]  = N_OR;
//         astChild0[id] = edgeBase;
//         astChild1[id] = childIds.length;
//         return id;
//     }

//     function exclusive(childIds) {
//         let id = alloc();
//         let edgeBase = edges.length;
//         for (let i = 0; i < childIds.length; i++) {
//             edges.push(childIds[i]);
//         }
//         astKinds[id]  = N_EXCLUSIVE;
//         astChild0[id] = edgeBase;
//         astChild1[id] = childIds.length;
//         return id;
//     }

//     function intersect(childIds) {
//         let id = alloc();
//         let edgeBase = edges.length;
//         for (let i = 0; i < childIds.length; i++) {
//             edges.push(childIds[i]);
//         }
//         astKinds[id]  = N_INTERSECT;
//         astChild0[id] = edgeBase;
//         astChild1[id] = childIds.length;
//         return id;
//     }

//     function not(innerId) {
//         let id = alloc();
//         astKinds[id]  = N_NOT;
//         astChild0[id] = innerId;
//         return id;
//     }

//     function conditional(ifId, thenId, elseId) {
//         let id = alloc();
//         let edgeBase = edges.length;
//         edges.push(ifId);
//         edges.push(thenId !== undefined ? thenId : SENTINEL);
//         edges.push(elseId !== undefined ? elseId : SENTINEL);
//         astKinds[id]  = N_CONDITIONAL;
//         astChild0[id] = edgeBase;
//         return id;
//     }

//     function ref(targetId) {
//         let id = alloc();
//         astKinds[id]  = N_REF;
//         astChild0[id] = targetId;
//         return id;
//     }

//     function build(rootId, defIds = [], defNames = []) {
//         let nc = nextId;
//         return {
//             astKinds:    astKinds.subarray(0, nc),
//             astFlags:    astFlags.subarray(0, nc),
//             astChild0:   astChild0.subarray(0, nc),
//             astChild1:   astChild1.subarray(0, nc),
//             astVHeaders: astVHeaders.subarray(0, nc),
//             astVOffset:  astVOffset.subarray(0, nc),
//             astEdges:    new Uint32Array(edges),
//             vPayloads,
//             propNames,
//             callbacks,
//             rootIds:   [rootId],
//             rootNames: [null],
//             rootUris:  [null],
//             defIds,
//             defNames,
//             nodeCount: nc,
//         };
//     }

//     return {
//         alloc, prim, object, array, refine, or, exclusive,
//         intersect, not, conditional, ref, build,
//     };
// }

// describe('ast: compile primitives', () => {
//     test('raw number passthrough', () => {
//         let cat = catalog();
//         let b = flatAstBuilder();
//         let root = b.prim(STRING);
//         let result = compile(cat, b.build(root));
//         expect(Object.values(result.roots)[0].schema).toBe(STRING);
//         expect(cat.validate('hello', Object.values(result.roots)[0].schema)).toBe(true);
//         expect(cat.validate(42, Object.values(result.roots)[0].schema)).toBe(false);
//     });

//     test('nullable primitive', () => {
//         let cat = catalog();
//         let b = flatAstBuilder();
//         let root = b.prim((STRING | NULL) >>> 0);
//         let result = compile(cat, b.build(root));
//         expect(cat.validate(null, Object.values(result.roots)[0].schema)).toBe(true);
//         expect(cat.validate('hello', Object.values(result.roots)[0].schema)).toBe(true);
//         expect(cat.validate(42, Object.values(result.roots)[0].schema)).toBe(false);
//     });
// });

// describe('ast: compile objects', () => {
//     test('simple object', () => {
//         let cat = catalog();
//         let b = flatAstBuilder();
//         let nameNode = b.prim(STRING);
//         let ageNode = b.prim(NUMBER);
//         let root = b.object({ name: nameNode, age: ageNode });
//         let result = compile(cat, b.build(root));
//         expect(typeof Object.values(result.roots)[0].schema).toBe('number');
//         expect(cat.validate({ name: 'Alice', age: 30 }, Object.values(result.roots)[0].schema)).toBe(true);
//         expect(cat.validate({ name: 'Alice' }, Object.values(result.roots)[0].schema)).toBe(false);
//         expect(cat.validate({ name: 'Alice', age: 'thirty' }, Object.values(result.roots)[0].schema)).toBe(false);
//     });

//     test('nested objects', () => {
//         let cat = catalog();
//         let b = flatAstBuilder();
//         let street = b.prim(STRING);
//         let city = b.prim(STRING);
//         let address = b.object({ street, city });
//         let name = b.prim(STRING);
//         let root = b.object({ name, address });
//         let result = compile(cat, b.build(root));
//         expect(cat.validate({ name: 'Bob', address: { street: '123 Main', city: 'NY' } }, Object.values(result.roots)[0].schema)).toBe(true);
//         expect(cat.validate({ name: 'Bob', address: { street: '123 Main' } }, Object.values(result.roots)[0].schema)).toBe(false);
//     });
// });

// describe('ast: compile arrays', () => {
//     test('simple array', () => {
//         let cat = catalog();
//         let b = flatAstBuilder();
//         let elem = b.prim(STRING);
//         let root = b.array(elem);
//         let result = compile(cat, b.build(root));
//         expect(cat.validate(['hello', 'world'], Object.values(result.roots)[0].schema)).toBe(true);
//         expect(cat.validate([1, 2, 3], Object.values(result.roots)[0].schema)).toBe(false);
//         expect(cat.validate('not array', Object.values(result.roots)[0].schema)).toBe(false);
//     });

//     test('array of objects', () => {
//         let cat = catalog();
//         let b = flatAstBuilder();
//         let idNode = b.prim(NUMBER);
//         let nameNode = b.prim(STRING);
//         let objNode = b.object({ id: idNode, name: nameNode });
//         let root = b.array(objNode);
//         let result = compile(cat, b.build(root));
//         expect(cat.validate([{ id: 1, name: 'Alice' }], Object.values(result.roots)[0].schema)).toBe(true);
//         expect(cat.validate([{ id: 'one', name: 'Alice' }], Object.values(result.roots)[0].schema)).toBe(false);
//     });
// });

// describe('ast: compile or (anyOf)', () => {
//     test('primitive or — fast path', () => {
//         let cat = catalog();
//         let b = flatAstBuilder();
//         let s = b.prim(STRING);
//         let n = b.prim(NUMBER);
//         let root = b.or([s, n]);
//         let result = compile(cat, b.build(root));
//         expect(cat.validate('hello', Object.values(result.roots)[0].schema)).toBe(true);
//         expect(cat.validate(42, Object.values(result.roots)[0].schema)).toBe(true);
//         expect(cat.validate(true, Object.values(result.roots)[0].schema)).toBe(false);
//     });

//     test('complex or', () => {
//         let cat = catalog();
//         let b = flatAstBuilder();
//         let nameNode = b.prim(STRING);
//         let objNode = b.object({ name: nameNode });
//         let elemNode = b.prim(NUMBER);
//         let arrNode = b.array(elemNode);
//         let root = b.or([objNode, arrNode]);
//         let result = compile(cat, b.build(root));
//         expect(cat.validate({ name: 'Alice' }, Object.values(result.roots)[0].schema)).toBe(true);
//         expect(cat.validate([1, 2, 3], Object.values(result.roots)[0].schema)).toBe(true);
//         expect(cat.validate('string', Object.values(result.roots)[0].schema)).toBe(false);
//     });
// });

// describe('ast: compile exclusive (oneOf)', () => {
//     test('exclusive types', () => {
//         let cat = catalog();
//         let b = flatAstBuilder();
//         let s = b.prim(STRING);
//         let n = b.prim(NUMBER);
//         let root = b.exclusive([s, n]);
//         let result = compile(cat, b.build(root));
//         expect(cat.validate('hello', Object.values(result.roots)[0].schema)).toBe(true);
//         expect(cat.validate(42, Object.values(result.roots)[0].schema)).toBe(true);
//         expect(cat.validate(true, Object.values(result.roots)[0].schema)).toBe(false);
//     });
// });

// describe('ast: compile intersect (allOf)', () => {
//     test('intersect objects', () => {
//         let cat = catalog();
//         let b = flatAstBuilder();
//         let nameNode = b.prim(STRING);
//         let obj1 = b.object({ name: nameNode });
//         let ageNode = b.prim(NUMBER);
//         let obj2 = b.object({ age: ageNode });
//         let root = b.intersect([obj1, obj2]);
//         let result = compile(cat, b.build(root));
//         expect(cat.validate({ name: 'Alice', age: 30 }, Object.values(result.roots)[0].schema)).toBe(true);
//         expect(cat.validate({ name: 'Alice' }, Object.values(result.roots)[0].schema)).toBe(false);
//     });
// });

// describe('ast: compile not', () => {
//     test('not string', () => {
//         let cat = catalog();
//         let b = flatAstBuilder();
//         let s = b.prim(STRING);
//         let root = b.not(s);
//         let result = compile(cat, b.build(root));
//         expect(cat.validate(42, Object.values(result.roots)[0].schema)).toBe(true);
//         expect(cat.validate('hello', Object.values(result.roots)[0].schema)).toBe(false);
//     });
// });

// describe('ast: compile conditional (if/then/else)', () => {
//     test('if/then/else', () => {
//         let cat = catalog();
//         let b = flatAstBuilder();
//         let ifNode = b.prim(STRING);
//         let thenNode = b.prim(STRING);
//         let elseNode = b.prim(NUMBER);
//         let root = b.conditional(ifNode, thenNode, elseNode);
//         let result = compile(cat, b.build(root));
//         expect(cat.validate('hello', Object.values(result.roots)[0].schema)).toBe(true);
//         expect(cat.validate(42, Object.values(result.roots)[0].schema)).toBe(true);
//         expect(cat.validate(true, Object.values(result.roots)[0].schema)).toBe(false);
//     });
// });

// describe('ast: compile refine', () => {
//     test('refine with callback via validate()', () => {
//         let cat = catalog();
//         let b = flatAstBuilder();
//         let inner = b.prim(NUMBER);
//         let root = b.refine(inner, (val) => val > 0);
//         let result = compile(cat, b.build(root));
//         expect(cat.validate(5, Object.values(result.roots)[0].schema)).toBe(true);
//         expect(cat.validate(-1, Object.values(result.roots)[0].schema)).toBe(false);
//         expect(cat.validate('hello', Object.values(result.roots)[0].schema)).toBe(false);
//     });
// });

// describe('ast: compile refs (defs)', () => {
//     test('simple def reference', () => {
//         let cat = catalog();
//         let b = flatAstBuilder();
//         let streetNode = b.prim(STRING);
//         let cityNode = b.prim(STRING);
//         let addressNode = b.object({ street: streetNode, city: cityNode });
//         let nameNode = b.prim(STRING);
//         let addrRef = b.ref(addressNode);
//         let root = b.object({ name: nameNode, address: addrRef });
//         let result = compile(cat, b.build(root, [addressNode], ['Address']));
//         expect(typeof Object.values(result.roots)[0].schema).toBe('number');
//         expect(typeof result.defs['Address']).toBe('number');
//         expect(cat.validate({ name: 'Alice', address: { street: '123 Main', city: 'NY' } }, Object.values(result.roots)[0].schema)).toBe(true);
//         expect(cat.validate({ name: 'Alice', address: { street: '123 Main' } }, Object.values(result.roots)[0].schema)).toBe(false);
//     });

//     test('def reused multiple times', () => {
//         let cat = catalog();
//         let b = flatAstBuilder();
//         let elemNode = b.prim(STRING);
//         let arrNode = b.array(elemNode);
//         let tagsRef = b.ref(arrNode);
//         let labelsRef = b.ref(arrNode);
//         let root = b.object({ tags: tagsRef, labels: labelsRef });
//         let result = compile(cat, b.build(root, [arrNode], ['StringArray']));
//         expect(cat.validate({ tags: ['a', 'b'], labels: ['c'] }, Object.values(result.roots)[0].schema)).toBe(true);
//         expect(cat.validate({ tags: ['a', 'b'], labels: [1] }, Object.values(result.roots)[0].schema)).toBe(false);
//     });

//     test('multiple defs', () => {
//         let cat = catalog();
//         let b = flatAstBuilder();
//         let userName = b.prim(STRING);
//         let userNode = b.object({ name: userName });
//         let commentText = b.prim(STRING);
//         let authorRef = b.ref(userNode);
//         let commentNode = b.object({ text: commentText, author: authorRef });
//         let userRef = b.ref(userNode);
//         let commentRef = b.ref(commentNode);
//         let root = b.object({ user: userRef, comment: commentRef });
//         let result = compile(cat, b.build(root, [userNode, commentNode], ['User', 'Comment']));
//         expect(typeof result.defs['User']).toBe('number');
//         expect(typeof result.defs['Comment']).toBe('number');
//         let data = {
//             user: { name: 'Alice' },
//             comment: { text: 'Great!', author: { name: 'Bob' } },
//         };
//         expect(cat.validate(data, Object.values(result.roots)[0].schema)).toBe(true);
//         expect(cat.validate({ user: { name: 'Alice' }, comment: { text: 'Great!', author: { name: 42 } } }, Object.values(result.roots)[0].schema)).toBe(false);
//     });

//     test('primitive def gets promoted to K_PRIMITIVE', () => {
//         let cat = catalog();
//         let b = flatAstBuilder();
//         let strNode = b.prim(STRING);
//         let root = b.ref(strNode);
//         let result = compile(cat, b.build(root, [strNode], ['MyString']));
//         expect(cat.validate('hello', Object.values(result.roots)[0].schema)).toBe(true);
//         expect(cat.validate(42, Object.values(result.roots)[0].schema)).toBe(false);
//     });

//     test('CompiledSchema defs can be used directly with validate()', () => {
//         let cat = catalog();
//         let b = flatAstBuilder();
//         let nameNode = b.prim(STRING);
//         let ageNode = b.prim(NUMBER);
//         let userNode = b.object({ name: nameNode, age: ageNode });
//         let root = b.prim(NUMBER);
//         let result = compile(cat, b.build(root, [userNode], ['User']));
//         expect(cat.validate({ name: 'Alice', age: 30 }, result.defs['User'])).toBe(true);
//         expect(cat.validate({ name: 'Alice' }, result.defs['User'])).toBe(false);
//     });
// });

// describe('ast: string validators', () => {
//     test('nested objects compile correctly', () => {
//         let cat = catalog();
//         let b = flatAstBuilder();
//         let valueNode = b.prim(STRING);
//         let innerObj = b.object({ value: valueNode });
//         let root = b.object({ name: innerObj });
//         let result = compile(cat, b.build(root));
//         expect(cat.validate({ name: { value: 'test' } }, Object.values(result.roots)[0].schema)).toBe(true);
//     });
// });
