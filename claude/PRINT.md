Your task is to implement functionality of the newly created `inspect.js` file. Here is a list of the features we will implement:

## `print(cat)`
The print method takes a catalog as a parameter, and it returns an inspect object. This object consists of two parts:
1. The exact allocated space of every different storage inside the catalog. So, for the SLAB, it gives slabSize, slabCapacity. And then kindSize, kindCapacity, and so forth. This is a top level property in the returned object.
2. The second top level object is instead an **optimized** version. This instead returns a config object (exactly the type of config object the catalog expects), with optimized values.

The motivation is this: by pre-compiling your schemas, you can compute the exact memory you need to allocate, to hold those schemas. In production, you don't allocate a single byte more in the typed arrays than you actually need.

Ideally, you also change the catalog to use these pre-allocated sizes for every top level array buffer. So also for callbacks, constants etc. Add those to the config object.

## `dump(cat)`
This is where it gets interesting. We will offer the catalog to dump itself into a binary format. The idea with dump is that you can call it on the catalog, it creates a binary file, which you then can load instead of bringing and entire AST that you parsed, or even worse, the schemas themself. Here is an outline of how it should work:
Version and identity

Magic bytes — a fixed signature like UVD\0 (4 bytes) so you can immediately reject garbage input
Format version (u16) — the binary layout version, separate from the library version
Library version (3× u16) — major, minor, patch of uvd that produced it, for compatibility warnings

Typed array regions
For each of SLAB, KINDS, VALIDATORS you need:

Byte offset from start of file (u32)
Element count (u32) — not byte length, element count, so the loader knows how many elements to expect

String table (KEY_DICT / KEY_INDEX)

Byte offset (u32)
Entry count (u32)
The string table itself is probably length-prefixed UTF-8 strings packed sequentially

Regex manifest

Byte offset (u32)
Entry count (u32)
Each entry: pattern as length-prefixed UTF-8 string + flags byte (for the u flag etc.)

Constants / Enums

Byte offset (u32)
Entry count for CONSTANTS (u32)
Entry count for ENUMS (u32)
Serialized as JSON or a compact tagged format — these are arbitrary JS values so you need type tags (null, boolean, string, number, bigint)

Callbacks

Just a count (u32) — not serialized, but the loader uses this to verify the user re-registered exactly the right number of callbacks in the right order

Flags

A u32 flags word for things like: is this a strict/frozen catalog, any future boolean options

Alignment and checksum

Padding to align typed arrays on their natural boundary (Float64Array needs 8-byte alignment)
Optional CRC32 or xxHash of the payload (u32) — lets you detect corruption without fully parsing

So the rough header structure in order:
[0]  magic         4 bytes   "UVD\0"
[4]  fmt_version   2 bytes   binary format version
[6]  lib_major     2 bytes
[8]  lib_minor     2 bytes
[10] lib_patch     2 bytes
[12] flags         4 bytes
[16] checksum      4 bytes   CRC32 of everything after header
[20] slab_offset   4 bytes   byte offset from file start
[24] slab_count    4 bytes   element count
[28] slab_width    1 byte    bytes per element (4 for Uint32)
[29] _pad          3 bytes
[32] kinds_offset  4 bytes
[36] kinds_count   4 bytes
[40] kinds_width   1 byte
[41] _pad          3 bytes
[44] vals_offset   4 bytes
[48] vals_count    4 bytes
[52] vals_width    1 byte    always 8 (Float64)
[53] _pad          3 bytes
[56] strtab_offset 4 bytes
[60] strtab_count  4 bytes
[64] regex_offset  4 bytes
[68] regex_count   4 bytes
[72] const_offset  4 bytes
[76] const_count   4 bytes
[80] enum_offset   4 bytes
[84] enum_count    4 bytes
[88] callback_count 4 bytes  validation only, not serialized
[92] _pad          4 bytes   align to 16 bytes
[96] --- end of header, typed array data follows ---
96 bytes for the header is clean and everything after is naturally aligned if you lay the arrays out in descending alignment order: Float64Array first (8-byte aligned), then Uint32Arrays (4-byte aligned), then the string/regex/constant blobs.