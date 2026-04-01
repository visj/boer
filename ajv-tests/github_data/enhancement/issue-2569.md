# [2569] ESM native Ajv support in the (near)future or will it remain commonjs/require based?

It is heavily used library, and with browsers moving more towards native, the require() usage in Ajv becomes invalid.

For example native-federation uses ESM modules through importMaps.
Browser does not support commonJs modules in this case - require() is primarily for nodejs.

The flags in new Ajv() for esm etc do not apply - since the code itself fails to parse before it is executed. It does runtime imports of dependencies.

Right now i use a custom hack where i use esbuild t orecompile the dist/ajv.js, then use a wrapper .msj that reexports the Ajv.
And use the native federation sharing functionality to rewrite the provided code entrypoints for Ajv package.

