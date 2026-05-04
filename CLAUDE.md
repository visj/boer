# Instructions for Claude
## Code guidelines
Always run `bun make` before you run `bun test`. All tests target the bundled output, not the source files directly, to ensure that the final bundle ready to be shipped works correctly.
### Branches 
Always expand branches fully, like this:
```ts
if (myStatement) {
    return true; // GOOD
}
```
Do *not* write code like this:
```ts
if (myStatement) return false; // BAD
if (myStatement) { return false; } // BAD
```
### Allocation
Never use anything other than `boolean` or `number`, if those suffice. For enums, matching, etc, always create a const value at top level, like this:
```ts
// Outside registry
const KIND_MATCH = 0;
const KIND_TUPLE = 1;
/** @param {number} kind */
function allocOnSlab(types, volatile, kind) { }
```
Do *not* write code like this:
```ts
/** @param {string} kind - 'tuple' or 'match' */
function allocOnSlab(types, volatile, kind) { }
```
Always avoid heap allocations when possible. Prefer code duplication over heap allocs. Never allocate strings, arrays, destructured return arguments unless absolutely necessary.
### Comments
Always write meaningful comments about how the code works. Do not insert meaningless section comments. Prefer JSDoc style comments over regular // comments.
### JSDoc
If you can, add correct JSDoc type definitions. Because we "fake" a lot of typescript features, this project is built on javascript and uses jsdoc for type safety, instead of Typescript. That way, we can fully create a virtual API through typescript that fakes the number as a Complex/Type etc.
## Architecture of `boer`
`boer` is a type validation library similar to Zod, Valibot or Ajv, but takes a different architectural approach. It maintains two internal managed heaps of Uint32Arrays, where every incoming type definition is converted to blocks of raw memory onto a SLAB structure, and gives back a user a pointer to that region of memory. The goal of `boer` is to be a truly zero-allocation type validator, faster than ajv, but with the ergonomics of Zod for DSL-like builders, and a small bundle size. It will support instant startup by both supporting a slim AST format, but more importantly in the future maintain its own binary format, that allows you to instantly place the entire memory into the catalog from a binary file. It shall also be 100% compliant with JSON Schema standard.

### The `typedef` pointer in boer
Every `typedef` in `boer` is a javascript number, specifically a 32 bit unsigned integer, but is *shimmed* in Typescript as Type<T,R>, which can either be a Value<T,R> or a Complex<T,R>. Both are actually just raw javascript numbers, but are in reality a raw pointer into managed heap inside the Catalog registry. The lowest bits are reserved for **header bits**, like so:
```ts
const COMPLEX = 1;
const NULLABLE = 2;
const OPTIONAL = 4;
/* Bit 3-31 Payload data */
```
Every typedef pointer can have these 3 bits set. NULLABLE and OPTIONAL mean that the type can be `null` or `undefined`. The COMPLEX bit determines what the payload data contains.
- `boer` allocates individual bits to common **Value** types, such as string, number, integer, boolean, etc. If COMPLEX is 0, bits 3-7 contain primitive bits.
- `boer` has another concept, the COMPLEX type. This is for any type that can not be represented by a single bit, such as Objects, Arrays, Intersects, Unions, Validators and so forth. Then, when the COMPLEX bit is set, the **payload data** in the upper region contains an index to the vtable KINDS.
### The KINDS vtable
Complex pointers point into the KINDS vtable, an Uint32Array. We keep an enum of every different complex kind in `boer`, such as Object, Array, Record and so forth. They are called K_RECORD, K_OBJECT etc. The KINDS vtable **shall** have a stride of 2, like this: [KIND_TYPE,POINTER]
Each different kind maintains its own internal memory buffer, which too is an Uint32Array.

The first entry in the KINDS vtable is called `kind_type`. It **shall** match the bit layout of a `typedef` pointer. But, each region carries different meaning:
- Primitive bit section (8-26): This section matches the primitive bit layout **exactly**. Because, for primitives with a single validator, we inline the types directly into the kinds vtable, and store the validator pointer as the pointer value. For non-primitives, these bits can be utilized to store meta data.
- Lowest bits (0-7). Here, we store the actual kinds_enum data. K_PRIMITIVE has value 0, the other primitives has values in different groups. The lowest bits are the kinds enum, and then we use contextual bit groups to split them up into different logical sections. Such as K_ARRAY and K_RECORD both have exactly one inner type, they belong to the same group.
### The KINDS enum
Each kind has its own registry. The KINDS vtable contains the KIND_TYPE to know which registry to look in, and the REG_INDEX is the index inside that registry. Every registry **shall** have a constant stride of 2, like this: [SLAB_PTR,SLAB_LENGTH]. This contains the pointer into the final storage of `boer`, the SLAB. `boer` maintains two types of slabs: permanent storage, and a Scratchpad-like ephemeral storage.
### The SLAB storage
The SLAB is a big, continuous block of memory, also represented as an Uint32Array. Every KINDS registry **shall** place their data into the slab, and store a PTR and LENGTH to that region in the SLAB. It contains two types: the permanent slab, where objects are stored for the lifetime of the program, and Scratch storage, toggled by the SCRATCH bit in the `typedef` header. The Scratch is a Free-On-Create storage, where a `typedef` only lives until you define a new one. One foundational example is how the OBJECTS registry allocates onto the slab. 
### Example: the OBJECTS slab and the DICTIONARY
So far we have the `COMPLEX typedef` --> KINDS vtable --> OBJECTS registry --> SLAB storage. `boer` converts every string into a `keyId` by using a simple keyseq, that behaves like an SQL auto increment number. Every new string we encounter is given a number id, and we store a two way index, keyId -> key, key -> keyId with two Maps. The OBJECTS store themself sorted in the SLAB by keyId, like so:
[keyId,typeId,keyId,typeId,keyId,typeId]
This allows us to search for keys with binary search and offers several other benefits. To match an incoming simple JSON data payload against an object, we simply loop through that block of memory and test each typeId against the type of incoming data.
### VALIDATORS store
The VALIDATORS work very much like any other complex kind in `boer`. It wraps an inner type with validation data. It consists of a Float64Array, meaning it has full precision for 32 bit unsigned integers, and any other incoming data, such as JSON Schema minLength etc. The VALIDATORS store however never places data onto the main slab. Instead, we maintain a bitwise enum of all possible validator types, and place their payload data sequentially into the VALIDATORS buffer. The bits are sorted, so that validator bits that carry payload come first, and those without come last. To get our index, we use a SWAR popcnt16 algorithm to count number of 1s below our position, and from that can infer which payload index belongs to us.
